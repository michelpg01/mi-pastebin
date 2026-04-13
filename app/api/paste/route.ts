import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
  } else if (expires === "7d") {
    now.setDate(now.getDate() + 7);
  } else {
    return null;
  }

  return now;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    const { title, content, expires } = await req.json();

    const slug = generateSlug(6);

    let userId = null;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: {
          email: session.user.email,
        },
      });

      userId = user?.id || null;
    }

    const paste = await prisma.paste.create({
      data: {
        slug,
        title,
        content,
        expiresAt: getExpiration(expires),
        userId,
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