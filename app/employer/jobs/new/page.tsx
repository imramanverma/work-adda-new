"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import {
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  IndianRupee,
  Users,
  ShieldCheck,
  ArrowLeft,
  Plus,
  X,
  BookOpen,
  FileText,
  Sparkles,
  AlertCircle,
  Globe,
  UploadCloud,
  CheckCircle2,
  HelpCircle,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  WORKADDA_CATEGORIES,
  POPULAR_SUBJECTS,
  ACADEMIC_LEVELS,
  ASSIGNMENT_TYPES,
  DELIVERY_METHODS,
  PRICING_TYPES,
  URGENCY_LEVELS,
  PAPER_REQUIREMENTS,
  FILE_FORMATS,
  ASSIGNMENT_SKILLS_SUGGESTIONS,
  ACADEMIC_INTEGRITY_NOTICE,
  DEFAULT_ASSIGNMENT_ADDONS,
  AssignmentAddon,
  AssignmentDeliveryAddress,
} from "@/lib/constants/categories";

export default function NewJobPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // Category & Subcategory
  const [selectedCategory, setSelectedCategory] = useState("Academic & Assignment Work");
  const [selectedSubcategory, setSelectedSubcategory] = useState("Assignment Writing");

  // General Job Details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [jobType, setJobType] = useState<"GIG" | "PART_TIME" | "FULL_TIME" | "TEMPORARY" | "FLEXIBLE" | "INTERNSHIP">("GIG");
  const [location, setLocation] = useState("Remote / Online");
  const [isRemote, setIsRemote] = useState(true);
  const [urgency, setUrgency] = useState<"NORMAL" | "URGENT" | "VERY_URGENT">("NORMAL");
  const [workersRequired, setWorkersRequired] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [safetyConfirmed, setSafetyConfirmed] = useState(false);

  // Pricing & Budget
  const [budgetType, setBudgetType] = useState<"FIXED" | "PER_PAGE" | "HOURLY" | "NEGOTIABLE">("PER_PAGE");
  const [payType, setPayType] = useState<"FIXED" | "PER_PAGE" | "DAILY" | "HOURLY" | "MONTHLY" | "WEEKLY">("PER_PAGE");
  const [quantity, setQuantity] = useState<number | "">(40); // e.g. 40 pages
  const [pricePerUnit, setPricePerUnit] = useState<number | "">(3); // ₹3 / page
  const [payAmount, setPayAmount] = useState<number | "">(120); // 40 * 3 = 120

  // Money Addons
  const [addons, setAddons] = useState<AssignmentAddon[]>(DEFAULT_ASSIGNMENT_ADDONS);
  const [customAddonTitle, setCustomAddonTitle] = useState("");
  const [customAddonAmount, setCustomAddonAmount] = useState<number | "">("");

  // Handover & Delivery Address
  const [deliveryAddress, setDeliveryAddress] = useState<AssignmentDeliveryAddress>({
    collegeOrCampus: "",
    addressLine: "",
    landmark: "",
    city: "Fatehabad",
    pincode: "",
    handoverInstructions: "",
  });

  // Assignment Specific Details
  const [subject, setSubject] = useState("DBMS (Database Management)");
  const [customSubject, setCustomSubject] = useState("");
  const [academicLevel, setAcademicLevel] = useState("Undergraduate");
  const [assignmentFormat, setAssignmentFormat] = useState("Handwritten"); // Handwritten, Typed, Both
  const [paperType, setPaperType] = useState("A4 Loose Sheets");
  const [fileFormat, setFileFormat] = useState("PDF (.pdf)");
  const [inkColor, setInkColor] = useState("Blue & Black");
  const [deliveryMethod, setDeliveryMethod] = useState("DIGITAL_UPLOAD");
  const [revisionsAllowed, setRevisionsAllowed] = useState(2);
  const [diagramsRequired, setDiagramsRequired] = useState(false);
  const [attachmentUrlInput, setAttachmentUrlInput] = useState("");
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([]);

  // Skills
  const [requiredSkills, setRequiredSkills] = useState<string[]>([
    "Neat Handwriting",
    "Good English",
  ]);
  const [newSkill, setNewSkill] = useState("");

  const isAssignmentCategory =
    selectedCategory === "Academic & Assignment Work" ||
    selectedCategory === "Assignment & Academic Work";

  // Auto-calculate budget when pages, rate, or addons change
  useEffect(() => {
    if (budgetType === "PER_PAGE" && typeof quantity === "number" && typeof pricePerUnit === "number") {
      const basePay = quantity * pricePerUnit;
      const addonsTotal = addons
        .filter((a) => a.isEnabled)
        .reduce((sum, a) => sum + Number(a.amount || 0), 0);
      setPayAmount(basePay + addonsTotal);
      setPayType("PER_PAGE");
    }
  }, [quantity, pricePerUnit, budgetType, addons]);

  const toggleAddon = (id: string) => {
    setAddons((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isEnabled: !a.isEnabled } : a))
    );
  };

  const updateAddonAmount = (id: string, amount: number) => {
    setAddons((prev) =>
      prev.map((a) => (a.id === id ? { ...a, amount } : a))
    );
  };

  const addCustomAddon = () => {
    if (!customAddonTitle.trim() || !customAddonAmount) return;
    const newAddon: AssignmentAddon = {
      id: `custom_${Date.now()}`,
      title: customAddonTitle.trim(),
      amount: Number(customAddonAmount),
      isEnabled: true,
    };
    setAddons((prev) => [...prev, newAddon]);
    setCustomAddonTitle("");
    setCustomAddonAmount("");
  };

  const removeCustomAddon = (id: string) => {
    setAddons((prev) => prev.filter((a) => a.id !== id));
  };

  // When switching category, adjust defaults
  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    const cat = WORKADDA_CATEGORIES.find((c) => c.id === catId);
    if (cat && cat.subcategories.length > 0) {
      setSelectedSubcategory(cat.subcategories[0].name);
    }
    if (catId === "Academic & Assignment Work") {
      setIsRemote(true);
      setLocation("Remote / Online");
      setBudgetType("PER_PAGE");
      setPayType("PER_PAGE");
      setJobType("GIG");
      if (requiredSkills.length === 0) {
        setRequiredSkills(["Neat Handwriting", "Good English"]);
      }
    } else {
      setIsRemote(false);
      setLocation("Fatehabad");
      setBudgetType("FIXED");
      setPayType("DAILY");
      setJobType("PART_TIME");
    }
  };

  const addSkill = (sk?: string) => {
    const val = (sk || newSkill).trim();
    if (val && !requiredSkills.includes(val)) {
      setRequiredSkills([...requiredSkills, val]);
      if (!sk) setNewSkill("");
    }
  };

  const removeSkill = (sk: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== sk));
  };

  const addAttachmentUrl = () => {
    if (attachmentUrlInput.trim() && !attachmentUrls.includes(attachmentUrlInput.trim())) {
      setAttachmentUrls([...attachmentUrls, attachmentUrlInput.trim()]);
      setAttachmentUrlInput("");
    }
  };

  const removeAttachmentUrl = (url: string) => {
    setAttachmentUrls(attachmentUrls.filter((u) => u !== url));
  };

  const currentCategory = WORKADDA_CATEGORIES.find((c) => c.id === selectedCategory);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!safetyConfirmed) {
      toast.error("Confirmation Required", "Please confirm platform policy compliance before publishing.");
      return;
    }

    if (!title.trim()) {
      toast.error("Title Required", "Please enter a clear title for your work listing.");
      return;
    }

    if (!payAmount || Number(payAmount) <= 0) {
      toast.error("Compensation Required", "Please provide a valid compensation or budget amount.");
      return;
    }

    setLoading(true);
    try {
      const finalSubject = subject === "Other Subject" && customSubject.trim() ? customSubject.trim() : subject;
      const hasAddress = Boolean(deliveryAddress.collegeOrCampus?.trim() || deliveryAddress.addressLine?.trim());
      const activeAddons = addons.filter((a) => a.isEnabled);

      const categoryDetails = isAssignmentCategory
        ? {
            subject: finalSubject,
            academicLevel,
            assignmentFormat,
            paperType: assignmentFormat !== "Typed" ? paperType : undefined,
            inkColor: assignmentFormat !== "Typed" ? inkColor : undefined,
            diagramsRequired,
            fileFormat: assignmentFormat !== "Handwritten" ? fileFormat : undefined,
            deliveryMethod,
            revisionsAllowed,
            addons: activeAddons,
            deliveryAddress: hasAddress ? deliveryAddress : undefined,
          }
        : undefined;

      const effectiveLocation = !isRemote && hasAddress
        ? `${deliveryAddress.collegeOrCampus ? deliveryAddress.collegeOrCampus + ", " : ""}${deliveryAddress.city || "Fatehabad"}`
        : isRemote
        ? (location.trim() || "Remote / Online Work")
        : location;

      const payload = {
        title,
        description,
        category: selectedCategory,
        subcategory: selectedSubcategory,
        jobType,
        location: effectiveLocation,
        isRemote,
        urgency,
        payAmount: Number(payAmount),
        payType,
        budgetType,
        pricePerUnit: pricePerUnit ? Number(pricePerUnit) : undefined,
        unitType: isAssignmentCategory ? "page" : undefined,
        quantity: quantity ? Number(quantity) : undefined,
        deliveryMethod,
        revisionsAllowed: Number(revisionsAllowed),
        categoryDetails,
        attachmentUrls,
        workersRequired: Number(workersRequired),
        requiredSkills,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        safetyConfirmed,
      };

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error("Failed to Post Work", data.error || "Please check your input values.");
      } else {
        toast.success("Job Posted Successfully! 🎉", "Your listing is now live across the WorkAdda network.");
        router.push("/employer/dashboard");
      }
    } catch (err: any) {
      toast.error("Network Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/employer/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
          {/* Header */}
          <div className="border-b border-slate-100 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <span className="text-xs uppercase tracking-wider font-extrabold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
                WorkAdda Marketplace
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Assignments • Local Jobs • Digital Tasks • Skilled Gigs
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Post Work or Hire Assistance
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Hire verified students, writers, technicians, delivery agents, and helpers across Haryana & Remote.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 text-left">
            {/* Step 1: Category Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-600" /> Step 1: Choose Work Category
                </h3>
                {isAssignmentCategory && (
                  <Badge variant="brand" className="text-[11px] font-bold">
                    📚 Assignment & Academic Mode Active
                  </Badge>
                )}
              </div>

              {/* Grid of Main Categories */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {WORKADDA_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? "border-brand-500 bg-brand-50/70 shadow-xs ring-2 ring-brand-500/20"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="text-2xl mb-1.5">{cat.emoji}</div>
                      <div>
                        <p className={`text-xs font-bold leading-tight ${isSelected ? "text-brand-950" : "text-slate-900"}`}>
                          {cat.name}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{cat.subcategories.length} types</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Subcategory Picker */}
              {currentCategory && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Specific Task Subcategory
                  </label>
                  <select
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-800"
                  >
                    {currentCategory.subcategories.map((sub) => (
                      <option key={sub.id} value={sub.name}>
                        {sub.name} — {sub.nameHi}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Academic Integrity Notice if Assignment */}
            {isAssignmentCategory && (
              <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs text-blue-950 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-900">WorkAdda Academic Assistance Policy</p>
                  <p className="text-blue-800 mt-0.5 leading-relaxed">
                    {ACADEMIC_INTEGRITY_NOTICE}
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Academic & Assignment Specific Specifications */}
            {isAssignmentCategory && (
              <div className="space-y-6 pt-4 border-t border-slate-100 bg-slate-50/60 p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-brand-600" /> Assignment & Academic Specifications
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">Page-based pricing & file settings</span>
                </div>

                {/* Subject Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Subject / Course Name
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {POPULAR_SUBJECTS.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>

                  {subject === "Other Subject" && (
                    <input
                      type="text"
                      placeholder="Specify your custom subject (e.g. Organic Chemistry, Microeconomics, Law of Torts)..."
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      className="mt-2 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  )}

                  {/* Popular Subject Quick Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["DBMS", "Computer Science", "Java", "Python", "Mathematics", "Business Management"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSubject(POPULAR_SUBJECTS.find((p) => p.includes(s)) || s)}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] text-slate-600 hover:border-brand-300 hover:text-brand-700 transition"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Academic Level & Format */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Academic Level</label>
                    <select
                      value={academicLevel}
                      onChange={(e) => setAcademicLevel(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {ACADEMIC_LEVELS.map((lvl) => (
                        <option key={lvl.id} value={lvl.id}>
                          {lvl.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Assignment Format</label>
                    <div className="grid grid-cols-3 gap-2">
                      {ASSIGNMENT_TYPES.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setAssignmentFormat(t.id)}
                          className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition text-center ${
                            assignmentFormat === t.id
                              ? "bg-brand-600 text-white border-brand-600 shadow-xs"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Format Specific Details */}
                {assignmentFormat !== "Typed" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-white rounded-xl border border-slate-200/80">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Paper Requirements</label>
                      <select
                        value={paperType}
                        onChange={(e) => setPaperType(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        {PAPER_REQUIREMENTS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Pen / Ink Color</label>
                      <select
                        value={inkColor}
                        onChange={(e) => setInkColor(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="Blue & Black">Blue (Text) & Black (Headings)</option>
                        <option value="Blue Only">Blue Pen Only</option>
                        <option value="Black Only">Black Pen Only</option>
                        <option value="Any Standard Ink">Any Standard Ink</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center gap-2 cursor-pointer mt-4">
                        <input
                          type="checkbox"
                          checked={diagramsRequired}
                          onChange={(e) => setDiagramsRequired(e.target.checked)}
                          className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                        />
                        <span className="text-xs text-slate-700 font-semibold">
                          Includes Diagrams / Charts
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {assignmentFormat !== "Handwritten" && (
                  <div className="p-4 bg-white rounded-xl border border-slate-200/80">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Document Format</label>
                    <div className="flex flex-wrap gap-2">
                      {FILE_FORMATS.map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFileFormat(f)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                            fileFormat === f
                              ? "bg-brand-50 border-brand-500 text-brand-700"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delivery Method & Revisions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Method</label>
                    <select
                      value={deliveryMethod}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {DELIVERY_METHODS.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Included Revisions
                    </label>
                    <select
                      value={revisionsAllowed}
                      onChange={(e) => setRevisionsAllowed(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value={1}>1 Revision</option>
                      <option value={2}>2 Revisions (Standard)</option>
                      <option value={3}>3 Revisions</option>
                      <option value={0}>0 (Final Submission Only)</option>
                    </select>
                  </div>
                </div>

                {/* Handover & Delivery Address Card */}
                <div className="p-4 sm:p-5 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 rounded-2xl border border-blue-200/80 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Handover & Delivery Address
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Where should the assignment, practical record, or materials be submitted?
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full">
                      {deliveryMethod === "DIGITAL_UPLOAD" ? "Optional for Online PDF" : "📍 Handover Location"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        College / University / Campus Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Govt PG College, Fatehabad / Sirsa / Hisar or Campus"
                        value={deliveryAddress.collegeOrCampus || ""}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, collegeOrCampus: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Hostel / Room / Street Address
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Boys Hostel No. 2, Room 104 or Model Town"
                        value={deliveryAddress.addressLine || ""}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, addressLine: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Landmark / Meeting Spot
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Near Central Library Gate or Canteen"
                        value={deliveryAddress.landmark || ""}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, landmark: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">City / Town</label>
                        <input
                          type="text"
                          placeholder="e.g. Fatehabad, Sirsa, Hisar"
                          value={deliveryAddress.city || ""}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Pincode</label>
                        <input
                          type="text"
                          placeholder="125050"
                          value={deliveryAddress.pincode || ""}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, pincode: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Special Handover Instructions
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Call 15 minutes before reaching; protect file in waterproof sleeve"
                      value={deliveryAddress.handoverInstructions || ""}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, handoverInstructions: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                {/* Attachments / Reference Material Links */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Reference Files / Question Paper / Syllabus Links (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste Google Drive, Dropbox, or OneDrive link..."
                      value={attachmentUrlInput}
                      onChange={(e) => setAttachmentUrlInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    />
                    <Button type="button" variant="secondary" size="sm" onClick={addAttachmentUrl}>
                      <Plus className="w-4 h-4 mr-1" /> Add Link
                    </Button>
                  </div>
                  {attachmentUrls.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {attachmentUrls.map((url, i) => (
                        <div key={i} className="flex items-center justify-between text-xs p-2 bg-white rounded-lg border border-slate-200">
                          <span className="truncate text-blue-600 underline max-w-[85%]">{url}</span>
                          <button type="button" onClick={() => removeAttachmentUrl(url)} className="text-red-500 hover:text-red-700">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Work Description & Title */}
            <div className="space-y-4 pt-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-brand-600" /> Step 2: Title & Task Details
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Work Listing Title</label>
                <input
                  type="text"
                  required
                  placeholder={
                    isAssignmentCategory
                      ? "e.g. 40 Pages Handwritten DBMS Assignment (Urgent Submission)"
                      : "e.g. Delivery Assistant (Weekend Rush) or Supermarket Shelf Stocker"
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detailed Description & Requirements
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={
                    isAssignmentCategory
                      ? "Clearly specify topic details, questions to solve, formatting rules, diagrams expected, paper margins, and due date time..."
                      : "Clearly explain the tasks required, reporting timing, dress code, and what the worker will be doing..."
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Work Type Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Work Type</label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="GIG">Gig / Single Task</option>
                    <option value="PART_TIME">Part-time</option>
                    <option value="FULL_TIME">Full-time</option>
                    <option value="TEMPORARY">Temporary / Seasonal</option>
                    <option value="FLEXIBLE">Flexible Hours</option>
                    <option value="INTERNSHIP">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Urgency Level</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {URGENCY_LEVELS.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 4: Budget & Pricing Calculator */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-600" /> Step 3: Pricing & Escrow Budget
              </h3>

              {isAssignmentCategory ? (
                <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-emerald-900">
                      Auto-Calculated Page-Based Pricing
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setBudgetType("PER_PAGE");
                          setPayType("PER_PAGE");
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          budgetType === "PER_PAGE"
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-white text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        Per Page Rate
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBudgetType("FIXED");
                          setPayType("FIXED");
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          budgetType === "FIXED"
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-white text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        Fixed Budget
                      </button>
                    </div>
                  </div>

                  {budgetType === "PER_PAGE" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Number of Pages
                        </label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                          placeholder="e.g. 40"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Rate per Page (₹)
                        </label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={pricePerUnit}
                          onChange={(e) => setPricePerUnit(e.target.value === "" ? "" : Number(e.target.value))}
                          placeholder="e.g. 3"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                        />
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-emerald-200 text-center">
                        <span className="text-[11px] text-slate-500 block">Total Calculated Budget</span>
                        <span className="text-xl font-black text-emerald-700">
                          ₹{payAmount || 0}
                        </span>
                        <div className="text-[10px] text-slate-500 block mt-0.5 space-y-0.5">
                          <span>
                            Base: {quantity || 0} pages × ₹{pricePerUnit || 0}/page = ₹{(Number(quantity) || 0) * (Number(pricePerUnit) || 0)}
                          </span>
                          {addons.filter((a) => a.isEnabled).length > 0 && (
                            <span className="block text-emerald-700 font-bold">
                              + {addons.filter((a) => a.isEnabled).length} Addon{addons.filter((a) => a.isEnabled).length > 1 ? "s" : ""} (+₹{addons.filter((a) => a.isEnabled).reduce((sum, a) => sum + Number(a.amount || 0), 0)})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Fixed Task Budget (₹)
                      </label>
                      <input
                        type="number"
                        min={50}
                        required
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="e.g. 600"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-900"
                      />
                    </div>
                  )}

                  {/* Money Addons (Paid Extras) for Assignment Work */}
                  <div className="mt-4 pt-4 border-t border-emerald-200/80 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          Money Addons & Extras (Optional)
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Select paid extra requirements. Each active addon dynamically adds to your total escrow budget.
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-800 bg-white border border-emerald-300 px-2.5 py-0.5 rounded-lg shadow-2xs">
                        +₹{addons.filter((a) => a.isEnabled).reduce((sum, a) => sum + Number(a.amount || 0), 0)} in Addons
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {addons.map((addon) => (
                        <div
                          key={addon.id}
                          className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-2.5 ${
                            addon.isEnabled
                              ? "bg-white border-emerald-400 shadow-xs ring-1 ring-emerald-400/30"
                              : "bg-white/60 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <label className="flex items-start gap-2.5 cursor-pointer flex-1 select-none">
                            <input
                              type="checkbox"
                              checked={addon.isEnabled}
                              onChange={() => toggleAddon(addon.id)}
                              className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                            />
                            <div>
                              <span className={`text-xs font-bold block ${addon.isEnabled ? "text-slate-900" : "text-slate-700"}`}>
                                {addon.title}
                              </span>
                              {addon.description && (
                                <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">
                                  {addon.description}
                                </span>
                              )}
                            </div>
                          </label>

                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-xs font-bold text-slate-500">+₹</span>
                            <input
                              type="number"
                              min={5}
                              value={addon.amount}
                              onChange={(e) => updateAddonAmount(addon.id, Number(e.target.value))}
                              className="w-16 px-1.5 py-1 text-xs font-bold text-slate-900 border border-slate-200 rounded-lg bg-white text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            {addon.id.startsWith("custom_") && (
                              <button
                                type="button"
                                onClick={() => removeCustomAddon(addon.id)}
                                className="text-red-400 hover:text-red-600 p-0.5 ml-0.5"
                                title="Delete addon"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Custom Addon Row */}
                    <div className="p-2.5 bg-white/70 rounded-xl border border-dashed border-emerald-300 flex flex-wrap sm:flex-nowrap items-center gap-2">
                      <input
                        type="text"
                        placeholder="Add custom addon (e.g. Color Front Cover Page Print)"
                        value={customAddonTitle}
                        onChange={(e) => setCustomAddonTitle(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-500">+₹</span>
                        <input
                          type="number"
                          min={5}
                          placeholder="Price"
                          value={customAddonAmount}
                          onChange={(e) => setCustomAddonAmount(e.target.value === "" ? "" : Number(e.target.value))}
                          className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-bold text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={addCustomAddon}
                          disabled={!customAddonTitle.trim() || !customAddonAmount}
                          className="text-xs shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add
                        </Button>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    💡 <strong>Escrow Protection:</strong> You deposit this amount upon selecting an applicant. Funds remain safely in Escrow until you inspect and approve the completed pages.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pay Amount (₹)</label>
                    <input
                      type="number"
                      min={50}
                      required
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 700"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pay Frequency / Type</label>
                    <select
                      value={payType}
                      onChange={(e) => setPayType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="DAILY">Daily Rate</option>
                      <option value="FIXED">Fixed (Per Task)</option>
                      <option value="HOURLY">Hourly Rate</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Step 5: Location & Remote Mode */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600" /> Step 4: Location & Work Mode
              </h3>

              {/* Remote Toggle */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isRemote ? "bg-blue-100 text-brand-700" : "bg-slate-200 text-slate-600"}`}>
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Remote / Online Task</h4>
                    <p className="text-[11px] text-slate-500">
                      Work can be completed from home or online without visiting a physical store.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isRemote}
                    onChange={(e) => {
                      setIsRemote(e.target.checked);
                      if (e.target.checked) {
                        setLocation("Remote / Online");
                      } else {
                        setLocation("Fatehabad");
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600" />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isRemote ? "Location / Region (Optional)" : "Physical Locality / Store Address"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isRemote ? "e.g. Remote / All India or Haryana" : "e.g. Near Bus Stand, Fatehabad, Sirsa or Hisar"}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {!isRemote && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] text-slate-400 font-medium">Quick pick:</span>
                      {["Fatehabad", "Sirsa", "Hisar"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setLocation(c)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition ${
                            location.includes(c)
                              ? "bg-brand-50 text-brand-700 border-brand-300"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Number of Workers Required
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={workersRequired}
                    onChange={(e) => setWorkersRequired(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date / Deadline</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 6: Skills */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Required Skills & Capabilities</h3>

              <div className="flex flex-wrap gap-2 min-h-[42px] p-2 bg-slate-50 rounded-xl border border-slate-200">
                {requiredSkills.map((sk) => (
                  <span
                    key={sk}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-50 text-brand-700 border border-brand-200 rounded-lg text-xs font-semibold"
                  >
                    {sk}
                    <button type="button" onClick={() => removeSkill(sk)}>
                      <X className="w-3.5 h-3.5 hover:text-red-600" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Suggestions */}
              {isAssignmentCategory && (
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 font-semibold block">Quick Skill Suggestions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {ASSIGNMENT_SKILLS_SUGGESTIONS.slice(0, 10).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => addSkill(s)}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type custom skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <Button type="button" variant="secondary" size="sm" onClick={() => addSkill()}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
            </div>

            {/* Step 7: Safety & Terms Confirmation */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={safetyConfirmed}
                  onChange={(e) => setSafetyConfirmed(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded mt-0.5 border-slate-300 focus:ring-brand-500"
                />
                <span className="text-xs text-slate-700 font-medium leading-relaxed">
                  I confirm that this task posting is accurate and complies with WorkAdda policies. I understand that escrow funds are secured before work begins and released upon completion verification.
                </span>
              </label>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Link href="/employer/dashboard">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" size="lg" isLoading={loading} className="font-bold px-8 shadow-md shadow-brand-500/20">
                Publish Work Listing 🚀
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
