export interface SubcategoryItem {
  id: string;
  name: string;
  nameHi: string;
  description?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  nameHi: string;
  icon: string;
  emoji: string;
  subcategories: SubcategoryItem[];
  color: string;
  bg: string;
  border: string;
}

export const WORKADDA_CATEGORIES: CategoryItem[] = [
  {
    id: "Academic & Assignment Work",
    name: "Assignment & Academic Work",
    nameHi: "असाइनमेंट व शैक्षणिक कार्य",
    icon: "BookOpen",
    emoji: "📚",
    color: "text-blue-700",
    bg: "from-blue-500/10 to-indigo-500/5",
    border: "hover:border-blue-300",
    subcategories: [
      { id: "Assignment Writing", name: "Assignment Writing", nameHi: "असाइनमेंट लेखन" },
      { id: "Project Report Writing", name: "Project Report Writing", nameHi: "प्रोजेक्ट रिपोर्ट लेखन" },
      { id: "Practical File Writing", name: "Practical File Writing", nameHi: "प्रैक्टिकल फाइल कार्य" },
      { id: "Record File Writing", name: "Record File Writing", nameHi: "रिकॉर्ड फाइल लेखन" },
      { id: "Notes Writing", name: "Notes Writing", nameHi: "नोट्स लेखन" },
      { id: "Handwritten Assignment", name: "Handwritten Assignment", nameHi: "हस्तलिखित असाइनमेंट" },
      { id: "Typed Assignment", name: "Typed Assignment", nameHi: "टाइप किया गया असाइनमेंट" },
      { id: "PPT/Presentation Making", name: "PPT / Presentation Making", nameHi: "पीपीटी व प्रेजेंटेशन निर्माण" },
      { id: "Research Work", name: "Research Work", nameHi: "शोध व रिसर्च कार्य" },
      { id: "Data Collection", name: "Data Collection", nameHi: "डेटा संग्रह" },
      { id: "Documentation", name: "Documentation", nameHi: "डॉक्यूमेंटेशन" },
      { id: "Resume/CV Making", name: "Resume / CV Making", nameHi: "रिज्यूमे व सीवी निर्माण" },
      { id: "College Project Assistance", name: "College Project Assistance", nameHi: "कॉलेज प्रोजेक्ट सहायता" },
      { id: "School Project Assistance", name: "School Project Assistance", nameHi: "स्कूल प्रोजेक्ट सहायता" },
      { id: "Question Paper Typing", name: "Question Paper Typing", nameHi: "प्रश्न पत्र टाइपिंग" },
      { id: "PDF to Word", name: "PDF to Word Conversion", nameHi: "पीडीएफ से वर्ड रूपांतरण" },
      { id: "Word Formatting", name: "Word Formatting", nameHi: "वर्ड फॉर्मेटिंग" },
      { id: "Excel Data Entry", name: "Excel Data Entry", nameHi: "एक्सेल डेटा एंट्री" },
      { id: "Other Academic Work", name: "Other Academic Work", nameHi: "अन्य शैक्षणिक कार्य" },
    ],
  },
  {
    id: "Local Business Jobs",
    name: "Local Business & Retail Jobs",
    nameHi: "स्थानीय दुकान व व्यवसाय",
    icon: "Store",
    emoji: "🏪",
    color: "text-emerald-700",
    bg: "from-emerald-500/10 to-teal-500/5",
    border: "hover:border-emerald-300",
    subcategories: [
      { id: "Shop Helper", name: "Shop Helper", nameHi: "दुकान सहायक" },
      { id: "Salesperson", name: "Counter Salesperson", nameHi: "काउंटर सेल्समैन" },
      { id: "Cashier", name: "Cashier & Billing", nameHi: "कैशियर व बिलिंग" },
      { id: "Stock Manager", name: "Stock / Inventory Manager", nameHi: "स्टॉक व इन्वेंट्री मैनेजर" },
      { id: "Warehouse Worker", name: "Warehouse Worker", nameHi: "गोदाम कर्मचारी" },
      { id: "Packing", name: "Order Packing", nameHi: "ऑर्डर पैकिंग" },
      { id: "Loading/Unloading", name: "Loading / Unloading", nameHi: "लोडिंग व अनलोडिंग" },
      { id: "Retail", name: "Store Operations", nameHi: "दुकान संचालन" },
    ],
  },
  {
    id: "Digital Work",
    name: "Digital & Computer Work",
    nameHi: "डिजिटल व कंप्यूटर कार्य",
    icon: "Laptop",
    emoji: "💻",
    color: "text-cyan-700",
    bg: "from-cyan-500/10 to-blue-500/5",
    border: "hover:border-cyan-300",
    subcategories: [
      { id: "Data Entry", name: "Data Entry & Processing", nameHi: "डेटा एंट्री व प्रोसेसिंग" },
      { id: "Excel", name: "Excel Sheets & Formulas", nameHi: "एक्सेल शीट्स" },
      { id: "Word", name: "Word & Document Typing", nameHi: "वर्ड टाइपिंग" },
      { id: "Graphic Design", name: "Graphic & Social Media Design", nameHi: "ग्राफिक डिजाइनिंग" },
      { id: "Video Editing", name: "Video Editing & Reels", nameHi: "वीडियो एडिटिंग" },
      { id: "Photo Editing", name: "Photo Retouching & Editing", nameHi: "फोटो एडिटिंग" },
      { id: "Website Work", name: "Website Maintenance / Coding", nameHi: "वेबसाइट कार्य" },
      { id: "Social Media", name: "Social Media Management", nameHi: "सोशल मीडिया प्रबंधन" },
      { id: "Content Writing", name: "Content & Copywriting", nameHi: "कंटेंट लेखन" },
    ],
  },
  {
    id: "Delivery & Errands",
    name: "Delivery & Errands",
    nameHi: "डिलीवरी व आवाजाही कार्य",
    icon: "Bike",
    emoji: "🛵",
    color: "text-amber-700",
    bg: "from-amber-500/10 to-orange-500/5",
    border: "hover:border-amber-300",
    subcategories: [
      { id: "Local Delivery", name: "Local Parcel Delivery", nameHi: "लोकल पार्सल डिलीवरी" },
      { id: "Parcel Pickup", name: "Parcel / Package Pickup", nameHi: "पार्सल पिकअप" },
      { id: "Grocery Pickup", name: "Grocery & Market Pickup", nameHi: "किराना व बाजार खरीदारी" },
      { id: "Document Delivery", name: "Document / File Delivery", nameHi: "दस्तावेज डिलीवरी" },
      { id: "Personal Errands", name: "Personal Errands & Tasks", nameHi: "व्यक्तिगत छोटे कार्य" },
      { id: "Delivery", name: "General Courier & Dispatch", nameHi: "सामान्य कूरियर" },
    ],
  },
  {
    id: "Skilled Work",
    name: "Skilled Trades & Repairs",
    nameHi: "कुशल कारीगर व मरम्मत",
    icon: "Wrench",
    emoji: "🔧",
    color: "text-orange-700",
    bg: "from-orange-500/10 to-red-500/5",
    border: "hover:border-orange-300",
    subcategories: [
      { id: "Electrician", name: "Electrician & Wiring", nameHi: "इलेक्ट्रीशियन व बिजली" },
      { id: "Plumber", name: "Plumber & Pipe Fitting", nameHi: "प्लंबर व पाइप फिटिंग" },
      { id: "Carpenter", name: "Carpenter & Woodwork", nameHi: "बढ़ई व लकड़ी कार्य" },
      { id: "AC Technician", name: "AC & Refrigeration Repair", nameHi: "एसी व फ्रिज मरम्मत" },
      { id: "Mobile Repair", name: "Mobile Phone Repair", nameHi: "मोबाइल रिपेयर" },
      { id: "Computer Repair", name: "Computer & Laptop Repair", nameHi: "कंप्यूटर व लैपटॉप रिपेयर" },
      { id: "Mechanic", name: "Two-Wheeler / Car Mechanic", nameHi: "मैकेनिक" },
      { id: "Repair & Maintenance", name: "General Maintenance", nameHi: "सामान्य मरम्मत" },
    ],
  },
  {
    id: "Household Services",
    name: "Household & Event Help",
    nameHi: "घरेलू व इवेंट सेवाएं",
    icon: "Home",
    emoji: "🏠",
    color: "text-rose-700",
    bg: "from-rose-500/10 to-pink-500/5",
    border: "hover:border-rose-300",
    subcategories: [
      { id: "Cleaning", name: "Deep Cleaning & Housekeeping", nameHi: "सफाई व हाउसकीपिंग" },
      { id: "Cooking", name: "Cooking & Meal Prep", nameHi: "खाना पकाना" },
      { id: "Gardening", name: "Gardening & Plant Care", nameHi: "बागवानी" },
      { id: "Moving Assistance", name: "Moving & Shifting Helper", nameHi: "सामान शिफ्टिंग" },
      { id: "Event Help", name: "Event Setup & Hospitality Helper", nameHi: "इवेंट सेटअप व सहायता" },
      { id: "Hospitality", name: "Catering & Serving", nameHi: "कैटरिंग व सर्विंग" },
    ],
  },
  {
    id: "Creative Work",
    name: "Creative & Media Work",
    nameHi: "रचनात्मक व मीडिया कार्य",
    icon: "Palette",
    emoji: "🎨",
    color: "text-purple-700",
    bg: "from-purple-500/10 to-fuchsia-500/5",
    border: "hover:border-purple-300",
    subcategories: [
      { id: "Photography", name: "Photography / Event Shoots", nameHi: "फोटोग्राफी" },
      { id: "Videography", name: "Videography & Shooting", nameHi: "वीडियोग्राफी" },
      { id: "Poster Design", name: "Poster & Banner Design", nameHi: "पोस्टर व बैनर" },
      { id: "Logo Design", name: "Logo & Brand Identity", nameHi: "लोगो डिजाइन" },
      { id: "Invitation Design", name: "Wedding / Event Cards", nameHi: "निमंत्रण पत्र डिजाइन" },
      { id: "Editing", name: "Audio / Video Editing", nameHi: "ऑडियो व वीडियो एडिटिंग" },
    ],
  },
  {
    id: "Tutoring & Education",
    name: "Tutoring & Education",
    nameHi: "ट्यूशन व शिक्षण",
    icon: "GraduationCap",
    emoji: "🎓",
    color: "text-emerald-800",
    bg: "from-emerald-500/10 to-green-500/5",
    border: "hover:border-emerald-300",
    subcategories: [
      { id: "School Tutor", name: "School Classes (1st-10th)", nameHi: "स्कूल ट्यूटर (1ली-10वीं)" },
      { id: "College Tutor", name: "11th, 12th & College Subjects", nameHi: "11वीं-12वीं व कॉलेज ट्यूशन" },
      { id: "Coding Tutor", name: "Coding & Computer Science", nameHi: "कोडिंग व कंप्यूटर ट्यूटर" },
      { id: "Language Tutor", name: "English / Spoken Language", nameHi: "भाषा व अंग्रेजी ट्यूशन" },
      { id: "Exam Preparation", name: "Competitive Exam Prep", nameHi: "प्रतियोगी परीक्षा तैयारी" },
      { id: "Education", name: "General Mentorship", nameHi: "सामान्य मार्गदर्शन" },
    ],
  },
  {
    id: "Professional & Freelance",
    name: "Professional & Freelance Tasks",
    nameHi: "पेशेवर व फ्रीलांस कार्य",
    icon: "Briefcase",
    emoji: "🧑‍💼",
    color: "text-indigo-700",
    bg: "from-indigo-500/10 to-purple-500/5",
    border: "hover:border-indigo-300",
    subcategories: [
      { id: "Resume Making", name: "Professional Resume & LinkedIn", nameHi: "प्रोफेशनल रिज्यूमे" },
      { id: "Documentation", name: "Official Form Filling & Doc Prep", nameHi: "फॉर्म भरना व दस्तावेज" },
      { id: "Research Assistance", name: "Research & Market Survey", nameHi: "रिसर्च व मार्केट सर्वे" },
      { id: "Presentation", name: "Investor / Business Deck", nameHi: "बिजनेस प्रेजेंटेशन" },
      { id: "Virtual Assistant", name: "Virtual / Remote Assistant", nameHi: "वर्चुअल असिस्टेंट" },
      { id: "Customer Support", name: "Telecalling & Support", nameHi: "टेलीकॉल्लिंग व सपोर्ट" },
    ],
  },
  {
    id: "Other",
    name: "Other Tasks & Gigs",
    nameHi: "अन्य कार्य व गिग्स",
    icon: "Sparkles",
    emoji: "➕",
    color: "text-slate-700",
    bg: "from-slate-500/10 to-slate-500/5",
    border: "hover:border-slate-300",
    subcategories: [
      { id: "Custom Work", name: "Custom Task (Specify in Description)", nameHi: "कस्टम कार्य" },
      { id: "General Labour", name: "General Assistance", nameHi: "सामान्य सहायता" },
    ],
  },
];

