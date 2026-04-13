"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  signIn,
  signOut,
  useSession,
} from "next-auth/react";

export default function Home() {
  const { data: session } =
    useSession();

  const [title, setTitle] =
    useState("");
  const [content, setContent] =
    useState("");
  const [expires, setExpires] =
    useState("10m");
  const [visibility, setVisibility] =
    useState("public");
  const [misPastes, setMisPastes] =
    useState<any[]>([]);
  const [papelera, setPapelera] =
    useState<any[]>([]);
  const [tab, setTab] =
    useState("activos");
  const [creating, setCreating] =
    useState(false);

  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const formatRemainingTime = (
    expiresAt: string | null
  ) => {
    if (!expiresAt)
      return "Sin expiración";

    const diff =
      new Date(
        expiresAt
      ).getTime() -
      Date.now();

    if (diff <= 0)
      return "Expirado";

    const minutes =
      Math.floor(
        diff / 1000 / 60
      );

    if (minutes < 60)
      return `Vence en ${minutes} min`;

    const hours =
      Math.floor(
        minutes / 60
      );

    if (hours < 24)
      return `Vence en ${hours} h`;

    return `Vence en ${Math.floor(
      hours / 24
    )} días`;
  };

  const copyToClipboard =
    async (
      text: string,
      type: string
    ) => {
      try {
        await navigator.clipboard.writeText(
          text
        );
        alert(
          `${type} copiado`
        );
      } catch {
        alert(
          "No se pudo copiar"
        );
      }
    };

  const cargarPastes =
    async () => {
      if (!session) {
        setMisPastes([]);
        setPapelera([]);
        return;
      }

      try {
        const res =
          await fetch(
            "/api/mis-pastes"
          );

        const data =
          await res.json();

        setMisPastes(
          data.activos || []
        );

        setPapelera(
          data.papelera || []
        );
      } catch (error) {
        console.error(
          error
        );
      }
    };

  useEffect(() => {
    cargarPastes();
  }, [session]);

  const createPaste =
    async () => {
      try {
        setCreating(true);

        const res =
          await fetch(
            "/api/paste",
            {
              method:
                "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify(
                {
                  title,
                  content,
                  expires,
                  visibility,
                }
              ),
            }
          );

        const data =
          await res.json();

        await cargarPastes();

        router.push(
          data.url
        );
      } finally {
        setCreating(false);
      }
    };

  const deletePaste =
    async (
      slug: string
    ) => {
      if (
        !confirm(
          "¿Seguro?"
        )
      )
        return;

      await fetch(
        `/api/paste/${slug}`,
        {
          method:
            "DELETE",
        }
      );

      cargarPastes();
    };

  const restorePaste =
    async (
      slug: string
    ) => {
      await fetch(
        `/api/paste/${slug}`,
        {
          method:
            "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            {
              restore:
                true,
            }
          ),
        }
      );

      cargarPastes();
    };

  return (
    <main className="h-screen theme-bg px-4 sm:px-6 py-4 overflow-hidden">
      <div className="max-w-[1800px] mx-auto h-full flex flex-col">
        {/* header */}
        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-4 shrink-0">
          <h1 className="text-4xl sm:text-5xl font-bold text-blue-500">
            Mi Pastebin
          </h1>

          {!session ? (
            <button
              onClick={() =>
                signIn(
                  "google"
                )
              }
              className="px-5 py-3 bg-white text-black rounded-xl font-semibold"
            >
              Iniciar con Google
            </button>
          ) : (
            <div className="flex items-center gap-4 flex-wrap">
              <span>
                {
                  session
                    .user
                    ?.name
                }
              </span>

              <button
                onClick={() =>
                  signOut()
                }
                className="px-5 py-3 bg-red-600 text-white rounded-xl"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>

        {/* layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 flex-1 min-h-0">
          {/* izquierda */}
          <div className="flex flex-col gap-4 min-h-0">
            <div className="theme-card rounded-2xl p-4 flex flex-wrap gap-3 justify-between shrink-0">
              <div className="flex gap-3 flex-wrap">
                <select
                  value={expires}
                  onChange={(e) =>
                    setExpires(
                      e.target.value
                    )
                  }
                  className="theme-input p-3 rounded-xl"
                >
                  <option value="10m">
                    10 minutos
                  </option>
                  <option value="1h">
                    1 hora
                  </option>
                  <option value="1d">
                    1 día
                  </option>
                  <option value="7d">
                    7 días
                  </option>
                  {session && (
                    <option value="never">
                      Nunca
                    </option>
                  )}
                </select>

                <select
                  value={
                    visibility
                  }
                  onChange={(e) =>
                    setVisibility(
                      e.target.value
                    )
                  }
                  className="theme-input p-3 rounded-xl"
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
                onClick={
                  createPaste
                }
                disabled={
                  creating
                }
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold"
              >
                {creating
                  ? "Creando..."
                  : "Crear enlace"}
              </button>
            </div>

            <input
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              placeholder="Título del paste"
              className="w-full p-4 rounded-2xl theme-input shrink-0"
            />

            <div className="flex-1 min-h-0">
              <textarea
                value={
                  content
                }
                onChange={(e) =>
                  setContent(
                    e.target.value
                  )
                }
                placeholder="Escribe aquí..."
                className="w-full h-full min-h-0 p-4 rounded-2xl theme-input font-mono resize-none overflow-y-auto"
              />
            </div>
          </div>

          {/* derecha */}
          {session && (
            <div className="theme-card rounded-2xl p-6 flex flex-col min-h-0">
              <div className="flex gap-2 mb-4 shrink-0">
                <button
                  onClick={() =>
                    setTab(
                      "activos"
                    )
                  }
                  className={`px-4 py-2 rounded-xl text-white ${
                    tab ===
                    "activos"
                      ? "bg-blue-600"
                      : "bg-zinc-700"
                  }`}
                >
                  Mis pastes
                </button>

                <button
                  onClick={() =>
                    setTab(
                      "papelera"
                    )
                  }
                  className={`px-4 py-2 rounded-xl text-white ${
                    tab ===
                    "papelera"
                      ? "bg-red-600"
                      : "bg-zinc-700"
                  }`}
                >
                  Papelera (
                  {
                    papelera.length
                  }
                  )
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {tab ===
                  "activos" &&
                  misPastes.map(
                    (
                      paste: any,
                      i
                    ) => (
                      <div
                        key={
                          i
                        }
                        className="theme-card p-4 rounded-2xl"
                      >
                        <div className="font-semibold text-lg">
                          {
                            paste.title
                          }
                        </div>

                        <div className="text-sm opacity-70 mt-1">
                          /{
                            paste.slug
                          }
                        </div>

                        <div className="text-sm mt-2">
                          {formatRemainingTime(
                            paste.expiresAt
                          )}
                        </div>

                        <div className="flex gap-2 mt-4 flex-wrap">
                          <button
                            onClick={() =>
                              router.push(
                                `/${paste.slug}`
                              )
                            }
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg"
                          >
                            Abrir
                          </button>

                          <button
                            onClick={() =>
                              copyToClipboard(
                                `${window.location.origin}/${paste.slug}`,
                                "Enlace"
                              )
                            }
                            className="px-3 py-2 bg-cyan-600 text-white rounded-lg"
                          >
                            Copiar
                            link
                          </button>

                          <button
                            onClick={() =>
                              copyToClipboard(
                                `${window.location.origin}/raw/${paste.slug}`,
                                "RAW"
                              )
                            }
                            className="px-3 py-2 bg-purple-600 text-white rounded-lg"
                          >
                            Copiar
                            RAW
                          </button>

                          <button
                            onClick={() =>
                              router.push(
                                `/edit/${paste.slug}`
                              )
                            }
                            className="px-3 py-2 bg-yellow-600 text-white rounded-lg"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() =>
                              deletePaste(
                                paste.slug
                              )
                            }
                            className="px-3 py-2 bg-red-600 text-white rounded-lg"
                          >
                            Borrar
                          </button>
                        </div>
                      </div>
                    )
                  )}

                {tab ===
                  "papelera" &&
                  papelera.map(
                    (
                      paste: any,
                      i
                    ) => (
                      <div
                        key={
                          i
                        }
                        className="theme-card p-4 rounded-2xl"
                      >
                        <div className="font-semibold">
                          {
                            paste.title
                          }
                        </div>

                        <button
                          onClick={() =>
                            restorePaste(
                              paste.slug
                            )
                          }
                          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-xl"
                        >
                          Restaurar
                        </button>
                      </div>
                    )
                  )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}