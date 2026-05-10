import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ✅ CORS
const corsHeaders = {
  "Access-Control-Allow-Origin":
    "https://app-web-vercel.vercel.app",

  "Access-Control-Allow-Methods":
    "POST, OPTIONS",

  "Access-Control-Allow-Headers":
    "Content-Type",
};

// ✅ OPTIONS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// ✅ generar slug
function generateSlug(
  length = 6
) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let result = "";

  for (
    let i = 0;
    i < length;
    i++
  ) {
    result += chars.charAt(
      Math.floor(
        Math.random() *
          chars.length
      )
    );
  }

  return result;
}

// ✅ expiración
function getExpiration(
  expires: string
) {
  if (
    !expires ||
    expires === "never"
  )
    return null;

  const now = new Date();

  if (expires === "10m") {
    now.setMinutes(
      now.getMinutes() + 10
    );
  } else if (
    expires === "1h"
  ) {
    now.setHours(
      now.getHours() + 1
    );
  } else if (
    expires === "1d"
  ) {
    now.setDate(
      now.getDate() + 1
    );
  } else if (
    expires === "7d"
  ) {
    now.setDate(
      now.getDate() + 7
    );
  } else {
    return null;
  }

  return now;
}

// ✅ POST
export async function POST(
  req: Request
) {
  try {
    const session =
      await getServerSession(
        authOptions
      );

    // ✅ parse seguro
    const body =
      await req.json();

    const {
      title,
      content,
      expires,
      visibility,
      ownerEmail,
    } = body;

    // ✅ validaciones básicas
    if (
      !content ||
      typeof content !==
        "string"
    ) {
      return new Response(
        "Contenido inválido",
        {
          status: 400,
          headers:
            corsHeaders,
        }
      );
    }

    // ✅ límite MUY ALTO
    // ~50MB aprox
    if (
      content.length >
      50000000
    ) {
      return new Response(
        "La lista IPTV es demasiado grande",
        {
          status: 413,
          headers:
            corsHeaders,
        }
      );
    }

    // ✅ evitar títulos gigantes
    const safeTitle =
      (
        title ||
        "Sin título"
      )
        .toString()
        .slice(0, 200);

    const slug =
      generateSlug(6);

    let userId =
      null;

    // ✅ enlazar usuario
    if (
      session?.user
        ?.email
    ) {
      const user =
        await prisma.user.findUnique(
          {
            where: {
              email:
                session
                  .user
                  .email,
            },
            select: {
              id: true,
            },
          }
        );

      userId =
        user?.id ||
        null;
    } else if (
      ownerEmail
    ) {
      const user =
        await prisma.user.findUnique(
          {
            where: {
              email:
                ownerEmail,
            },
            select: {
              id: true,
            },
          }
        );

      userId =
        user?.id ||
        null;
    }

    // ✅ create optimizado
    const paste =
      await prisma.paste.create(
        {
          data: {
            slug,
            title:
              safeTitle,
            content,
            expiresAt:
              getExpiration(
                expires
              ),
            visibility:
              visibility ||
              "unlisted",
            userId,
          },

          select: {
            slug: true,
          },
        }
      );

    // ✅ respuesta rápida
    return Response.json(
      {
        url: `/${paste.slug}`,
        raw: `/raw/${paste.slug}`,
      },
      {
        headers:
          corsHeaders,
      }
    );
  } catch (error) {
    console.error(
      "CREATE PASTE ERROR:",
      error
    );

    return new Response(
      "Error al crear paste",
      {
        status: 500,
        headers:
          corsHeaders,
      }
    );
  }
}