export const ACADEMIC_LEVELS = [
  { id: "School", label: "School (Up to 10th)", labelHi: "स्कूल (10वीं तक)" },
  { id: "11th/12th", label: "11th / 12th Senior Secondary", labelHi: "11वीं / 12वीं" },
  { id: "Diploma", label: "Polytechnic / Diploma", labelHi: "डिप्लोमा" },
  { id: "Undergraduate", label: "Undergraduate (B.Tech, B.Com, B.Sc, BA, etc.)", labelHi: "स्नातक (UG)" },
  { id: "Postgraduate", label: "Postgraduate (M.Tech, MBA, M.Sc, MA, etc.)", labelHi: "परास्नातक (PG)" },
  { id: "Competitive Exam", label: "Competitive Exam / Coaching", labelHi: "प्रतियोगी परीक्षा" },
  { id: "Other", label: "Other Level", labelHi: "अन्य स्तर" },
];

export const POPULAR_SUBJECTS = [
  "DBMS (Database Management)",
  "Computer Science / IT",
  "Java",
  "Python",
  "Web Development",
  "Data Structures & Algorithms",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Engineering (Civil / Mech / Electrical)",
  "Business Management (MBA / BBA)",
  "Economics",
  "Accountancy & Commerce",
  "English Literature & Grammar",
  "Hindi",
  "Punjabi",
  "Political Science",
  "History & Geography",
  "Law & Legal Studies",
  "Psychology & Sociology",
  "Pharmacy & Nursing",
  "Environmental Studies",
  "General Knowledge",
  "Other Subject",
];

