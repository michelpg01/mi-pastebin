import { prisma } from "@/lib/prisma";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

// ✅ NUEVO
import pako from "pako";

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

// ✅ base64 → Uint8Array
function base64ToUint8(
  base64: string
) {
  const binary =
    atob(base64);

  const bytes =
    new Uint8Array(
      binary.length
    );

  for (
    let i = 0;
    i < binary.length;
    i++
  ) {
    bytes[i] =
      binary.charCodeAt(
        i
      );
  }

  return bytes;
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

    // ✅ parse
    const body =
      await req.json();

    let {
      title,
      content,
      expires,
      visibility,
      ownerEmail,
      compressed,
    } = body;

    // ✅ validar
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

    // ✅ NUEVO
    // DESCOMPRESIÓN GZIP
    if (compressed) {
      console.log(
        "GZIP DETECTADO"
      );

      try {
        const compressedBytes =
          base64ToUint8(
            content
          );

        content =
          pako.ungzip(
            compressedBytes,
            {
              to: "string",
            }
          );

        console.log(
          "DESCOMPRESIÓN OK"
        );

        console.log(
          "FINAL SIZE:",
          content.length
        );

        console.log(
          "LINES:",
          content.split(
            "\n"
          ).length
        );
      } catch (err) {
        console.error(
          "ERROR GZIP:",
          err
        );

        return new Response(
          "Error descomprimiendo contenido",
          {
            status: 400,
            headers:
              corsHeaders,
          }
        );
      }
    }

    // ✅ límite real enorme
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

    // ✅ título seguro
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

    // ✅ usuario
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

    console.log(
      "CREANDO PASTE..."
    );

    // ✅ guardar
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

    console.log(
      "PASTE CREADO"
    );

    // ✅ respuesta
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