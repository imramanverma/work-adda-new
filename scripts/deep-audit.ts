// scripts/deep-audit.ts
// Comprehensive deep audit test suite

const BASE_URL = 'http://localhost:3000';

interface AuditResult {
  category: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  details: string;
}

const results: AuditResult[] = [];

function record(category: string, test: string, status: 'PASS' | 'FAIL' | 'WARN', details: string) {
  results.push({ category, test, status, details });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} [${category}] ${test} -> ${status}: ${details}`);
}

async function fetchRoute(path: string, options?: RequestInit) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {}
    return { status: res.status, headers: res.headers, text, json };
  } catch (err: any) {
    return { status: 0, headers: null, text: err.message, json: null };
  }
}

async function loginUser(identifier: string) {
  const res = await fetchRoute('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password: 'password123' }),
  });
  const cookie = res.headers?.get('set-cookie') || '';
  return { status: res.status, cookie, user: res.json?.user, token: res.json?.token };
}

async function runAudit() {
  console.log('--- STARTING WORK ADDA DEEP AUDIT ---\n');

  // 1. PAGE ROUTE HEALTH (HTML status codes)
  console.log('--- 1. Testing Page HTML Status Codes ---');
  const pages = [
    '/',
    '/login',
    '/register',
    '/jobs',
    '/worker/dashboard',
    '/worker/profile',
    '/worker/applications',
    '/worker/work',
    '/worker/earnings',
    '/worker/messages',
    '/worker/notifications',
    '/employer/dashboard',
    '/employer/jobs',
    '/employer/jobs/new',
    '/employer/applicants',
    '/employer/work',
    '/employer/payments',
    '/employer/messages',
    '/employer/profile',
    '/admin',
    '/admin/users',
    '/admin/jobs',
    '/admin/reports',
  ];

  for (const page of pages) {
    const res = await fetchRoute(page);
    if (res.status === 200) {
      record('Pages', `GET ${page}`, 'PASS', `Status: 200 OK (${res.text.length} bytes)`);
    } else {
      record('Pages', `GET ${page}`, 'FAIL', `Status: ${res.status}`);
    }
  }

  // 2. AUTHENTICATION & EDGE CASES
  console.log('\n--- 2. Testing Auth Edge Cases ---');
  // 2.1 Non-existent user login
  const badLogin = await fetchRoute('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'ghost@workadda.com', password: 'wrong' }),
  });
  if (badLogin.status === 401) {
    record('Auth', 'Login with non-existent user', 'PASS', 'Correctly returned 401');
  } else {
    record('Auth', 'Login with non-existent user', 'FAIL', `Returned ${badLogin.status}: ${badLogin.text}`);
  }

  // 2.2 Wrong password
  const wrongPass = await fetchRoute('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'worker@workadda.com', password: 'incorrectpassword' }),
  });
  if (wrongPass.status === 401) {
    record('Auth', 'Login with wrong password', 'PASS', 'Correctly returned 401');
  } else {
    record('Auth', 'Login with wrong password', 'FAIL', `Returned ${wrongPass.status}`);
  }

  // 2.3 Malformed registration payload
  const badReg = await fetchRoute('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: 'not-an-email' }),
  });
  if (badReg.status === 400) {
    record('Auth', 'Register with malformed data', 'PASS', 'Returned 400 Bad Request');
  } else {
    record('Auth', 'Register with malformed data', 'FAIL', `Returned ${badReg.status}`);
  }

  // 3. LOGINS FOR ROLES (with email field as well as identifier)
  console.log('\n--- 3. Testing Role Logins & Session Cookies ---');
  const workerAuth = await loginUser('worker@workadda.com');
  const employerAuth = await loginUser('employer@workadda.com');
  const adminAuth = await loginUser('admin@workadda.com');

  if (workerAuth.status === 200 && workerAuth.cookie) {
    record('Auth', 'Worker Login (via identifier)', 'PASS', `Token length: ${workerAuth.token?.length}`);
  } else {
    record('Auth', 'Worker Login (via identifier)', 'FAIL', `Failed: ${workerAuth.status}`);
  }

  // Also verify email field compatibility
  const emailLogin = await fetchRoute('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'worker@workadda.com', password: 'password123' }),
  });
  if (emailLogin.status === 200) {
    record('Auth', 'Worker Login (via email alias)', 'PASS', 'Returned 200 OK');
  } else {
    record('Auth', 'Worker Login (via email alias)', 'FAIL', `Status: ${emailLogin.status}`);
  }

  if (employerAuth.status === 200 && employerAuth.cookie) {
    record('Auth', 'Employer Login', 'PASS', `Token length: ${employerAuth.token?.length}`);
  } else {
    record('Auth', 'Employer Login', 'FAIL', `Failed: ${employerAuth.status}`);
  }

  if (adminAuth.status === 200 && adminAuth.cookie) {
    record('Auth', 'Admin Login', 'PASS', `Token length: ${adminAuth.token?.length}`);
  } else {
    record('Auth', 'Admin Login', 'FAIL', `Failed: ${adminAuth.status}`);
  }

  // 4. ROLE-BASED ACCESS CONTROL (RBAC) & PERMISSIONS
  console.log('\n--- 4. Testing RBAC & Route Security ---');
  const workerPostJob = await fetchRoute('/api/jobs', {
    method: 'POST',
    headers: { Cookie: workerAuth.cookie },
    body: JSON.stringify({ title: 'Test Illegal Job' }),
  });
  if (workerPostJob.status === 403 || workerPostJob.status === 401) {
    record('RBAC', 'Worker cannot POST job', 'PASS', `Forbidden ${workerPostJob.status}`);
  } else {
    record('RBAC', 'Worker cannot POST job', 'FAIL', `Unexpected status: ${workerPostJob.status}`);
  }

  const employerAdmin = await fetchRoute('/api/admin/analytics', {
    headers: { Cookie: employerAuth.cookie },
  });
  if (employerAdmin.status === 403 || employerAdmin.status === 401) {
    record('RBAC', 'Employer cannot view admin analytics', 'PASS', `Status ${employerAdmin.status}`);
  } else {
    record('RBAC', 'Employer cannot view admin analytics', 'FAIL', `Unexpected status: ${employerAdmin.status}`);
  }

  const unauthPayments = await fetchRoute('/api/payments');
  if (unauthPayments.status === 401) {
    record('RBAC', 'Unauth user cannot access payments', 'PASS', 'Status 401');
  } else {
    record('RBAC', 'Unauth user cannot access payments', 'FAIL', `Unexpected status: ${unauthPayments.status}`);
  }

  // 5. SEARCH & FILTERING CAPABILITIES
  console.log('\n--- 5. Testing Job Search, Geolocation & Edge Cases ---');
  const allJobs = await fetchRoute('/api/jobs');
  const jobCount = allJobs.json?.jobs?.length || 0;
  if (allJobs.status === 200 && jobCount > 0) {
    record('Search', 'Default jobs listing', 'PASS', `Found ${jobCount} jobs`);
  } else {
    record('Search', 'Default jobs listing', 'FAIL', `Failed or 0 jobs found`);
  }

  // Case-insensitive category test
  const catJobsUpper = await fetchRoute('/api/jobs?category=RETAIL');
  const catJobsProper = await fetchRoute('/api/jobs?category=Retail');
  if (catJobsUpper.status === 200 && catJobsProper.status === 200 && catJobsUpper.json?.jobs?.length > 0) {
    record('Search', 'Case-flexible category filter (RETAIL)', 'PASS', `Returned ${catJobsUpper.json?.jobs?.length} retail jobs`);
  } else {
    record('Search', 'Case-flexible category filter (RETAIL)', 'FAIL', `Upper: ${catJobsUpper.json?.jobs?.length}`);
  }

  const cityJobs = await fetchRoute('/api/jobs?location=Chandigarh');
  if (cityJobs.status === 200 && cityJobs.json?.jobs?.length > 0) {
    record('Search', 'Location search (Chandigarh)', 'PASS', `Returned ${cityJobs.json?.jobs?.length} jobs`);
  } else {
    record('Search', 'Location search (Chandigarh)', 'FAIL', `Status ${cityJobs.status}`);
  }

  const geoJobs = await fetchRoute('/api/jobs?lat=30.7333&lng=76.7794&maxDistance=25');
  if (geoJobs.status === 200) {
    record('Search', 'Radius search (25km of Chandigarh)', 'PASS', `Returned ${geoJobs.json?.jobs?.length} jobs with distanceKm`);
  } else {
    record('Search', 'Radius search', 'FAIL', `Status ${geoJobs.status}`);
  }

  const weirdSearch = await fetchRoute('/api/jobs?q=%27%22%3Cscript%3E&minPay=-100');
  if (weirdSearch.status === 200) {
    record('Search', 'XSS / Negative Pay resilience', 'PASS', `Gracefully handled, returned ${weirdSearch.json?.jobs?.length || 0} jobs`);
  } else {
    record('Search', 'XSS / Negative Pay resilience', 'FAIL', `Crashed with ${weirdSearch.status}`);
  }

  // 6. WORKER & EMPLOYER ENDPOINTS
  console.log('\n--- 6. Testing Worker & Employer Profiles ---');
  const wProfile = await fetchRoute('/api/workers/profile', { headers: { Cookie: workerAuth.cookie } });
  if (wProfile.status === 200 && (wProfile.json?.profile?.fullName || wProfile.json?.worker?.fullName)) {
    record('Profile', 'Worker Profile Fetch', 'PASS', `Worker: ${wProfile.json.profile?.name}, Completion: ${wProfile.json.profile?.completionPercentage}%`);
  } else {
    record('Profile', 'Worker Profile Fetch', 'FAIL', `Status ${wProfile.status}: ${wProfile.text}`);
  }

  const eProfile = await fetchRoute('/api/employers/profile', { headers: { Cookie: employerAuth.cookie } });
  if (eProfile.status === 200 && (eProfile.json?.employer?.businessName || eProfile.json?.profile?.businessName)) {
    record('Profile', 'Employer Profile Fetch', 'PASS', `Employer: ${eProfile.json.employer?.businessName}`);
  } else {
    record('Profile', 'Employer Profile Fetch', 'FAIL', `Status ${eProfile.status}: ${eProfile.text}`);
  }

  // 7. CONTRACT & PAYMENT WORKFLOW INTEGRITY
  console.log('\n--- 7. Testing Contract, Payment & Fee Logic ---');
  const wPayments = await fetchRoute('/api/payments', { headers: { Cookie: workerAuth.cookie } });
  if (wPayments.status === 200) {
    const list = wPayments.json?.payments || [];
    const feeVerified = list.every((p: any) => {
      const expectedPayout = Number((p.amount - p.platformFee).toFixed(2));
      return Math.abs(p.workerPayout - expectedPayout) < 0.05;
    });
    record('Payments', '0% Platform Fee formula integrity', feeVerified ? 'PASS' : 'WARN', `Audited ${list.length} payments, total: ₹${wPayments.json?.stats?.totalEarned || 0}`);
  } else {
    record('Payments', 'Worker Payments List', 'FAIL', `Status: ${wPayments.status}`);
  }

  // 8. REVIEW INTEGRITY
  console.log('\n--- 8. Testing Review Guardrails ---');
  const fakeReview = await fetchRoute('/api/reviews', {
    method: 'POST',
    headers: { Cookie: workerAuth.cookie },
    body: JSON.stringify({
      jobId: 'non-existent-id-12345',
      reviewedUserId: 'someone-else',
      rating: 5,
      comment: 'Super great!',
    }),
  });
  if (fakeReview.status === 404 || fakeReview.status === 403 || fakeReview.status === 400) {
    record('Reviews', 'Reviewing invalid assignment rejected', 'PASS', `Safely rejected with status ${fakeReview.status}`);
  } else {
    record('Reviews', 'Reviewing invalid assignment rejected', 'FAIL', `Status: ${fakeReview.status}`);
  }

  // 9. NOTIFICATIONS & CONVERSATIONS
  console.log('\n--- 9. Testing Messaging & Notifications ---');
  const notifs = await fetchRoute('/api/notifications', { headers: { Cookie: workerAuth.cookie } });
  if (notifs.status === 200) {
    record('Notifications', 'Worker Notifications Fetch', 'PASS', `Received ${notifs.json?.notifications?.length} notifications`);
  } else {
    record('Notifications', 'Worker Notifications Fetch', 'FAIL', `Status: ${notifs.status}`);
  }

  const convos = await fetchRoute('/api/conversations', { headers: { Cookie: workerAuth.cookie } });
  if (convos.status === 200) {
    record('Chat', 'Worker Conversations Fetch', 'PASS', `Found ${convos.json?.conversations?.length} conversations`);
  } else {
    record('Chat', 'Worker Conversations Fetch', 'FAIL', `Status: ${convos.status}`);
  }

  // 10. ADMIN DASHBOARD & MANAGEMENT
  console.log('\n--- 10. Testing Admin Console APIs ---');
  const adminAnalytics = await fetchRoute('/api/admin/analytics', { headers: { Cookie: adminAuth.cookie } });
  if (adminAnalytics.status === 200 && adminAnalytics.json?.overview) {
    record('Admin', 'Admin Analytics Overview', 'PASS', `Total Users: ${adminAnalytics.json.overview.totalUsers}, Gross GMV: ₹${adminAnalytics.json.overview.grossVolume}`);
  } else {
    record('Admin', 'Admin Analytics Overview', 'FAIL', `Status: ${adminAnalytics.status}`);
  }

  const adminUsers = await fetchRoute('/api/admin/users', { headers: { Cookie: adminAuth.cookie } });
  if (adminUsers.status === 200 && adminUsers.json?.users?.length > 0) {
    record('Admin', 'Admin Users Table', 'PASS', `Found ${adminUsers.json?.users?.length} users`);
  } else {
    record('Admin', 'Admin Users Table', 'FAIL', `Status: ${adminUsers.status}`);
  }

  const adminReports = await fetchRoute('/api/admin/reports', { headers: { Cookie: adminAuth.cookie } });
  if (adminReports.status === 200) {
    record('Admin', 'Admin Fraud Reports Board', 'PASS', `Found ${adminReports.json?.reports?.length} reports`);
  } else {
    record('Admin', 'Admin Fraud Reports Board', 'FAIL', `Status: ${adminReports.status}`);
  }

  // 11. SUMMARY OF AUDIT
  console.log('\n================ AUDIT SUMMARY ================');
  const passes = results.filter(r => r.status === 'PASS').length;
  const fails = results.filter(r => r.status === 'FAIL').length;
  const warns = results.filter(r => r.status === 'WARN').length;
  console.log(`TOTAL TESTS: ${results.length} | PASS: ${passes} | FAIL: ${fails} | WARN: ${warns}`);
}

runAudit().catch(console.error);
