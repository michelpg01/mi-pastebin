import { prisma } from "@/lib/prisma";

import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

// ✅ CORS
const corsHeaders = {
  "Access-Control-Allow-Origin":
    "https://app-web-vercel.vercel.app",

  "Access-Control-Allow-Methods":
    "GET, PUT, DELETE, OPTIONS",

  "Access-Control-Allow-Headers":
    "Content-Type",
};

// ✅ OPTIONS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers:
        corsHeaders,
    }
  );
}

// ✅ expiración helper
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

// ✅ GET
export async function GET(
  req: Request,
  context: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  try {
    const { slug } =
      await context.params;

    const paste =
      await prisma.paste.findUnique(
        {
          where: {
            slug,
          },

          select: {
            title: true,
            content: true,
            userId: true,
            visibility:
              true,
            expiresAt:
              true,
            deletedAt:
              true,
          },
        }
      );

    if (
      !paste ||
      paste.deletedAt
    ) {
      return NextResponse.json(
        {
          error:
            "Paste no encontrado",
        },
        {
          status: 404,
          headers:
            corsHeaders,
        }
      );
    }

    return NextResponse.json(
      {
        title:
          paste.title,
        content:
          paste.content,
        userId:
          paste.userId,
        visibility:
          paste.visibility,
        expiresAt:
          paste.expiresAt,
      },
      {
        headers:
          corsHeaders,
      }
    );
  } catch (error) {
    console.error(
      "GET PASTE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Error al obtener paste",
      },
      {
        status: 500,
        headers:
          corsHeaders,
      }
    );
  }
}

// ✅ PUT
export async function PUT(
  req: Request,
  context: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  try {
    const session =
      await getServerSession(
        authOptions
      );

    const body =
      await req.json();

    const {
      slug,
    } =
      await context.params;

    const userEmail =
      session?.user
        ?.email ||
      body.ownerEmail;

    if (
      !userEmail
    ) {
      return NextResponse.json(
        {
          error:
            "No autorizado",
        },
        {
          status: 401,
          headers:
            corsHeaders,
        }
      );
    }

    const user =
      await prisma.user.findUnique(
        {
          where: {
            email:
              userEmail,
          },

          select: {
            id: true,
          },
        }
      );

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Usuario no encontrado",
        },
        {
          status: 404,
          headers:
            corsHeaders,
        }
      );
    }

    const existingPaste =
      await prisma.paste.findUnique(
        {
          where: {
            slug,
          },

          select: {
            slug: true,
            userId: true,
            deletedAt: true,
            expiresAt: true,
          },
        }
      );

    if (
      !existingPaste
    ) {
      return NextResponse.json(
        {
          error:
            "Paste no encontrado",
        },
        {
          status: 404,
          headers:
            corsHeaders,
        }
      );
    }

    if (
      existingPaste.userId !==
      user.id
    ) {
      return NextResponse.json(
        {
          error:
            "No puedes editar este paste",
        },
        {
          status: 403,
          headers:
            corsHeaders,
        }
      );
    }

    // ✅ restaurar
    if (
      body.restore
    ) {
      const paste =
        await prisma.paste.update(
          {
            where: {
              slug,
            },

            data: {
              deletedAt:
                null,
            },

            select: {
              slug: true,
            },
          }
        );

      return NextResponse.json(
        {
          success:
            true,

          url: `/${paste.slug}`,
        },
        {
          headers:
            corsHeaders,
        }
      );
    }

    if (
      existingPaste.deletedAt
    ) {
      return NextResponse.json(
        {
          error:
            "Paste eliminado",
        },
        {
          status: 404,
          headers:
            corsHeaders,
        }
      );
    }

    const {
      title,
      content,
      visibility,
      expires,
    } = body;

    if (
      content &&
      typeof content !==
        "string"
    ) {
      return NextResponse.json(
        {
          error:
            "Contenido inválido",
        },
        {
          status: 400,
          headers:
            corsHeaders,
        }
      );
    }

    if (
      content &&
      content.length >
        50000000
    ) {
      return NextResponse.json(
        {
          error:
            "La lista IPTV es demasiado grande",
        },
        {
          status: 413,
          headers:
            corsHeaders,
        }
      );
    }

    let expiresAt =
      existingPaste.expiresAt;

    if (expires) {
      expiresAt =
        getExpiration(
          expires
        );
    }

    const safeTitle =
      (
        title ||
        "Sin título"
      )
        .toString()
        .slice(0, 200);

    const paste =
      await prisma.paste.update(
        {
          where: {
            slug,
          },

          data: {
            title:
              safeTitle,

            content,

            visibility,

            expiresAt,
          },

          select: {
            slug: true,
          },
        }
      );

    return NextResponse.json(
      {
        success:
          true,

        url: `/${paste.slug}`,
      },
      {
        headers:
          corsHeaders,
      }
    );
  } catch (error) {
    console.error(
      "UPDATE PASTE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Error al actualizar",
      },
      {
        status: 500,
        headers:
          corsHeaders,
      }
    );
  }
}

// ✅ DELETE
export async function DELETE(
  req: Request,
  context: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  try {
    const session =
      await getServerSession(
        authOptions
      );

    const url =
      new URL(req.url);

    const ownerEmail =
      url.searchParams.get(
        "ownerEmail"
      );

    // ✅ NUEVO
    const permanent =
      url.searchParams.get(
        "permanent"
      );

    const userEmail =
      session?.user
        ?.email ||
      ownerEmail;

    if (
      !userEmail
    ) {
      return NextResponse.json(
        {
          error:
            "No autorizado",
        },
        {
          status: 401,
          headers:
            corsHeaders,
        }
      );
    }

    const user =
      await prisma.user.findUnique(
        {
          where: {
            email:
              userEmail,
          },

          select: {
            id: true,
          },
        }
      );

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Usuario no encontrado",
        },
        {
          status: 404,
          headers:
            corsHeaders,
        }
      );
    }

    const { slug } =
      await context.params;

    const paste =
      await prisma.paste.findUnique(
        {
          where: {
            slug,
          },

          select: {
            userId: true,
            deletedAt: true,
          },
        }
      );

    if (
      !paste
    ) {
      return NextResponse.json(
        {
          error:
            "Paste no encontrado",
        },
        {
          status: 404,
          headers:
            corsHeaders,
        }
      );
    }

    if (
      paste.userId !==
      user.id
    ) {
      return NextResponse.json(
        {
          error:
            "No puedes borrar este paste",
        },
        {
          status: 403,
          headers:
            corsHeaders,
        }
      );
    }

    // ✅ DELETE DEFINITIVO
    if (
      permanent ===
      "true"
    ) {

      await prisma.paste.delete(
        {
          where: {
            slug,
          },
        }
      );

    } else {

      // ✅ papelera
      await prisma.paste.update(
        {
          where: {
            slug,
          },

          data: {
            deletedAt:
              new Date(),
          },
        }
      );

    }

    return NextResponse.json(
      {
        success:
          true,
      },
      {
        headers:
          corsHeaders,
      }
    );
  } catch (error) {
    console.error(
      "DELETE PASTE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Error al borrar",
      },
      {
        status: 500,
        headers:
          corsHeaders,
      }
    );
  }
}