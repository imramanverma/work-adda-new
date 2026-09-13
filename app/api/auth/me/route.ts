import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/session";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getRequestUser(req);
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const user = await db.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profileImage: true,
        location: true,
        latitude: true,
        longitude: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        workerProfile: true,
        employerProfile: true,
        _count: {
          select: {
            notifications: {
              where: { isRead: false },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        ...user,
        unreadNotificationsCount: user._count.notifications,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
