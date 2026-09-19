import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRequestUser, requireAuth } from "@/lib/session";
import { JobCreateSchema } from "@/lib/validations";
import { calculateDistanceKm } from "@/lib/location";
import { calculateMatchScore } from "@/lib/matching";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const subcategory = searchParams.get("subcategory") || "";
    const isRemote = searchParams.get("isRemote");
    const urgency = searchParams.get("urgency");
    const budgetType = searchParams.get("budgetType");
    const jobType = searchParams.get("jobType") || "";
    const location = searchParams.get("location") || "";
    const minPay = searchParams.get("minPay") ? parseFloat(searchParams.get("minPay")!) : undefined;
    const maxPay = searchParams.get("maxPay") ? parseFloat(searchParams.get("maxPay")!) : undefined;
    const minPages = searchParams.get("minPages") ? parseInt(searchParams.get("minPages")!, 10) : undefined;
    const maxPages = searchParams.get("maxPages") ? parseInt(searchParams.get("maxPages")!, 10) : undefined;
    const maxDistance = searchParams.get("maxDistance") ? parseFloat(searchParams.get("maxDistance")!) : undefined;
    const userLat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : undefined;
    const userLng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : undefined;
    const sortBy = searchParams.get("sortBy") || "recently_posted"; // "recently_posted", "highest_pay", "nearest", "relevance"
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const status = searchParams.get("status") || "OPEN";

    // Build filter conditions
    const where: any = {
      status,
    };

    if (category && category !== "All") {
      const trimmedCat = category.trim();
      const capitalizedCat = trimmedCat.charAt(0).toUpperCase() + trimmedCat.slice(1).toLowerCase();
      // Handle synonyms like Assignment vs Academic & Assignment Work
      const isAcademic =
        trimmedCat.toLowerCase().includes("assignment") ||
        trimmedCat.toLowerCase().includes("academic");

      if (isAcademic) {
        where.category = {
          in: [
            "Assignment & Academic Work",
            "Academic & Assignment Work",
            "Assignment",
            "Academic",
          ],
        };
      } else {
        where.category = {
          in: [trimmedCat, trimmedCat.toLowerCase(), trimmedCat.toUpperCase(), capitalizedCat],
        };
      }
    }

    if (subcategory && subcategory !== "All") {
      where.subcategory = { contains: subcategory };
    }

    if (isRemote === "true") {
      where.isRemote = true;
    } else if (isRemote === "false") {
      where.isRemote = false;
    }

    if (urgency && urgency !== "ALL") {
      where.urgency = urgency;
    }

    if (budgetType && budgetType !== "ALL") {
      where.budgetType = budgetType;
    }

    if (jobType && jobType !== "All") {
      where.jobType = jobType;
    }

    if (location) {
      where.location = { contains: location };
    }

    if (minPay !== undefined || maxPay !== undefined) {
      where.payAmount = {};
      if (minPay !== undefined) where.payAmount.gte = minPay;
      if (maxPay !== undefined) where.payAmount.lte = maxPay;
    }

    if (minPages !== undefined || maxPages !== undefined) {
      where.quantity = {};
      if (minPages !== undefined) where.quantity.gte = minPages;
      if (maxPages !== undefined) where.quantity.lte = maxPages;
    }

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { category: { contains: q } },
        { subcategory: { contains: q } },
        { categoryDetails: { contains: q } },
        { location: { contains: q } },
        { requiredSkills: { contains: q } },
        { employer: { businessName: { contains: q } } },
      ];
    }

    // Determine database order if applicable
    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "highest_pay") {
      orderBy = { payAmount: "desc" };
    }

    const [totalCount, rawJobs] = await Promise.all([
      db.job.count({ where }),
      db.job.findMany({
        where,
        include: {
          employer: {
            select: {
              id: true,
              posterType: true,
              businessName: true,
              businessType: true,
              rating: true,
              verificationStatus: true,
              shopImage: true,
              location: true,
            },
          },
          _count: {
            select: { applications: true },
          },
        },
        orderBy,
      }),
    ]);

    // Check if requesting user is logged in as a worker to compute personalized match scores
    const currentUser = await getRequestUser(req);
    let workerProfile: any = null;
    let effectiveLat = userLat;
    let effectiveLng = userLng;

    if (currentUser?.role === "WORKER") {
      const fullWorker = await db.user.findUnique({
        where: { id: currentUser.id },
        include: { workerProfile: true },
      });
      if (fullWorker) {
        workerProfile = fullWorker.workerProfile;
        if (effectiveLat === undefined && fullWorker.latitude !== null) {
          effectiveLat = fullWorker.latitude ?? undefined;
        }
        if (effectiveLng === undefined && fullWorker.longitude !== null) {
          effectiveLng = fullWorker.longitude ?? undefined;
        }
      }
    }

    // Process and enrich jobs with distances and match scores
    let processedJobs = rawJobs.map((job) => {
      let distanceKm: number | null = null;
      if (effectiveLat !== undefined && effectiveLng !== undefined && job.latitude && job.longitude) {
        distanceKm = calculateDistanceKm(effectiveLat, effectiveLng, job.latitude, job.longitude);
      }

      let matchData = null;
      if (workerProfile) {
        let skillsList: string[] = [];
        try {
          skillsList = JSON.parse(workerProfile.skills || "[]");
        } catch {}

        let reqSkillsList: string[] = [];
        try {
          reqSkillsList = JSON.parse(job.requiredSkills || "[]");
        } catch {}

        matchData = calculateMatchScore(
          {
            skills: skillsList,
            latitude: effectiveLat,
            longitude: effectiveLng,
            preferredDistance: workerProfile.preferredDistance,
            availability: workerProfile.availability,
            experience: workerProfile.experience,
            rating: workerProfile.rating,
            completedJobs: workerProfile.completedJobs,
          },
          {
            requiredSkills: reqSkillsList,
            latitude: job.latitude,
            longitude: job.longitude,
            jobType: job.jobType,
          }
        );
      }

      return {
        ...job,
        requiredSkills: (() => {
          try {
            return JSON.parse(job.requiredSkills);
          } catch {
            return [];
          }
        })(),
        categoryDetails: (() => {
          if (!job.categoryDetails) return null;
          try {
            return typeof job.categoryDetails === "string" ? JSON.parse(job.categoryDetails) : job.categoryDetails;
          } catch {
            return null;
          }
        })(),
        attachmentUrls: (() => {
          if (!job.attachmentUrls) return [];
          try {
            return typeof job.attachmentUrls === "string" ? JSON.parse(job.attachmentUrls) : job.attachmentUrls;
          } catch {
            return [];
          }
        })(),
        distanceKm,
        matchScore: matchData ? matchData.score : null,
        matchReasons: matchData ? matchData.reasons : [],
        applicantsCount: job._count.applications,
      };
    });

    // Apply distance filter if specified
    if (maxDistance && maxDistance > 0 && effectiveLat !== undefined && effectiveLng !== undefined) {
      processedJobs = processedJobs.filter(
        (job) => job.distanceKm !== null && job.distanceKm <= maxDistance
      );
    }

    // Custom sorting for nearest or match relevance
    if (sortBy === "nearest") {
      processedJobs.sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    } else if (sortBy === "relevance" && workerProfile) {
      processedJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedJobs = processedJobs.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      jobs: paginatedJobs,
      pagination: {
        total: processedJobs.length,
        page,
        limit,
        totalPages: Math.ceil(processedJobs.length / limit) || 1,
      },
    });
  } catch (err: any) {
    console.error("Fetch jobs error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["EMPLOYER", "BOTH"]);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    let employer = await db.employerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!employer) {
      // Auto-create employer profile for individual / student / freelancer poster
      const fullUser = await db.user.findUnique({ where: { id: user.id } });
      employer = await db.employerProfile.create({
        data: {
          userId: user.id,
          posterType: "INDIVIDUAL",
          businessName: fullUser?.name ? `${fullUser.name} (Task Poster)` : "Individual Poster",
          businessType: "Personal / Individual",
          description: "Task poster on Work Adda",
          location: fullUser?.location || "Remote",
          verificationStatus: "VERIFIED",
        },
      });
    }

    const body = await req.json();
    const validated = JobCreateSchema.parse(body);

    const job = await db.job.create({
      data: {
        employerId: employer.id,
        title: validated.title,
        description: validated.description,
        category: validated.category,
        subcategory: validated.subcategory || null,
        isRemote: Boolean(validated.isRemote),
        urgency: validated.urgency || "NORMAL",
        budgetType: validated.budgetType || "FIXED",
        pricePerUnit: validated.pricePerUnit ? Number(validated.pricePerUnit) : null,
        unitType: validated.unitType || null,
        quantity: validated.quantity ? Number(validated.quantity) : null,
        deliveryMethod: validated.deliveryMethod || null,
        revisionsAllowed: validated.revisionsAllowed ?? 2,
        categoryDetails: validated.categoryDetails
          ? typeof validated.categoryDetails === "string"
            ? validated.categoryDetails
            : JSON.stringify(validated.categoryDetails)
          : null,
        milestones: validated.milestones
          ? typeof validated.milestones === "string"
            ? validated.milestones
            : JSON.stringify(validated.milestones)
          : null,
        attachmentUrls: validated.attachmentUrls
          ? typeof validated.attachmentUrls === "string"
            ? validated.attachmentUrls
            : JSON.stringify(validated.attachmentUrls)
          : null,
        requiredSkills: JSON.stringify(validated.requiredSkills),
        jobType: validated.jobType,
        location: validated.isRemote ? "Remote / Online" : validated.location,
        latitude: validated.isRemote ? null : (validated.latitude ?? employer.latitude),
        longitude: validated.isRemote ? null : (validated.longitude ?? employer.longitude),
        payAmount: validated.payAmount,
        payType: validated.payType,
        workersRequired: validated.workersRequired,
        deadline: validated.deadline ? new Date(validated.deadline) : null,
        startDate: validated.startDate ? new Date(validated.startDate) : null,
        endDate: validated.endDate ? new Date(validated.endDate) : null,
        status: "OPEN",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Job posted successfully",
      job,
    });
  } catch (err: any) {
    console.error("Create job error:", err);
    if (err.errors) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to create job" }, { status: 500 });
  }
}
