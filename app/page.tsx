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
  const [papelera, setPapelera] = useState<any[]>([]);
  const [tab, setTab] = useState("activos");
  const [creating, setCreating] = useState(false);

  const router = useRouter();

  const cargarPastes = async () => {
    if (!session) {
      setMisPastes([]);
      setPapelera([]);
      return;
    }

    try {
      const res = await fetch("/api/mis-pastes");
      const data = await res.json();

      setMisPastes(
        data.activos.map((paste: any) => ({
          title: paste.title || "Sin título",
          url: `/${paste.slug}`,
          slug: paste.slug,
          visibility: paste.visibility,
        }))
      );

      setPapelera(
        data.papelera.map((paste: any) => ({
          title: paste.title || "Sin título",
          slug: paste.slug,
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
    try {
      setCreating(true);

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
    } finally {
      setCreating(false);
    }
  };

  const deletePaste = async (slug: string) => {
    const ok = confirm(
      "¿Seguro que quieres mover este paste a la papelera?"
    );

    if (!ok) return;

    await fetch(`/api/paste/${slug}`, {
      method: "DELETE",
    });

    await cargarPastes();
  };

  const restorePaste = async (slug: string) => {
    await fetch(`/api/paste/${slug}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        restore: true,
      }),
    });

    await cargarPastes();
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-4 sm:px-6 py-8">
      <div className="max-w-[1700px] mx-auto">
        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-blue-500">
            Mi Pastebin
          </h1>

          {!session ? (
            <button
              onClick={() => signIn("google")}
              className="px-5 py-3 bg-white text-black rounded-xl font-semibold"
            >
              Iniciar con Google
            </button>
          ) : (
            <div className="flex items-center gap-4 flex-wrap">
              <span>{session.user?.name}</span>

              <button
                onClick={() => signOut()}
                className="px-5 py-3 bg-red-600 rounded-xl"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          {/* editor */}
          <div className="space-y-6">
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
                  <option value="unlisted">
                    Oculto
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
                disabled={creating}
                className="px-6 py-3 bg-blue-600 rounded-xl"
              >
                {creating
                  ? "Creando..."
                  : "Crear enlace"}
              </button>
            </div>

            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="Título del paste"
              className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-700"
            />

            <textarea
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
              placeholder="Escribe aquí..."
              className="w-full h-[70vh] p-4 rounded-2xl bg-zinc-900 border border-zinc-700 font-mono"
            />
          </div>

          {/* panel */}
          {session && (
            <div className="bg-zinc-900 rounded-2xl border border-zinc-700 p-6 h-fit lg:sticky lg:top-4">
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() =>
                    setTab("activos")
                  }
                  className={`px-4 py-2 rounded-xl ${
                    tab === "activos"
                      ? "bg-blue-600"
                      : "bg-zinc-800"
                  }`}
                >
                  Mis pastes
                </button>

                <button
                  onClick={() =>
                    setTab("papelera")
                  }
                  className={`px-4 py-2 rounded-xl ${
                    tab === "papelera"
                      ? "bg-red-600"
                      : "bg-zinc-800"
                  }`}
                >
                  Papelera ({papelera.length})
                </button>
              </div>

              <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
                {tab === "activos" &&
                  misPastes.map((paste, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-zinc-800"
                    >
                      <div>
                        {paste.title}
                      </div>

                      <div className="text-sm text-zinc-400 mt-2">
                        {paste.url}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() =>
                            router.push(
                              paste.url
                            )
                          }
                          className="px-3 py-2 bg-blue-600 rounded-lg text-sm"
                        >
                          Abrir
                        </button>

                        <button
                          onClick={() =>
                            router.push(
                              `/edit/${paste.slug}`
                            )
                          }
                          className="px-3 py-2 bg-yellow-600 rounded-lg text-sm"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() =>
                            deletePaste(
                              paste.slug
                            )
                          }
                          className="px-3 py-2 bg-red-600 rounded-lg text-sm"
                        >
                          Borrar
                        </button>
                      </div>
                    </div>
                  ))}

                {tab === "papelera" &&
                  (papelera.length > 0 ? (
                    papelera.map((paste, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-zinc-800"
                      >
                        <div>
                          {paste.title}
                        </div>

                        <button
                          onClick={() =>
                            restorePaste(
                              paste.slug
                            )
                          }
                          className="mt-4 px-3 py-2 bg-green-600 rounded-lg text-sm"
                        >
                          Restaurar
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-zinc-400">
                      Papelera vacía.
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}