export const ASSIGNMENT_TYPES = [
  { id: "Handwritten", label: "Handwritten", labelHi: "हस्तलिखित" },
  { id: "Typed", label: "Typed Digital Document", labelHi: "कंप्यूटर टाइप्ड" },
  { id: "Both", label: "Both (Handwritten & Typed)", labelHi: "दोनों (हाथ से व टाइप)" },
];

export const ASSIGNMENT_LANGUAGES = [
  { id: "English", label: "English" },
  { id: "Hindi", label: "Hindi (हिंदी)" },
  { id: "Punjabi", label: "Punjabi (ਪੰਜਾਬੀ)" },
  { id: "Other", label: "Other" },
];

export const PAPER_REQUIREMENTS = [
  "A4 Loose Sheets",
  "Notebook / Register Pages",
  "Assignment Sheet / Practical File Sheet",
  "College Branded Sheets",
  "Any Standard Paper",
];

export const FILE_FORMATS = [
  "PDF (.pdf)",
  "Word (.docx)",
  "PowerPoint (.pptx)",
  "Excel (.xlsx)",
  "Google Docs Link",
  "Image Scan (JPG/PNG)",
];

export const DELIVERY_METHODS = [
  { id: "DIGITAL_UPLOAD", label: "Digital Upload (PDF / Scanned Copy)", labelHi: "डिजिटल अपलोड (पीडीएफ या स्कैन)" },
  { id: "PHYSICAL_DELIVERY", label: "Physical Handover / Courier", labelHi: "भौतिक डिलीवरी / कूरियर" },
  { id: "PICKUP", label: "Pickup by Hirer", labelHi: "कामदाता द्वारा पिकअप" },
  { id: "LOCAL_DELIVERY", label: "Local Drop-off", labelHi: "लोकल ड्रॉप-ऑफ" },
  { id: "ONLINE_SUBMISSION", label: "Direct Online Submission to Portal", labelHi: "सीधे पोर्टल पर सबमिशन" },
];

