"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [expires, setExpires] = useState("10m");
  const [visibility, setVisibility] = useState("public");
  const [misPastes, setMisPastes] = useState<any[]>([]);

  const router = useRouter();

  const cargarPastes = async () => {
    if (!session) {
      setMisPastes([]);
      return;
    }

    try {
      const res = await fetch("/api/mis-pastes");
      const data = await res.json();

      setMisPastes(
        data.map((paste: any) => ({
          title: paste.title || "Sin título",
          url: `/${paste.slug}`,
        }))
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarPastes();
  }, [session]);

  const createPaste = async () => {
    const res = await fetch("/api/paste", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        content,
        expires,
        visibility,
      }),
    });

    const data = await res.json();

    await cargarPastes();

    router.push(data.url);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-4 sm:px-6 py-8">
      <div className="max-w-[1700px] mx-auto">
        {/* header */}
        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-blue-500">
            Mi Pastebin
          </h1>

          {!session ? (
            <button
              onClick={() => signIn("google")}
              className="px-5 py-3 bg-white text-black rounded-xl font-semibold w-fit"
            >
              Iniciar con Google
            </button>
          ) : (
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-zinc-300">
                {session.user?.name}
              </span>

              <button
                onClick={() => signOut()}
                className="px-5 py-3 bg-red-600 rounded-xl"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>

        {/* layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          {/* editor */}
          <div className="space-y-6">
            {/* barra superior */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between sticky top-4 z-20">
              <div className="flex flex-wrap gap-3">
                <select
                  value={expires}
                  onChange={(e) => setExpires(e.target.value)}
                  className="bg-zinc-800 p-3 rounded-xl"
                >
                  <option value="10m">10 minutos</option>
                  <option value="1h">1 hora</option>
                  <option value="1d">1 día</option>
                  <option value="7d">7 días</option>
                  {session && (
                    <option value="never">
                      Nunca
                    </option>
                  )}
                </select>

                <select
                  value={visibility}
                  onChange={(e) =>
                    setVisibility(e.target.value)
                  }
                  className="bg-zinc-800 p-3 rounded-xl"
                >
                  <option value="public">
                    Público
                  </option>

                  {session && (
                    <option value="private">
                      Privado
                    </option>
                  )}
                </select>
              </div>

              <button
                onClick={createPaste}
                className="px-6 py-3 bg-blue-600 rounded-xl hover:bg-blue-500 transition font-semibold"
              >
                Crear enlace
              </button>
            </div>

            <input
              type="text"
              placeholder="Título del paste"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-700"
            />

            <textarea
              className="w-full h-[65vh] lg:h-[75vh] p-4 rounded-2xl bg-zinc-900 border border-zinc-700 font-mono"
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
              placeholder="Escribe aquí..."
            />
          </div>

          {/* mis pastes */}
          {session && (
            <div className="bg-zinc-900 rounded-2xl border border-zinc-700 p-6 h-fit lg:sticky lg:top-4">
              <h2 className="text-2xl font-bold text-blue-400 mb-6">
                Mis pastes
              </h2>

              <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-2">
                {misPastes.length > 0 ? (
                  misPastes.map((paste, index) => (
                    <a
                      key={index}
                      href={paste.url}
                      className="block p-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition"
                    >
                      <div>
                        {paste.title}
                      </div>

                      <div className="text-sm text-zinc-400">
                        {paste.url}
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="text-zinc-400">
                    No tienes pastes todavía.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}