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

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        {/* BOTÓN VOLVER */}
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

        {/* TÍTULO */}
        <h1 className="text-4xl font-bold text-blue-500 mb-8">
          {paste.title || `Paste: ${paste.slug}`}
        </h1>

        {/* CONTENIDO */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 shadow-lg">
          <pre className="whitespace-pre-wrap text-lg leading-8 text-white">
            {paste.content}
          </pre>
        </div>
      </div>
    </main>
  );
}