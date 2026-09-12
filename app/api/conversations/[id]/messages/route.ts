import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { SendMessageSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(req);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    const conversation = await db.conversation.findUnique({
      where: { id: params.id },
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
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (user.id !== conversation.workerId && user.id !== conversation.employerId && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Mark other party's messages as read
    await db.message.updateMany({
      where: {
        conversationId: params.id,
        senderId: { not: user.id },
        isRead: false,
      },
      data: { isRead: true },
    });

    const messages = await db.message.findMany({
      where: { conversationId: params.id },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    return NextResponse.json({ conversation, messages });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(req);
    if ("error" in authResult) return authResult.error;
    const { user } = authResult;

    const conversation = await db.conversation.findUnique({
      where: { id: params.id },
      include: {
        job: true,
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (user.id !== conversation.workerId && user.id !== conversation.employerId && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { message } = SendMessageSchema.parse(body);

    const newMessage = await db.message.create({
      data: {
        conversationId: params.id,
        senderId: user.id,
        message,
        isRead: false,
      },
      include: {
        sender: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    // Notify recipient
    const recipientId = user.id === conversation.workerId ? conversation.employerId : conversation.workerId;
    await db.notification.create({
      data: {
        userId: recipientId,
        title: "New Message 💬",
        message: `${user.name}: "${message.length > 50 ? message.substring(0, 47) + "..." : message}"`,
        type: "MESSAGE",
      },
    });

    return NextResponse.json({
      success: true,
      message: newMessage,
    });
  } catch (err: any) {
    console.error("Send message error:", err);
    if (err.errors) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to send message" }, { status: 500 });
  }
}
