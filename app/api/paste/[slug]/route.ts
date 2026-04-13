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
      where: {
        slug,
      },
    });

    if (!paste) {
      return NextResponse.json(
        { error: "Paste no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      title: paste.title,
      content: paste.content,
      userId: paste.userId,
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
      where: {
        slug,
      },
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

    const { title, content } = await req.json();

    const paste = await prisma.paste.update({
      where: {
        slug,
      },
      data: {
        title,
        content,
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