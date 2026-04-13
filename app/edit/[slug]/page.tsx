"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditPastePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorCol, setCursorCol] = useState(1);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);
  const autosaveRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadPaste() {
      try {
        const res = await fetch(`/api/paste/${slug}`);
        if (!res.ok) return;
        const data = await res.json();
        setTitle(data.title || "");
        setContent(data.content || "");
      } finally {
        setLoading(false);
      }
    }
    loadPaste();
  }, [slug]);

  const savePaste = async (silent = false) => {
    try {
      if (!silent) setSaving(true);
      const res = await fetch(`/api/paste/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) return;
      setHasChanges(false);
      if (!silent) router.push(`/${slug}`);
    } finally {
      if (!silent) setSaving(false);
    }
  };

  useEffect(() => {
    if (!hasChanges || loading) return;
    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    autosaveRef.current = setTimeout(() => savePaste(true), 5000);
    return () => {
      if (autosaveRef.current) clearTimeout(autosaveRef.current);
    };
  }, [title, content, hasChanges, loading]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  const lines = content.split("\n");

  const handleContentChange = (value: string) => {
    setContent(value);
    setHasChanges(true);
  };

  const handleCursor = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const pos = textarea.selectionStart;
    const textBefore = textarea.value.substring(0, pos);
    const split = textBefore.split("\n");
    setCursorLine(split.length);
    setCursorCol(split[split.length - 1].length + 1);
  };

  const syncScroll = () => {
    if (textareaRef.current && lineRef.current) {
      lineRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const copyContent = async () => {
    await navigator.clipboard.writeText(content);
    alert("Contenido copiado");
  };

  if (loading) {
    return <main className="min-h-screen bg-black text-white flex items-center justify-center">Cargando...</main>;
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-4 sm:px-6 lg:px-8 py-8">
      <div className="w-full lg:w-[80vw] max-w-[1600px] mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-yellow-500">Editar Paste</h1>
          <div className="flex gap-3 flex-wrap">
            <div className="bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-2xl text-zinc-300 font-semibold">
              {lines.length} líneas
            </div>
            <button onClick={copyContent} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl font-semibold">
              Copiar
            </button>
          </div>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setHasChanges(true);
          }}
          placeholder="Título del paste"
          className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-700 outline-none"
        />

        <div className="bg-zinc-900 border border-zinc-700 rounded-3xl overflow-hidden shadow-lg">
          <div className="bg-zinc-950 border-b border-zinc-700 px-6 py-3 text-sm text-zinc-400 font-semibold">
            {title || slug}
          </div>

          <div className="flex h-[65vh] sm:h-[75vh]">
            <div
              ref={lineRef}
              className="w-16 shrink-0 bg-zinc-950 border-r border-zinc-800 overflow-hidden text-right px-3 py-4 text-zinc-500 select-none font-mono text-sm leading-7"
            >
              {lines.map((_, i) => (
                <div
                  key={i}
                  className={cursorLine === i + 1 ? "text-yellow-400 bg-zinc-800 rounded" : ""}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              onScroll={syncScroll}
              onClick={handleCursor}
              onKeyUp={handleCursor}
              placeholder="Escribe aquí..."
              className="flex-1 bg-zinc-900 text-white p-4 font-mono text-sm sm:text-base leading-7 resize-none outline-none"
              spellCheck={false}
            />
          </div>

          <div className="bg-zinc-950 border-t border-zinc-700 px-6 py-3 text-sm text-zinc-400 flex justify-between">
            <span>{hasChanges ? "Cambios sin guardar" : "Guardado"}</span>
            <span>Línea {cursorLine}, Col {cursorCol}</span>
          </div>
        </div>

        <button
          disabled={saving}
          onClick={() => savePaste(false)}
          className="px-6 py-3 bg-yellow-600 rounded-xl hover:bg-yellow-500 font-semibold transition disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </main>
  );
}