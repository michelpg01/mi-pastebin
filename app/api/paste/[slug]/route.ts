import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const paste = await prisma.paste.findUnique({
      where: { slug },
    });

    if (!paste || paste.deletedAt) {
      return NextResponse.json(
        { error: "Paste no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      title: paste.title,
      content: paste.content,
      userId: paste.userId,
      visibility: paste.visibility,
      expiresAt: paste.expiresAt,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error al obtener paste" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const { slug } = await context.params;

    const existingPaste = await prisma.paste.findUnique({
      where: { slug },
    });

    if (!existingPaste) {
      return NextResponse.json(
        { error: "Paste no encontrado" },
        { status: 404 }
      );
    }

    if (existingPaste.userId !== user.id) {
      return NextResponse.json(
        { error: "No puedes editar este paste" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // restaurar
    if (body.restore) {
      const paste = await prisma.paste.update({
        where: { slug },
        data: {
          deletedAt: null,
        },
      });

      return NextResponse.json({
        success: true,
        url: `/${paste.slug}`,
      });
    }

    if (existingPaste.deletedAt) {
      return NextResponse.json(
        { error: "Paste eliminado" },
        { status: 404 }
      );
    }

    const {
      title,
      content,
      visibility,
      expires,
    } = body;

    let expiresAt = existingPaste.expiresAt;

    if (expires) {
      const now = new Date();

      if (expires === "10m") {
        now.setMinutes(now.getMinutes() + 10);
      } else if (expires === "1h") {
        now.setHours(now.getHours() + 1);
      } else if (expires === "1d") {
        now.setDate(now.getDate() + 1);
      } else if (expires === "7d") {
        now.setDate(now.getDate() + 7);
      } else if (expires === "never") {
        expiresAt = null;
      }

      if (expires !== "never") {
        expiresAt = now;
      }
    }

    const paste = await prisma.paste.update({
      where: { slug },
      data: {
        title,
        content,
        visibility,
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      url: `/${paste.slug}`,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error al actualizar" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const { slug } = await context.params;

    const paste = await prisma.paste.findUnique({
      where: { slug },
    });

    if (!paste || paste.deletedAt) {
      return NextResponse.json(
        { error: "Paste no encontrado" },
        { status: 404 }
      );
    }

    if (paste.userId !== user.id) {
      return NextResponse.json(
        { error: "No puedes borrar este paste" },
        { status: 403 }
      );
    }

    await prisma.paste.update({
      where: { slug },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error al borrar" },
      { status: 500 }
    );
  }
}