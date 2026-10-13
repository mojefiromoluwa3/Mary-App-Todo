import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { settingsSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        theme: true,
        emailNotifications: true,
        createdAt: true,
        _count: {
          select: {
            tasks: true,
            categories: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = settingsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Invalid settings input" },
        { status: 400 }
      );
    }

    const { name, theme, emailNotifications } = result.data;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(theme ? { theme } : {}),
        ...(emailNotifications !== undefined ? { emailNotifications } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        theme: true,
        emailNotifications: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
