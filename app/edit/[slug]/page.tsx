"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditPastePage() {
  const params = useParams();
  const router = useRouter();

  const slug = params.slug as string;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPaste() {
      try {
        const res = await fetch(`/api/paste/${slug}`);

        if (!res.ok) {
          alert("No se pudo cargar el paste");
          return;
        }

        const data = await res.json();

        setTitle(data.title || "");
        setContent(data.content || "");
      } catch (error) {
        console.error("Error cargando paste:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPaste();
  }, [slug]);

  const savePaste = async () => {
    try {
      const res = await fetch(`/api/paste/${slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      if (!res.ok) {
        alert("Error al guardar");
        return;
      }

      router.push(`/${slug}`);
    } catch (error) {
      console.error("Error guardando:", error);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Cargando...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-4 sm:px-6 lg:px-8 py-8">
      <div className="w-full lg:w-[80vw] max-w-[1600px] mx-auto space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-yellow-500">
          Editar Paste
        </h1>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título del paste"
          className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-700 text-base sm:text-lg"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe aquí..."
          className="w-full h-[65vh] sm:h-[75vh] p-4 rounded-2xl bg-zinc-900 border border-zinc-700 font-mono text-sm sm:text-base leading-6 sm:leading-7 resize-none"
        />

        <button
          onClick={savePaste}
          className="px-6 py-3 bg-yellow-600 rounded-xl hover:bg-yellow-500 font-semibold transition"
        >
          Guardar cambios
        </button>
      </div>
    </main>
  );
}