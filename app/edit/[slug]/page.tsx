"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";
import Editor from "@monaco-editor/react";

type MonacoEditorType = any;

type SeasonItem = {
  seasonLabel: string;
  line: number;
};

type SeriesMap = {
  [seriesName: string]: SeasonItem[];
};

export default function EditPastePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] =
    useState(false);
  const [cursorLine, setCursorLine] =
    useState(1);
  const [cursorCol, setCursorCol] =
    useState(1);
  const [expandedSeries, setExpandedSeries] =
    useState<string | null>(null);

  const autosaveRef =
    useRef<NodeJS.Timeout | null>(null);
  const editorRef =
    useRef<MonacoEditorType | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    async function loadPaste() {
      try {
        const res = await fetch(
          `/api/paste/${slug}`
        );

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

  const savePaste = async (
    silent = false
  ) => {
    try {
      if (!silent) setSaving(true);

      const res = await fetch(
        `/api/paste/${slug}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title,
            content,
          }),
        }
      );

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
        clearTimeout(
          autosaveRef.current
        );
      }
    };
  }, [
    title,
    content,
    hasChanges,
    loading,
  ]);

  useEffect(() => {
    const handleBeforeUnload = (
      e: BeforeUnloadEvent
    ) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [hasChanges]);

  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(
        content
      );
      alert("Contenido copiado");
    } catch {
      alert("No se pudo copiar");
    }
  };

  const goToLine = (line: number) => {
    if (!editorRef.current) return;

    editorRef.current.revealLineInCenter(
      line
    );

    editorRef.current.setPosition({
      lineNumber: line,
      column: 1,
    });

    editorRef.current.focus();
  };

  const goToBottom = () => {
    if (!editorRef.current) return;

    const totalLines =
      content.split("\n").length;

    editorRef.current.revealLineInCenter(
      totalLines
    );

    editorRef.current.setPosition({
      lineNumber: totalLines,
      column: 1,
    });

    editorRef.current.focus();
  };

  const sortM3UContent = () => {
    const lines =
      content.split("\n");

    const blocks: string[] = [];
    let currentBlock: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line =
        lines[i];

      if (
        line.startsWith(
          "#EXTGRP:"
        )
      ) {
        if (
          currentBlock.length >
          0
        ) {
          blocks.push(
            currentBlock.join(
              "\n"
            )
          );
        }

        currentBlock = [line];
      } else {
        currentBlock.push(line);
      }
    }

    if (
      currentBlock.length >
      0
    ) {
      blocks.push(
        currentBlock.join(
          "\n"
        )
      );
    }

    const sortedBlocks =
      blocks.sort(
        (a, b) => {
          const getName = (
            block: string
          ) =>
            block
              .split("\n")[0]
              .replace(
                "#EXTGRP:",
                ""
              )
              .replace(
                /\(\d{4}\)/g,
                ""
              )
              .trim()
              .toLowerCase();

          return getName(
            a
          ).localeCompare(
            getName(b),
            "es",
            {
              sensitivity:
                "base",
            }
          );
        }
      );

    setContent(
      sortedBlocks.join(
        "\n"
      )
    );

    setHasChanges(true);

    setTimeout(() => {
      goToLine(1);
    }, 200);
  };

  const groupedSeries =
    useMemo<SeriesMap>(() => {
      const lines =
        content.split("\n");

      const map: SeriesMap = {};

      lines.forEach(
        (lineText, index) => {
          const match =
            lineText.match(
              /group-title="([^"]+)"/
            );

          if (!match) return;

          const fullTitle =
            match[1];

          let seriesName =
            fullTitle;
          let seasonLabel =
            "General";

          const seasonMatch =
            fullTitle.match(
              /(.*?)\s*-\s*(Temporada\s*\d+)/i
            );

          if (seasonMatch) {
            seriesName =
              seasonMatch[1].trim();
            seasonLabel =
              seasonMatch[2].trim();
          }

          if (
            !map[
              seriesName
            ]
          ) {
            map[
              seriesName
            ] = [];
          }

          const exists =
            map[
              seriesName
            ].some(
              (s) =>
                s.seasonLabel ===
                seasonLabel
            );

          if (!exists) {
            map[
              seriesName
            ].push({
              seasonLabel,
              line:
                index + 1,
            });
          }
        }
      );

      return map;
    }, [content]);

  if (loading) {
    return (
      <main className="h-screen bg-black text-white flex items-center justify-center">
        Cargando...
      </main>
    );
  }

  return (
    <main className="h-screen bg-zinc-950 text-white px-3 sm:px-5 lg:px-6 py-3 overflow-hidden">
      <div className="w-full max-w-[1900px] mx-auto h-full flex flex-col gap-3">
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 shrink-0">
          <h1 className="text-3xl sm:text-4xl font-bold text-yellow-500">
            Editar Paste
          </h1>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() =>
                router.push(
                  `/${slug}`
                )
              }
              className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-xl font-semibold"
            >
              Salir
            </button>

            <button
              onClick={() =>
                router.push("/")
              }
              className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-xl font-semibold"
            >
              Mis pastes
            </button>

            <div className="bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-2xl text-zinc-300 font-semibold">
              {
                content.split(
                  "\n"
                ).length
              }{" "}
              líneas
            </div>

            <button
              onClick={
                sortM3UContent
              }
              className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-xl font-semibold"
            >
              Ordenar A-Z
            </button>

            <button
              onClick={
                goToBottom
              }
              className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-xl font-semibold"
            >
              ↓ Final
            </button>

            <button
              disabled={saving}
              onClick={() =>
                savePaste(false)
              }
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-xl font-semibold disabled:opacity-50"
            >
              {saving
                ? "Guardando..."
                : "Guardar cambios"}
            </button>

            <button
              onClick={
                copyContent
              }
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
            setTitle(
              e.target.value
            );
            setHasChanges(
              true
            );
          }}
          placeholder="Título del paste"
          className="w-full p-3 rounded-2xl bg-zinc-900 border border-zinc-700 outline-none shrink-0"
        />

        {/* Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4 flex-1 min-h-0">
          {/* Editor */}
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl overflow-hidden shadow-lg flex flex-col min-h-0">
            <div className="bg-zinc-950 border-b border-zinc-700 px-6 py-3 text-sm text-zinc-400 font-semibold shrink-0">
              {title || slug}
            </div>

            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                defaultLanguage="plaintext"
                theme="vs-dark"
                value={content}
                onChange={(
                  value
                ) => {
                  setContent(
                    value || ""
                  );
                  setHasChanges(
                    true
                  );
                }}
                onMount={(
                  editor
                ) => {
                  editorRef.current =
                    editor;

                  editor.onDidChangeCursorPosition(
                    (
                      e
                    ) => {
                      setCursorLine(
                        e
                          .position
                          .lineNumber
                      );
                      setCursorCol(
                        e
                          .position
                          .column
                      );
                    }
                  );
                }}
                options={{
                  fontSize: 15,
                  fontFamily:
                    "JetBrains Mono, monospace",
                  lineHeight: 26,
                  minimap: {
                    enabled:
                      true,
                  },
                  automaticLayout:
                    true,
                  scrollBeyondLastLine:
                    false,
                  wordWrap:
                    "on",
                  smoothScrolling:
                    true,
                }}
              />
            </div>

            <div className="bg-zinc-950 border-t border-zinc-700 px-6 py-2 text-sm text-zinc-400 flex justify-between shrink-0">
              <span>
                {hasChanges
                  ? "Cambios sin guardar"
                  : "Guardado"}
              </span>

              <span>
                Línea{" "}
                {
                  cursorLine
                }
                , Col{" "}
                {
                  cursorCol
                }
              </span>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="bg-zinc-900 border border-zinc-700 rounded-3xl p-4 flex flex-col min-h-0">
            <h2 className="text-lg font-bold text-blue-400 mb-4 shrink-0">
              Índice M3U
            </h2>

            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {Object.keys(
                groupedSeries
              ).length ===
              0 ? (
                <p className="text-zinc-500 text-sm">
                  No se detectaron series
                </p>
              ) : (
                Object.entries(
                  groupedSeries
                ).map(
                  ([
                    seriesName,
                    seasons,
                  ]) => (
                    <div
                      key={
                        seriesName
                      }
                      className="bg-zinc-800 rounded-2xl overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpandedSeries(
                            expandedSeries ===
                              seriesName
                              ? null
                              : seriesName
                          )
                        }
                        className="w-full text-left px-4 py-3 hover:bg-zinc-700 font-semibold text-white"
                      >
                        {
                          seriesName
                        }
                      </button>

                      {expandedSeries ===
                        seriesName && (
                        <div className="border-t border-zinc-700">
                          {seasons.map(
                            (
                              season,
                              index
                            ) => (
                              <button
                                key={
                                  index
                                }
                                onClick={() =>
                                  goToLine(
                                    season.line
                                  )
                                }
                                className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-700 border-b border-zinc-800"
                              >
                                {
                                  season.seasonLabel
                                }
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  )
                )
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}