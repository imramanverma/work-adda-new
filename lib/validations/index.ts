import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["WORKER", "EMPLOYER", "BOTH"], {
    errorMap: () => ({ message: "Please select your purpose (Work, Hire, or Both)" }),
  }),
  posterType: z
    .enum([
      "INDIVIDUAL",
      "STUDENT",
      "FREELANCER",
      "SHOP_OWNER",
      "COMPANY",
      "WHOLESALER",
      "HOUSEHOLD",
      "OTHER",
    ])
    .optional()
    .default("INDIVIDUAL"),
  location: z.string().min(2, "Location is required"),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  businessName: z.string().optional(),
  businessType: z.string().optional(),
  shopImage: z.string().optional().nullable(),
  profileImage: z.string().optional().nullable(),
});

export const LoginSchema = z
  .object({
    identifier: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    password: z.string().min(1, "Password is required"),
  })
  .refine((data) => Boolean(data.identifier || data.email || data.phone), {
    message: "Email or phone number is required",
    path: ["identifier"],
  });

export const WorkerProfileUpdateSchema = z.object({
  bio: z.string().max(1000).optional(),
  skills: z.array(z.string()).default([]),
  categories: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  portfolio: z.string().max(2000).optional().nullable(),
  preferredWorkType: z.enum(["ANY", "REMOTE", "LOCAL"]).optional().default("ANY"),
  experience: z.string().max(1000).optional(),
  education: z.string().max(500).optional(),
  availability: z.string().optional(),
  preferredJobType: z.string().optional(),
  preferredDistance: z.number().min(1).max(200).default(10),
  expectedPay: z.number().positive().optional().nullable(),
  location: z.string().optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  profileImage: z.string().optional(),
});

export const EmployerProfileUpdateSchema = z.object({
  posterType: z
    .enum([
      "INDIVIDUAL",
      "STUDENT",
      "FREELANCER",
      "SHOP_OWNER",
      "COMPANY",
      "WHOLESALER",
      "HOUSEHOLD",
      "OTHER",
    ])
    .optional(),
  businessName: z.string().min(1, "Name is required"),
  businessType: z.string().optional(),
  shopImage: z.string().optional().nullable(),
  description: z.string().max(1500).optional(),
  address: z.string().optional(),
  location: z.string().optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  website: z.string().url().optional().or(z.literal("")),
});

export const JobCreateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(2, "Category is required"),
  subcategory: z.string().optional().nullable(),
  isRemote: z.boolean().default(false),
  urgency: z.enum(["NORMAL", "URGENT", "VERY_URGENT"]).default("NORMAL"),
  budgetType: z
    .enum(["PER_PAGE", "FIXED", "HOURLY", "DAILY", "MONTHLY", "NEGOTIABLE"])
    .default("FIXED"),
  pricePerUnit: z.number().positive().optional().nullable(),
  unitType: z.string().optional().nullable(),
  quantity: z.number().int().positive().optional().nullable(),
  deliveryMethod: z.string().optional().nullable(),
  revisionsAllowed: z.number().int().min(0).max(20).default(2),
  categoryDetails: z.string().optional().nullable(),
  milestones: z.string().optional().nullable(),
  attachmentUrls: z.string().optional().nullable(),
  requiredSkills: z.array(z.string()).default([]),
  jobType: z.enum([
    "FULL_TIME",
    "PART_TIME",
    "TEMPORARY",
    "GIG",
    "FLEXIBLE",
    "INTERNSHIP",
  ]),
  location: z.string().min(1, "Location is required"),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  payAmount: z.number().positive("Pay amount must be greater than 0"),
  payType: z.enum(["HOURLY", "DAILY", "FIXED", "MONTHLY"]),
  workersRequired: z.number().int().min(1).default(1),
  deadline: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  safetyConfirmed: z.boolean().refine((val) => val === true, {
    message: "You must confirm compliance with Work Adda policies",
  }),
});

export const ApplicationCreateSchema = z.object({
  coverMessage: z.string().max(2000).optional(),
  proposedPay: z.number().positive().optional().nullable(),
  completionTime: z.string().max(100).optional().nullable(),
  relevantSkills: z.array(z.string()).optional().nullable(),
  sampleWorkUrls: z.string().max(2000).optional().nullable(),
});

export const ApplicationStatusUpdateSchema = z.object({
  status: z.enum(["SHORTLISTED", "ACCEPTED", "REJECTED", "WITHDRAWN"]),
});

export const AssignmentSubmissionSchema = z.object({
  submissionNote: z.string().max(2000).optional().nullable(),
  submissionFiles: z.string().max(5000).optional().nullable(),
});

export const AssignmentRevisionSchema = z.object({
  revisionRequestedNote: z.string().min(3, "Please describe the changes or revisions required"),
});

export const ReviewCreateSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  reviewedUserId: z.string().min(1, "Reviewed User ID is required"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const ReportCreateSchema = z.object({
  reportedUserId: z.string().optional().nullable(),
  jobId: z.string().optional().nullable(),
  reason: z.string().min(3, "Reason is required"),
  description: z.string().min(10, "Please describe the issue in detail"),
});

export const SendMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(2000),
});
