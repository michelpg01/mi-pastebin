import { prisma } from "@/lib/prisma";

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

    return Response.json({
      success: true,
      url: `/${paste.slug}`,
    });
  } catch (error) {
    console.error(error);

    return new Response("Error al actualizar", {
      status: 500,
    });
  }
}