export const PRICING_TYPES = [
  { id: "PER_PAGE", label: "Per Page (₹/page)", labelHi: "प्रति पेज" },
  { id: "FIXED", label: "Fixed Budget", labelHi: "निश्चित बजट" },
  { id: "HOURLY", label: "Hourly Rate", labelHi: "प्रति घंटा" },
  { id: "DAILY", label: "Daily Rate", labelHi: "दैनिक" },
  { id: "NEGOTIABLE", label: "Negotiable / Open to Proposals", labelHi: "बातचीत योग्य" },
];

export const URGENCY_LEVELS = [
  { id: "NORMAL", label: "Normal (Standard Pace)", badgeColor: "bg-slate-100 text-slate-700" },
  { id: "URGENT", label: "Urgent (Within 48h)", badgeColor: "bg-amber-100 text-amber-800" },
  { id: "VERY_URGENT", label: "Very Urgent (Within 24h / Same Day)", badgeColor: "bg-red-100 text-red-800" },
];

export const JOB_POSTER_PROFILES = [
  { id: "INDIVIDUAL", label: "Individual / Personal", desc: "For personal tasks or personal errands" },
  { id: "STUDENT", label: "Student", desc: "Need assistance with assignments, projects, or college tasks" },
  { id: "FREELANCER", label: "Freelancer / Self-Employed", desc: "Outsource tasks or collaborate on projects" },
  { id: "SHOP_OWNER", label: "Shop / Retail Business Owner", desc: "Hire staff for your physical shop or storefront" },
  { id: "COMPANY", label: "Company / Organization", desc: "Corporate, startup, agency, or office jobs" },
  { id: "WHOLESALER", label: "Wholesaler / Trader", desc: "Warehouse, inventory, logistics, and dispatch" },
  { id: "HOUSEHOLD", label: "Household / Resident", desc: "Home repairs, cleaning, cooking, or moving help" },
  { id: "OTHER", label: "Other", desc: "Any other kind of work or task" },
];

