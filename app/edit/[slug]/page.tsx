"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      if (!res.ok) return;

      setHasChanges(false);

      if (!silent) {
        router.push(`/${slug}`);
      }
    } finally {
      if (!silent) {
        setSaving(false);
      }
    }
  };

  useEffect(() => {
    if (!hasChanges || loading) return;

    if (autosaveRef.current) {
      clearTimeout(autosaveRef.current);
    }

    autosaveRef.current = setTimeout(() => {
      savePaste(true);
    }, 5000);

    return () => {
      if (autosaveRef.current) {
        clearTimeout(autosaveRef.current);
      }
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

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [hasChanges]);

  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(content);
      alert("Contenido copiado");
    } catch {
      alert("No se pudo copiar");
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-yellow-500">
            Editar Paste
          </h1>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => router.push(`/${slug}`)}
              className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-xl font-semibold"
            >
              Salir
            </button>

            <button
              onClick={() => router.push("/")}
              className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-xl font-semibold"
            >
              Mis pastes
            </button>

            <div className="bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-2xl text-zinc-300 font-semibold">
              {content.split("\n").length} líneas
            </div>

            <button
              disabled={saving}
              onClick={() => savePaste(false)}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-xl font-semibold transition disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>

            <button
              onClick={copyContent}
              className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl font-semibold"
            >
              Copiar
            </button>
          </div>
        </div>

        {/* Título */}
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

        {/* Monaco */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-3xl overflow-hidden shadow-lg">
          <div className="bg-zinc-950 border-b border-zinc-700 px-6 py-3 text-sm text-zinc-400 font-semibold">
            {title || slug}
          </div>

          <div className="h-[65vh] sm:h-[75vh]">
            <Editor
              height="100%"
              defaultLanguage="plaintext"
              theme="vs-dark"
              value={content}
              onChange={(value) => {
                setContent(value || "");
                setHasChanges(true);
              }}
              onMount={(editor) => {
                editor.onDidChangeCursorPosition((e) => {
                  setCursorLine(
                    e.position.lineNumber
                  );
                  setCursorCol(e.position.column);
                });
              }}
              options={{
                fontSize: 15,
                fontFamily:
                  "JetBrains Mono, monospace",
                lineHeight: 28,
                minimap: {
                  enabled: true,
                },
                automaticLayout: true,
                scrollBeyondLastLine: false,
                wordWrap: "on",
                smoothScrolling: true,
              }}
            />
          </div>

          <div className="bg-zinc-950 border-t border-zinc-700 px-6 py-3 text-sm text-zinc-400 flex justify-between">
            <span>
              {hasChanges
                ? "Cambios sin guardar"
                : "Guardado"}
            </span>

            <span>
              Línea {cursorLine}, Col {cursorCol}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}