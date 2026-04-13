import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
    const { slug } = await context.params;
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