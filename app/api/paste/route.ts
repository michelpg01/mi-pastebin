import { prisma } from "@/lib/prisma";

function generateSlug(length = 6) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }

  return result;
}

function getExpiration(expires: string) {
  const now = new Date();

  if (expires === "10m") {
    now.setMinutes(now.getMinutes() + 10);
  } else if (expires === "1h") {
    now.setHours(now.getHours() + 1);
  } else if (expires === "1d") {
    now.setDate(now.getDate() + 1);
  } else {
    return null;
  }

  return now;
}

export async function POST(req: Request) {
  try {
    const { title, content, expires } = await req.json();

    const slug = generateSlug(6);

    const paste = await prisma.paste.create({
      data: {
        slug,
        title,
        content,
        expiresAt: getExpiration(expires),
      },
    });

    return Response.json({
      url: `/${paste.slug}`,
      raw: `/raw/${paste.slug}`,
    });
  } catch (error) {
    console.error(error);

    return new Response("Error al crear paste", {
      status: 500,
    });
  }
}