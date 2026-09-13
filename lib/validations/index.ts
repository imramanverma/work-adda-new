import { z } from "zod";

export const RegisterSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["WORKER", "EMPLOYER"], {
      errorMap: () => ({ message: "Please select either WORKER or EMPLOYER" }),
    }),
    location: z.string().min(2, "Location is required"),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
    businessName: z.string().optional(),
    businessType: z.string().optional(),
    shopImage: z.string().optional(),
    profileImage: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.role === "EMPLOYER") {
        return Boolean(data.shopImage && data.shopImage.trim().length > 0);
      }
      return true;
    },
    {
      message: "Shop image is compulsory for employer registration",
      path: ["shopImage"],
    }
  );

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
  businessName: z.string().min(2, "Business name is required"),
  businessType: z.string().min(2, "Business type is required"),
  shopImage: z.string().optional(),
  description: z.string().max(1500).optional(),
  address: z.string().optional(),
  location: z.string().optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  website: z.string().url().optional().or(z.literal("")),
});

export const JobCreateSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(2, "Category is required"),
  requiredSkills: z.array(z.string()).default([]),
  jobType: z.enum([
    "FULL_TIME",
    "PART_TIME",
    "TEMPORARY",
    "GIG",
    "FLEXIBLE",
    "INTERNSHIP",
  ]),
  location: z.string().min(2, "Location is required"),
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
  coverMessage: z.string().max(1000).optional(),
  proposedPay: z.number().positive().optional().nullable(),
});

export const ApplicationStatusUpdateSchema = z.object({
  status: z.enum(["SHORTLISTED", "ACCEPTED", "REJECTED", "WITHDRAWN"]),
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
