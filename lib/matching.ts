import { calculateDistanceKm, formatDistance } from "./location";

export interface WorkerMatchProfile {
  skills: string[];
  latitude?: number | null;
  longitude?: number | null;
  preferredDistance?: number;
  availability?: string | null;
  experience?: string | null;
  rating?: number;
  completedJobs?: number;
}

export interface JobMatchDetails {
  requiredSkills: string[];
  latitude?: number | null;
  longitude?: number | null;
  jobType?: string;
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface MatchResult {
  score: number; // 0 to 100
  reasons: string[];
  components: {
    skillScore: number;
    locationScore: number;
    availabilityScore: number;
    experienceScore: number;
    reputationScore: number;
  };
  distanceKm: number | null;
}

export function calculateMatchScore(
  worker: WorkerMatchProfile,
  job: JobMatchDetails
): MatchResult {
  const reasons: string[] = [];

  // 1. Skill Match Score (40%)
  let skillScore = 0;
  const workerSkillsLower = worker.skills.map((s) => s.toLowerCase().trim());
  const jobSkills = job.requiredSkills || [];

  if (jobSkills.length === 0) {
    skillScore = 80;
    reasons.push("General role with flexible skill requirements");
  } else {
    let matchedCount = 0;
    for (const reqSkill of jobSkills) {
      const reqLower = reqSkill.toLowerCase().trim();
      const hasMatch = workerSkillsLower.some(
        (ws) => ws.includes(reqLower) || reqLower.includes(ws)
      );
      if (hasMatch) matchedCount++;
    }

    skillScore = Math.round((matchedCount / jobSkills.length) * 100);
    if (matchedCount > 0) {
      reasons.push(`${matchedCount}/${jobSkills.length} required skills matched`);
    } else {
      reasons.push("Skill overlap is low; willingness to learn valued");
    }
  }

  // 2. Location Proximity Score (20%)
  let locationScore = 60; // Default when coordinates missing
  const distance = calculateDistanceKm(
    worker.latitude,
    worker.longitude,
    job.latitude,
    job.longitude
  );

  if (distance !== null) {
    const maxRadius = worker.preferredDistance || 15;
    if (distance <= 2) {
      locationScore = 100;
      reasons.push(`${formatDistance(distance)} (Extremely close by)`);
    } else if (distance <= 5) {
      locationScore = 90;
      reasons.push(`${formatDistance(distance)} (Quick commute)`);
    } else if (distance <= maxRadius) {
      locationScore = Math.max(50, Math.round(100 - (distance / maxRadius) * 40));
      reasons.push(`${formatDistance(distance)} (Within your preferred radius)`);
    } else {
      locationScore = Math.max(20, Math.round(50 - ((distance - maxRadius) / 10) * 10));
      reasons.push(`${formatDistance(distance)} (Outside typical radius)`);
    }
  } else {
    reasons.push("Location distance approximate");
  }

  // 3. Availability Score (15%)
  let availabilityScore = 75;
  const avail = (worker.availability || "").toLowerCase();
  const jobType = (job.jobType || "").toLowerCase();

  if (avail.includes("flexible") || avail.includes("full-time") || avail.includes("immediate")) {
    availabilityScore = 100;
    reasons.push("Available immediately for requested schedule");
  } else if (jobType.includes("part_time") || jobType.includes("gig")) {
    availabilityScore = 90;
    reasons.push("Shift fits part-time / gig availability");
  } else {
    availabilityScore = 70;
  }

  // 4. Experience Score (15%)
  let experienceScore = 60;
  const exp = (worker.experience || "").toLowerCase();
  const completed = worker.completedJobs || 0;

  if (completed >= 5 || exp.includes("year") || exp.includes("experienced")) {
    experienceScore = 95;
    reasons.push("Proven prior experience & verified work track record");
  } else if (completed >= 1 || exp.length > 10) {
    experienceScore = 80;
    reasons.push("Relevant practical experience reported");
  } else {
    experienceScore = 65;
    reasons.push("Entry-level friendly opportunity");
  }

  // 5. Rating & Reputation Score (10%)
  let reputationScore = 70;
  const rating = worker.rating || 0;
  if (rating >= 4.5) {
    reputationScore = 100;
    reasons.push(`Top-rated worker (${rating.toFixed(1)} ★ reputation)`);
  } else if (rating >= 3.5) {
    reputationScore = 85;
    reasons.push(`Good community rating (${rating.toFixed(1)} ★)`);
  } else if (rating > 0) {
    reputationScore = 70;
  } else {
    reputationScore = 75; // New workers start with neutral positive score
  }

  // Weighted sum
  const finalScore = Math.round(
    0.4 * skillScore +
      0.2 * locationScore +
      0.15 * availabilityScore +
      0.15 * experienceScore +
      0.1 * reputationScore
  );

  return {
    score: Math.min(99, Math.max(25, finalScore)), // Bound within realistic bounds
    reasons,
    components: {
      skillScore,
      locationScore,
      availabilityScore,
      experienceScore,
      reputationScore,
    },
    distanceKm: distance,
  };
}
