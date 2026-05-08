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
    const { title, content, expires, visibility } = await req.json();

    const slug = generateSlug(6);
    let userId = null;

    // Si la petición viene de la web del pastebin con alguien logueado
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      userId = user?.id || null;
    }
    // NOTA: Cuando tu panel envíe la lista, "userId" será null, 
    // creando un paste anónimo pero con la visibilidad que le mandemos (ej: unlisted).

    const paste = await prisma.paste.create({
      data: {
        slug,
        title,
        content,
        expiresAt: getExpiration(expires),
        visibility: visibility || "public",
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