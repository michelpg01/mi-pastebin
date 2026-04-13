import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({
        activos: [],
        papelera: [],
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json({
        activos: [],
        papelera: [],
      });
    }

    const activos = await prisma.paste.findMany({
      where: {
        userId: user.id,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const papelera = await prisma.paste.findMany({
      where: {
        userId: user.id,
        deletedAt: {
          not: null,
        },
      },
      orderBy: {
        deletedAt: "desc",
      },
    });

    return NextResponse.json({
      activos,
      papelera,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      activos: [],
      papelera: [],
    });
  }
}