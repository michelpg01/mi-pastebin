import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  const paste = await prisma.paste.findUnique({
    where: {
      slug,
    },
  });

  if (!paste || paste.deletedAt) {
    return new Response("No encontrado", {
      status: 404,
    });
  }

  if (paste.visibility === "private") {
    return new Response("Privado", {
      status: 403,
    });
  }

  if (paste.expiresAt && new Date() > paste.expiresAt) {
    return new Response("Expirado", {
      status: 404,
    });
  }

  return new Response(paste.content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}