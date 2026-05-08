import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://app-web-vercel.vercel.app",
  "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const paste = await prisma.paste.findUnique({ where: { slug } });

    if (!paste || paste.deletedAt) {
      return NextResponse.json({ error: "Paste no encontrado" }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({
      title: paste.title,
      content: paste.content,
      userId: paste.userId,
      visibility: paste.visibility,
      expiresAt: paste.expiresAt,
    }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener paste" }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(req: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { slug } = await context.params;

    // ✅ VERIFICA EL CORREO: Permite edición si viene del panel con tu correo
    let userEmail = session?.user?.email || body.ownerEmail;

    if (!userEmail) return NextResponse.json({ error: "No autorizado" }, { status: 401, headers: corsHeaders });

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404, headers: corsHeaders });

    const existingPaste = await prisma.paste.findUnique({ where: { slug } });
    if (!existingPaste) return NextResponse.json({ error: "Paste no encontrado" }, { status: 404, headers: corsHeaders });

    if (existingPaste.userId !== user.id) {
      return NextResponse.json({ error: "No puedes editar este paste" }, { status: 403, headers: corsHeaders });
    }

    if (body.restore) {
      const paste = await prisma.paste.update({ where: { slug }, data: { deletedAt: null } });
      return NextResponse.json({ success: true, url: `/${paste.slug}` }, { headers: corsHeaders });
    }

    if (existingPaste.deletedAt) return NextResponse.json({ error: "Paste eliminado" }, { status: 404, headers: corsHeaders });

    const { title, content, visibility, expires } = body;
    let expiresAt = existingPaste.expiresAt;

    if (expires) {
      const now = new Date();
      if (expires === "10m") now.setMinutes(now.getMinutes() + 10);
      else if (expires === "1h") now.setHours(now.getHours() + 1);
      else if (expires === "1d") now.setDate(now.getDate() + 1);
      else if (expires === "7d") now.setDate(now.getDate() + 7);
      else if (expires === "never") expiresAt = null;
      if (expires !== "never") expiresAt = now;
    }

    const paste = await prisma.paste.update({
      where: { slug },
      data: { title, content, visibility, expiresAt },
    });

    return NextResponse.json({ success: true, url: `/${paste.slug}` }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const url = new URL(req.url);
    const ownerEmail = url.searchParams.get("ownerEmail");

    let userEmail = session?.user?.email || ownerEmail;
    if (!userEmail) return NextResponse.json({ error: "No autorizado" }, { status: 401, headers: corsHeaders });

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404, headers: corsHeaders });

    const { slug } = await context.params;
    const paste = await prisma.paste.findUnique({ where: { slug } });

    if (!paste || paste.deletedAt) return NextResponse.json({ error: "Paste no encontrado" }, { status: 404, headers: corsHeaders });
    if (paste.userId !== user.id) return NextResponse.json({ error: "No puedes borrar este paste" }, { status: 403, headers: corsHeaders });

    await prisma.paste.update({ where: { slug }, data: { deletedAt: new Date() } });
    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ error: "Error al borrar" }, { status: 500, headers: corsHeaders });
  }
}