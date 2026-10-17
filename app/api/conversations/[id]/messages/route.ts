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

    // 1. Parallel fetch conversation metadata and messages for ultra-fast response
    const [conversation, messages] = await Promise.all([
      db.conversation.findUnique({
        where: { id: params.id },
        select: {
          id: true,
          workerId: true,
          employerId: true,
          createdAt: true,
          job: {
            select: {
              id: true,
              title: true,
              category: true,
              payAmount: true,
              payType: true,
              location: true,
              status: true,
            },
          },
          worker: {
            select: {
              id: true,
              name: true,
              phone: true,
              profileImage: true,
            },
          },
          employer: {
            select: {
              id: true,
              name: true,
              phone: true,
              profileImage: true,
              employerProfile: {
                select: { businessName: true, shopImage: true },
              },
            },
          },
        },
      }),
      db.message.findMany({
        where: { conversationId: params.id },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          conversationId: true,
          senderId: true,
          message: true,
          isRead: true,
          createdAt: true,
        },
      }),
    ]);

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (user.id !== conversation.workerId && user.id !== conversation.employerId && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 2. Mark other party's messages as read ONLY IF unread messages actually exist
    // Executed asynchronously without blocking the JSON response
    const hasUnread = messages.some((m) => !m.isRead && m.senderId !== user.id);
    if (hasUnread) {
      db.message
        .updateMany({
          where: {
            conversationId: params.id,
            senderId: { not: user.id },
            isRead: false,
          },
          data: { isRead: true },
        })
        .catch((e) => console.error("Async mark messages read error:", e));
    }

    return NextResponse.json(
      { conversation, messages },
      {
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
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
      select: {
        id: true,
        workerId: true,
        employerId: true,
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
    const trimmedMessage = message.trim();

    const recipientId = user.id === conversation.workerId ? conversation.employerId : conversation.workerId;

    // Concurrently create the message and the push notification for 2x faster send speeds
    const [newMessage] = await Promise.all([
      db.message.create({
        data: {
          conversationId: params.id,
          senderId: user.id,
          message: trimmedMessage,
          isRead: false,
        },
        select: {
          id: true,
          conversationId: true,
          senderId: true,
          message: true,
          isRead: true,
          createdAt: true,
        },
      }),
      db.notification.create({
        data: {
          userId: recipientId,
          title: "New Message 💬",
          message: `${user.name}: "${trimmedMessage.length > 50 ? trimmedMessage.substring(0, 47) + "..." : trimmedMessage}"`,
          type: "MESSAGE",
        },
      }),
    ]);

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
