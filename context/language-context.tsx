"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Brand & Taglines
    "brand.tagline": "Local Work. Local People. Local Growth.",
    "brand.badge": "Local Employment • Fatehabad & Sirsa",
    "brand.hero_title_1": "Find Local Work.",
    "brand.hero_title_2": "Build Your Future.",
    "brand.hero_desc":
      "Work Adda connects ambitious students, gig seekers, and skilled workers with neighborhood stores, warehouses, and businesses — quickly, safely, and nearby.",
    "brand.active_district": "Active: Fatehabad & Sirsa",
    "brand.active_district_full": "Active across Fatehabad & Sirsa, Haryana",
    "brand.scanning": "Scanning Fatehabad & Sirsa Network...",
    "brand.tasks_found": "Found 32+ Local Tasks in Fatehabad & Sirsa",
    "brand.ready_deal": "Ready! Instant Settlement & 5% Fee",

    // Navigation & Common Actions
    "nav.menu": "Menu",
    "nav.search_placeholder": "Search local jobs & skills in Fatehabad & Sirsa...",
    "nav.search_btn": "Search",
    "nav.find_work": "Find Work",
    "nav.worker_hub": "Worker Hub",
    "nav.my_applications": "My Applications",
    "nav.active_work": "Active Work",
    "nav.earnings": "Earnings",
    "nav.employer_hub": "Employer Hub",
    "nav.post_work": "Post Work",
    "nav.applicants": "Applicants",
    "nav.work_contracts": "Work Contracts",
    "nav.payments": "Payments",
    "nav.admin_panel": "Admin Panel",
    "nav.users": "Users",
    "nav.jobs": "Jobs",
    "nav.reports": "Reports",
    "nav.messages": "Messages",
    "nav.notifications": "Notifications",
    "nav.profile": "Profile & Skills",
    "nav.company_profile": "Company Profile",
    "nav.sign_in": "Sign In",
    "nav.join_now": "Join Now",
    "nav.create_account": "Create Free Account",
    "nav.sign_out": "Sign Out",
    "nav.lang": "Language",

    // Search & Hero form
    "hero.search_input": "Search delivery, counter sales, warehouse...",
    "hero.search_btn": "Search Gigs",
    "hero.hiring_time_label": "Hiring Time",
    "hero.hiring_time_val": "< 15 Minutes",
    "hero.fee_label": "Platform Fee",
    "hero.fee_val": "Standard 5%",
    "hero.verified_label": "Local Workers",
    "hero.verified_val": "Aadhaar Verified",

    // Jobs Page
    "jobs.title": "Discover Local Work",
    "jobs.subtitle": "Find verified shifts, gigs, and jobs within your neighborhood radius.",
    "jobs.browsing_near": "Browsing near:",
    "jobs.filter_input": "Search job title, skills, or business...",
    "jobs.district_filter": "Filter Fatehabad or Sirsa...",
    "jobs.districts_label": "Districts:",
    "jobs.radius_label": "Distance Radius:",
    "jobs.within_2km": "Within 2 km",
    "jobs.within_5km": "5 km",
    "jobs.within_10km": "10 km",
    "jobs.within_25km": "25 km",
    "jobs.any_distance": "Any distance",
    "jobs.sort_recent": "Sort: Recently Posted",
    "jobs.sort_nearest": "Sort: Nearest Distance",
    "jobs.sort_pay": "Sort: Highest Compensation",
    "jobs.apply_now": "Apply Now",
    "jobs.applied": "Applied",
    "jobs.view_details": "View Details",
    "jobs.workers_needed": "workers needed",
    "jobs.per_day": "/day",

    // Footer
    "footer.desc":
      "“Local Work. Local People. Local Growth.” A trusted local employment marketplace connecting workers, students, and businesses.",
    "footer.for_workers": "For Workers",
    "footer.for_employers": "For Employers",
    "footer.trust": "Trust & Safety",
    "footer.copyright": "© 2026 Work Adda. Built for Fatehabad & Sirsa, Haryana.",

    // Auth
    "auth.welcome_back": "Sign In to Work Adda",
    "auth.welcome_desc": "Access your local tasks, applications, and payouts",
    "auth.email_phone": "Email Address or Phone Number",
    "auth.password": "Password",
    "auth.sign_in_btn": "Sign In",
    "auth.no_account": "Don't have an account yet?",
    "auth.create_one": "Create an account",
    "auth.register_title": "Join Work Adda",
    "auth.i_want_to": "I want to:",
    "auth.role_worker": "Find Work (Worker / Student)",
    "auth.role_employer": "Hire Helpers (Employer / Business)",
  },
  hi: {
    // Brand & Taglines
    "brand.tagline": "लोकल काम. लोकल लोग. लोकल तरक्की।",
    "brand.badge": "लोकल रोजगार • फतेहाबाद और सिरसा",
    "brand.hero_title_1": "आस-पास काम पाएं।",
    "brand.hero_title_2": "अपना भविष्य बनाएं।",
    "brand.hero_desc":
      "वर्क अड्डा मेहनती छात्रों, गिग वर्कर्स और कुशल कामगारों को नजदीकी दुकानों, गोदामों और व्यापारियों से जोड़ता है — तेजी से, सुरक्षित और सीधे आपके इलाके में।",
    "brand.active_district": "सक्रिय: फतेहाबाद व सिरसा",
    "brand.active_district_full": "फतेहाबाद व सिरसा, हरियाणा में सक्रिय",
    "brand.scanning": "फतेहाबाद व सिरसा नेटवर्क स्कैन हो रहा है...",
    "brand.tasks_found": "फतेहाबाद व सिरसा में 32+ लोकल काम उपलब्ध हैं",
    "brand.ready_deal": "तैयार! तुरंत पेमेंट और मात्र 5% शुल्क",

    // Navigation & Common Actions
    "nav.menu": "मेनू",
    "nav.search_placeholder": "फतेहाबाद और सिरसा में काम व हुनर खोजें...",
    "nav.search_btn": "खोजें",
    "nav.find_work": "काम खोजें",
    "nav.worker_hub": "वर्कर हब",
    "nav.my_applications": "मेरे आवेदन",
    "nav.active_work": "सक्रिय काम",
    "nav.earnings": "कमाई",
    "nav.employer_hub": "नियोक्ता हब",
    "nav.post_work": "काम पोस्ट करें",
    "nav.applicants": "आवेदक",
    "nav.work_contracts": "काम के अनुबंध",
    "nav.payments": "भुगतान",
    "nav.admin_panel": "एडमिन पैनल",
    "nav.users": "उपयोगकर्ता",
    "nav.jobs": "नौकरियां",
    "nav.reports": "रिपोर्ट्स",
    "nav.messages": "मैसेज",
    "nav.notifications": "सूचनाएं",
    "nav.profile": "प्रोफाइल व हुनर",
    "nav.company_profile": "कंपनी प्रोफाइल",
    "nav.sign_in": "लॉग इन",
    "nav.join_now": "अभी जुड़ें",
    "nav.create_account": "निशुल्क खाता बनाएं",
    "nav.sign_out": "लॉग आउट",
    "nav.lang": "भाषा",

    // Search & Hero form
    "hero.search_input": "डिलीवरी, दुकान, गोदाम, इलेक्ट्रीशियन का काम...",
    "hero.search_btn": "काम खोजें",
    "hero.hiring_time_label": "नियुक्ति समय",
    "hero.hiring_time_val": "15 मिनट से कम",
    "hero.fee_label": "प्लेटफ़ॉर्म शुल्क",
    "hero.fee_val": "मात्र 5%",
    "hero.verified_label": "लोकल कामगार",
    "hero.verified_val": "आधार सत्यापित",

    // Jobs Page
    "jobs.title": "लोकल काम और नौकरियां खोजें",
    "jobs.subtitle": "अपने पड़ोस और नजदीकी इलाके में सत्यापित शिफ्ट, गिग्स और काम पाएं।",
    "jobs.browsing_near": "आस-पास खोज रहे हैं:",
    "jobs.filter_input": "नौकरी का नाम, हुनर या दुकान खोजें...",
    "jobs.district_filter": "फतेहाबाद या सिरसा फ़िल्टर करें...",
    "jobs.districts_label": "जिले:",
    "jobs.radius_label": "दूरी का दायरा:",
    "jobs.within_2km": "2 किमी के अंदर",
    "jobs.within_5km": "5 किमी",
    "jobs.within_10km": "10 किमी",
    "jobs.within_25km": "25 किमी",
    "jobs.any_distance": "कोई भी दूरी",
    "jobs.sort_recent": "क्रम: हाल ही में पोस्ट किया गया",
    "jobs.sort_nearest": "क्रम: सबसे नजदीकी",
    "jobs.sort_pay": "क्रम: सबसे ज्यादा कमाई",
    "jobs.apply_now": "आवेदन करें",
    "jobs.applied": "आवेदन कर दिया",
    "jobs.view_details": "विवरण देखें",
    "jobs.workers_needed": "कामगार चाहिए",
    "jobs.per_day": "/दिन",

    // Footer
    "footer.desc":
      "“लोकल काम. लोकल लोग. लोकल तरक्की।” श्रमिकों, छात्रों और स्थानीय व्यवसायों को जोड़ने वाला एक विश्वसनीय रोजगार मंच।",
    "footer.for_workers": "कामगारों के लिए",
    "footer.for_employers": "नियोक्ताओं के लिए",
    "footer.trust": "विश्वास और सुरक्षा",
    "footer.copyright": "© 2026 वर्क अड्डा। फतेहाबाद और सिरसा, हरियाणा के लिए निर्मित।",

    // Auth
    "auth.welcome_back": "वर्क अड्डा में लॉग इन करें",
    "auth.welcome_desc": "अपने लोकल काम, आवेदन और भुगतान देखें",
    "auth.email_phone": "ईमेल पता या मोबाइल नंबर",
    "auth.password": "पासवर्ड",
    "auth.sign_in_btn": "लॉग इन करें",
    "auth.no_account": "क्या अभी तक खाता नहीं है?",
    "auth.create_one": "नया खाता बनाएं",
    "auth.register_title": "वर्क अड्डा से जुड़ें",
    "auth.i_want_to": "मैं चाहता हूँ:",
    "auth.role_worker": "काम पाना (कामगार / छात्र)",
    "auth.role_employer": "कामगार रखना (नियोक्ता / व्यापारी)",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  // Load language from localStorage on client mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("workadda_lang") as Language;
      if (savedLang && (savedLang === "en" || savedLang === "hi")) {
        setLanguageState(savedLang);
      }
    } catch {}
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("workadda_lang", lang);
    } catch {}
  };

  const toggleLanguage = () => {
    const nextLang = language === "en" ? "hi" : "en";
    setLanguage(nextLang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations["en"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
