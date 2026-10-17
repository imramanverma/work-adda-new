import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    const conversations = await db.conversation.findMany({
      where: {
        OR: [{ workerId: user.id }, { employerId: user.id }],
      },
      include: {
        job: {
          select: { id: true, title: true, category: true, payAmount: true, payType: true, location: true },
        },
        worker: {
          select: { id: true, name: true, role: true, profileImage: true, phone: true },
        },
        employer: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            phone: true,
            employerProfile: { select: { businessName: true, shopImage: true } },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            message: true,
            createdAt: true,
            isRead: true,
            senderId: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: user.id },
                isRead: false,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Sort by latest message activity (most active chats float to top)
    conversations.sort((a, b) => {
      const timeA = a.messages[0]?.createdAt
        ? new Date(a.messages[0].createdAt).getTime()
        : new Date(a.createdAt).getTime();
      const timeB = b.messages[0]?.createdAt
        ? new Date(b.messages[0].createdAt).getTime()
        : new Date(b.createdAt).getTime();
      return timeB - timeA;
    });

    return NextResponse.json(
      { conversations },
      {
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (err: any) {
    console.error("Fetch conversations error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch conversations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    const body = await req.json();
    const { jobId, workerId, employerId } = body;

    if (!jobId || !workerId || !employerId) {
      return NextResponse.json({ error: "jobId, workerId, and employerId are required" }, { status: 400 });
    }

    if (user.id !== workerId && user.id !== employerId && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    let conversation = await db.conversation.findFirst({
      where: {
        jobId,
        workerId,
        employerId,
      },
      include: {
        job: { select: { id: true, title: true } },
        worker: { select: { id: true, name: true } },
        employer: {
          select: {
            id: true,
            name: true,
            employerProfile: { select: { businessName: true } },
          },
        },
      },
    });

    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          jobId,
          workerId,
          employerId,
        },
        include: {
          job: { select: { id: true, title: true } },
          worker: { select: { id: true, name: true } },
          employer: {
            select: {
              id: true,
              name: true,
              employerProfile: { select: { businessName: true } },
            },
          },
        },
      });
    }

    return NextResponse.json({ conversation });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create conversation" }, { status: 500 });
  }
}
