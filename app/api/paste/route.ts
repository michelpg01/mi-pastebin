import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ✅ 1. CONFIGURACIÓN DE SEGURIDAD (CORS)
// Solo permitimos que tu panel IPTV se comunique con esta ruta
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://app-web-vercel.vercel.app", 
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ✅ 2. FUNCIÓN OPTIONS (Preflight)
// Los navegadores envían esta petición "fantasma" antes del POST para ver si tienen permiso
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

function generateSlug(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getExpiration(expires: string) {
  // ✅ Añadimos soporte explícito para "never"
  if (!expires || expires === "never") return null; 
  const now = new Date();
  if (expires === "10m") now.setMinutes(now.getMinutes() + 10);
  else if (expires === "1h") now.setHours(now.getHours() + 1);
  else if (expires === "1d") now.setDate(now.getDate() + 1);
  else if (expires === "7d") now.setDate(now.getDate() + 7);
  else return null;
  return now;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    // ✅ Extraemos también el 'ownerEmail' que manda nuestro Panel IPTV
    const { title, content, expires, visibility, ownerEmail } = await req.json();

    const slug = generateSlug(6);
    let userId = null;

    // ✅ ENLAZAMOS LA LISTA A TU CUENTA DE GOOGLE
    if (session?.user?.email) {
      // Si la petición viene de la web del pastebin con alguien logueado
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      userId = user?.id || null;
    } else if (ownerEmail) {
      // Si viene del Panel IPTV y nos manda tu correo
      const user = await prisma.user.findUnique({
        where: { email: ownerEmail },
      });
      userId = user?.id || null;
    }

    const paste = await prisma.paste.create({
      data: {
        slug,
        title,
        content,
        expiresAt: getExpiration(expires),
        visibility: visibility || "unlisted", // Guardamos como oculto por defecto
        userId,
      },
    });

    // ✅ 3. ENVIAMOS LA RESPUESTA CON LOS PERMISOS CORS
    return Response.json(
      {
        url: `/${paste.slug}`,
        raw: `/raw/${paste.slug}`,
      },
      {
        headers: corsHeaders, 
      }
    );
  } catch (error) {
    console.error(error);

    return new Response("Error al crear paste", {
      status: 500,
      headers: corsHeaders, // También adjuntamos permisos si hay error
    });
  }
}