"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [expires, setExpires] = useState("10m");
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
      console.error("Error cargando pastes:", error);
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
      }),
    });

    const data = await res.json();

    await cargarPastes();

    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${data.url}`
      );
    } catch {}

    setTimeout(() => {
      router.push(data.url);
    }, 800);
  };

  const deletePasteFromHistory = (indexToDelete: number) => {
    const confirmDelete = window.confirm(
      "¿Seguro que quieres quitar este paste de la lista?"
    );

    if (!confirmDelete) return;

    const updated = misPastes.filter(
      (_, index) => index !== indexToDelete
    );

    setMisPastes(updated);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-5xl font-bold text-blue-500">
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
            <div className="flex items-center gap-4">
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

        <input
          type="text"
          placeholder="Título del paste"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-700"
        />

        <textarea
          className="w-full h-[500px] p-4 rounded-2xl bg-zinc-900 border border-zinc-700"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe aquí..."
        />

        <div className="flex gap-4 items-center">
          <select
            value={expires}
            onChange={(e) => setExpires(e.target.value)}
            className="bg-zinc-900 p-3 rounded-xl"
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

          <button
            onClick={createPaste}
            className="px-6 py-3 bg-blue-600 rounded-xl hover:bg-blue-500 transition"
          >
            Crear enlace
          </button>
        </div>

        {session && misPastes.length > 0 && (
          <div className="bg-zinc-900 rounded-2xl border border-zinc-700 p-6 mt-8">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">
              Mis pastes
            </h2>

            <div className="space-y-3">
              {misPastes.map((paste, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 rounded-xl bg-zinc-800"
                >
                  <a href={paste.url} className="flex-1">
                    <div>{paste.title}</div>

                    <div className="text-sm text-zinc-400">
                      {paste.url}
                    </div>
                  </a>

                  <button
                    onClick={() =>
                      deletePasteFromHistory(index)
                    }
                    className="ml-4 px-4 py-2 bg-red-600 rounded-xl"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}