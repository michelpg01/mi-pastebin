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

  const [title, setTitle] =
    useState("");
  const [content, setContent] =
    useState("");
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [hasChanges, setHasChanges] =
    useState(false);
  const [cursorLine, setCursorLine] =
    useState(1);
  const [cursorCol, setCursorCol] =
    useState(1);
  const [
    expandedSeries,
    setExpandedSeries,
  ] = useState<string | null>(null);
  const [editorTheme, setEditorTheme] =
    useState("vs-dark");

  const autosaveRef =
    useRef<NodeJS.Timeout | null>(null);
  const editorRef =
    useRef<MonacoEditorType | null>(null);

  useEffect(() => {
    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        "auto";
    };
  }, []);

  useEffect(() => {
    const updateTheme = () => {
      const isLight =
        document.documentElement.classList.contains(
          "light"
        );

      setEditorTheme(
        isLight ? "vs" : "vs-dark"
      );
    };

    updateTheme();

    const observer =
      new MutationObserver(() =>
        updateTheme()
      );

    observer.observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: ["class"],
      }
    );

    return () =>
      observer.disconnect();
  }, []);

  useEffect(() => {
    async function loadPaste() {
      try {
        const res =
          await fetch(
            `/api/paste/${slug}`
          );

        const data =
          await res.json();

        setTitle(
          data.title || ""
        );
        setContent(
          data.content || ""
        );
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
      if (!silent)
        setSaving(true);

      await fetch(
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

      setHasChanges(false);

      if (!silent) {
        router.push(
          `/${slug}`
        );
      }
    } finally {
      if (!silent)
        setSaving(false);
    }
  };

  useEffect(() => {
    if (
      !hasChanges ||
      loading
    )
      return;

    if (
      autosaveRef.current
    ) {
      clearTimeout(
        autosaveRef.current
      );
    }

    autosaveRef.current =
      setTimeout(() => {
        savePaste(true);
      }, 5000);

    return () => {
      if (
        autosaveRef.current
      ) {
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

  const copyContent =
    async () => {
      try {
        await navigator.clipboard.writeText(
          content
        );
        alert(
          "Contenido copiado"
        );
      } catch {
        alert(
          "No se pudo copiar"
        );
      }
    };

  const goToLine = (
    line: number
  ) => {
    if (
      !editorRef.current
    )
      return;

    editorRef.current.revealLineInCenter(
      line
    );

    editorRef.current.setPosition(
      {
        lineNumber:
          line,
        column: 1,
      }
    );

    editorRef.current.focus();
  };

  const goToBottom =
    () => {
      const total =
        content.split(
          "\n"
        ).length;

      goToLine(total);
    };

  // 🔥 NUEVO: Ordenar A-Z
  const sortM3U = () => {
    const lines = content.split("\n");

    const blocks: string[] = [];
    let currentBlock: string[] = [];

    for (const line of lines) {
      if (line.startsWith("#EXTGRP:")) {
        if (currentBlock.length) {
          blocks.push(currentBlock.join("\n"));
        }
        currentBlock = [line];
      } else {
        currentBlock.push(line);
      }
    }

    if (currentBlock.length) {
      blocks.push(currentBlock.join("\n"));
    }

    const sorted = blocks.sort((a, b) => {
      const getName = (txt: string) =>
        txt
          .split("\n")[0]
          .replace("#EXTGRP:", "")
          .replace(/\(\d{4}\)/g, "")
          .trim()
          .toLowerCase();

      return getName(a).localeCompare(getName(b), "es", {
        sensitivity: "base",
      });
    });

    setContent(sorted.join("\n"));
    setHasChanges(true);
  };

  const groupedSeries =
    useMemo<SeriesMap>(() => {
      const map: SeriesMap =
        {};

      content
        .split("\n")
        .forEach(
          (
            line,
            index
          ) => {
            const match =
              line.match(
                /group-title="([^"]+)"/
              );

            if (
              !match
            )
              return;

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

            if (
              seasonMatch
            ) {
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
                (
                  item
                ) =>
                  item.seasonLabel ===
                  seasonLabel
              );

            if (
              !exists
            ) {
              map[
                seriesName
              ].push({
                seasonLabel,
                line:
                  index +
                  1,
              });
            }
          }
        );

      return map;
    }, [content]);

  if (loading) {
    return (
      <main className="h-screen theme-bg flex items-center justify-center">
        Cargando...
      </main>
    );
  }

  return (
    <main className="h-screen theme-bg px-3 sm:px-5 lg:px-6 py-3 overflow-hidden">
      <div className="w-full max-w-[1900px] mx-auto h-full flex flex-col gap-3">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 shrink-0">
          <h1 className="text-3xl sm:text-4xl font-bold text-yellow-500">
            Editar Paste
          </h1>

          <div className="flex gap-2 flex-wrap">

            <button
              onClick={sortM3U}
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl font-semibold"
            >
              Ordenar A-Z
            </button>

            <button
              onClick={() =>
                router.push(
                  `/${slug}`
                )
              }
              className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-xl font-semibold"
            >
              Salir
            </button>

            <button
              onClick={() =>
                router.push(
                  "/"
                )
              }
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl font-semibold"
            >
              Mis pastes
            </button>

            <div className="theme-card px-4 py-2 rounded-2xl font-semibold">
              {
                content.split(
                  "\n"
                ).length
              }{" "}
              líneas
            </div>

            <button
              onClick={
                goToBottom
              }
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl font-semibold"
            >
              ↓ Final
            </button>

            <button
              disabled={
                saving
              }
              onClick={() =>
                savePaste(
                  false
                )
              }
              className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-xl font-semibold"
            >
              {saving
                ? "Guardando..."
                : "Guardar cambios"}
            </button>

            <button
              onClick={
                copyContent
              }
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold"
            >
              Copiar
            </button>
          </div>
        </div>

        <input
          value={title}
          onChange={(e) => {
            setTitle(
              e.target.value
            );
            setHasChanges(
              true
            );
          }}
          className="w-full p-3 rounded-2xl theme-input outline-none shrink-0"
        />

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4 flex-1 min-h-0">
          {/* editor */}
          <div className="theme-card rounded-3xl overflow-hidden shadow-lg flex flex-col min-h-0">
            <div className="px-6 py-3 text-sm opacity-70 font-semibold shrink-0 border-b border-black/10 dark:border-white/10">
              {title || slug}
            </div>

            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                language="m3u"
                theme={
                  editorTheme
                }
                value={
                  content
                }
                onChange={(
                  value
                ) => {
                  setContent(
                    value ||
                      ""
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
                  minimap:
                    {
                      enabled:
                        true,
                    },
                  automaticLayout:
                    true,
                  scrollBeyondLastLine:
                    false,
                  wordWrap:
                    "on",
                }}
              />
            </div>

            <div className="px-6 py-2 text-sm opacity-70 flex justify-between shrink-0 border-t border-black/10 dark:border-white/10">
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

          {/* sidebar */}
          <aside className="theme-card rounded-3xl p-4 flex flex-col min-h-0">
            <h2 className="text-lg font-bold text-blue-500 mb-4 shrink-0">
              Índice M3U
            </h2>

            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {Object.entries(
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
                    className="rounded-2xl overflow-hidden"
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
                      className="
                        w-full text-left px-4 py-4 rounded-2xl
                        bg-zinc-100 dark:bg-zinc-800
                        text-zinc-900 dark:text-white
                        font-semibold
                        shadow-sm
                        hover:bg-zinc-200 dark:hover:bg-zinc-700
                        hover:shadow-lg
                        hover:scale-[1.02]
                        active:scale-[0.98]
                        transition-all duration-200
                        cursor-pointer
                      "
                    >
                      {
                        seriesName
                      }
                    </button>

                    {expandedSeries ===
                      seriesName && (
                      <div className="mt-2 space-y-2 pl-2">
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
                              className="
                                w-full text-left px-4 py-3 rounded-xl
                                bg-orange-300 dark:bg-orange-700
                                text-zinc-800 dark:text-zinc-100
                                text-sm font-medium
                                hover:bg-orange-400 dark:hover:bg-orange-600
                                hover:translate-x-1
                                active:scale-[0.98]
                                transition-all duration-200
                                cursor-pointer
                              "
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
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}