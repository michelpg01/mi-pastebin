import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function PastePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const paste = await prisma.paste.findUnique({
    where: {
      slug,
    },
  });

  if (!paste) {
    return notFound();
  }

  if (paste.expiresAt && new Date() > paste.expiresAt) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-500">
            {paste.title || `Paste: ${slug}`}
          </h1>

          <div className="flex gap-3">
            <a
              href={`/raw/${slug}`}
              target="_blank"
              className="px-4 py-2 bg-zinc-800 rounded-xl hover:bg-zinc-700"
            >
              Raw
            </a>

            <Link
              href={`/edit/${slug}`}
              className="px-4 py-2 bg-yellow-600 rounded-xl hover:bg-yellow-500"
            >
              Editar
            </Link>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-700 p-6">
          <pre className="whitespace-pre-wrap text-sm">
            {paste.content}
          </pre>
        </div>
      </div>
    </main>
  );
}