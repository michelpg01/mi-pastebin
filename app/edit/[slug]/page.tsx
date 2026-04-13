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
      <main className="min-h-screen bg-black text-white p-8">
        Cargando...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-yellow-500">
          Editar Paste
        </h1>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-700"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-[500px] p-4 rounded-2xl bg-zinc-900 border border-zinc-700 font-mono"
        />

        <button
          onClick={savePaste}
          className="px-6 py-3 bg-yellow-600 rounded-xl hover:bg-yellow-500"
        >
          Guardar cambios
        </button>
      </div>
    </main>
  );
}