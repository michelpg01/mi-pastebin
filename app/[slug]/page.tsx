import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PastePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const paste = await prisma.paste.findUnique({
    where: { slug },
  });

  if (!paste) {
    notFound();
  }

  const lines = paste.content.split("\n");

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* TOP */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-block bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
          >
            ← Nuevo Paste
          </Link>

          <div className="flex gap-3">
            <Link
              href={`/raw/${paste.slug}`}
              target="_blank"
              className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2 rounded-2xl font-semibold transition"
            >
              Raw
            </Link>

            <Link
              href={`/edit/${paste.slug}`}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-2xl font-semibold transition"
            >
              Editar
            </Link>
          </div>
        </div>

        {/* TÍTULO + CONTADOR */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold text-blue-500">
            {paste.title || `Paste: ${paste.slug}`}
          </h1>

          <div className="bg-zinc-900 border border-zinc-700 px-5 py-3 rounded-2xl text-zinc-300 font-semibold">
            {lines.length} líneas
          </div>
        </div>

        {/* EDITOR ESTILO VSCODE */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-3xl shadow-lg overflow-hidden">
          <div className="flex bg-zinc-950 border-b border-zinc-700 px-6 py-3 text-sm text-zinc-400">
            <span className="font-semibold">
              {paste.title || paste.slug}
            </span>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-full">
              {lines.map((line, index) => (
                <div
                  key={index}
                  className="flex hover:bg-zinc-800/40 transition"
                >
                  <div className="w-20 shrink-0 text-right px-4 py-1 text-zinc-500 select-none border-r border-zinc-800">
                    {index + 1}
                  </div>

                  <pre className="flex-1 px-6 py-1 whitespace-pre-wrap text-lg leading-9 text-white">
                    {line || " "}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}