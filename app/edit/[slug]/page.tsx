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
      const res = await fetch(`/${slug}`);
      const html = await res.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const titleText =
        doc.querySelector("h1")?.textContent || "";

      const contentText =
        doc.querySelector("pre")?.textContent || "";

      setTitle(titleText);
      setContent(contentText);
      setLoading(false);
    }

    loadPaste();
  }, [slug]);

  const savePaste = async () => {
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

    const data = await res.json();

    router.push(data.url);
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
          className="w-full h-[500px] p-4 rounded-2xl bg-zinc-900 border border-zinc-700"
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