export const ASSIGNMENT_SKILLS_SUGGESTIONS = [
  "Good English",
  "Good Hindi",
  "Punjabi",
  "Fast Writing",
  "Neat Handwriting",
  "MS Word",
  "PowerPoint",
  "Excel",
  "Research",
  "Data Entry",
  "Technical Writing",
  "Engineering Subjects",
  "Mathematics",
  "Computer Science",
  "DBMS",
  "Java",
  "Python",
  "Commerce",
  "Arts",
  "Science",
  "Diagram Drawing",
  "Graph Plotting",
];

export const ACADEMIC_INTEGRITY_NOTICE =
  "WorkAdda connects users for task assistance and services. Users are responsible for ensuring their work complies with their institution's academic-integrity rules.";

export interface AssignmentAddon {
  id: string;
  title: string;
  titleHi?: string;
  amount: number;
  description?: string;
  isEnabled: boolean;
}

export interface AssignmentDeliveryAddress {
  collegeOrCampus?: string;
  addressLine?: string;
  landmark?: string;
  city?: string;
  pincode?: string;
  handoverInstructions?: string;
}

export const DEFAULT_ASSIGNMENT_ADDONS: AssignmentAddon[] = [
  {
    id: "diagrams",
    title: "Diagrams, Charts & Flowcharts",
    titleHi: "चित्र व फ्लोचार्ट कार्य",
    amount: 50,
    description: "Draw relevant diagrams, graphs, and system architectures",
    isEnabled: false,
  },
  {
    id: "binding",
    title: "Spiral Binding & Transparent Cover",
    titleHi: "स्पाइरल बाइंडिंग व कवर",
    amount: 40,
    description: "Neatly bound in plastic spiral with clear protective sheet",
    isEnabled: false,
  },
  {
    id: "express_rush",
    title: "Express Rush Delivery (Within 24 Hours)",
    titleHi: "तत्काल 24 घंटे में डिलीवरी",
    amount: 50,
    description: "High-priority express turnaround for tight deadlines",
    isEnabled: false,
  },
  {
    id: "stationery",
    title: "Practical Sheets & File Folder Included",
    titleHi: "प्रैक्टिकल शीट व फाइल फोल्डर शामिल",
    amount: 30,
    description: "Writer supplies official college practical sheets/ruled pages",
    isEnabled: false,
  },
  {
    id: "physical_delivery",
    title: "In-Person Handover / Courier Delivery Fee",
    titleHi: "हाथों-हाथ या कूरियर डिलीवरी शुल्क",
    amount: 40,
    description: "Physical drop-off at college campus, hostel, or home",
    isEnabled: false,
  },
];

