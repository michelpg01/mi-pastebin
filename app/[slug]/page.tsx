import { prisma } from "@/lib/prisma";

import Link from "next/link";

import { notFound } from "next/navigation";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export default async function PastePage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } =
    await params;

  const paste =
    await prisma.paste.findUnique(
      {
        where: {
          slug,
        },

        select: {
          slug: true,
          title: true,
          content: true,
          visibility: true,
          userId: true,
          deletedAt: true,
        },
      }
    );

  // ✅ no existe
  if (
    !paste ||
    paste.deletedAt
  ) {
    notFound();
  }

  // ✅ privado
  if (
    paste.visibility ===
    "private"
  ) {
    const session =
      await getServerSession(
        authOptions
      );

    if (
      !session?.user
        ?.email
    ) {
      notFound();
    }

    const user =
      await prisma.user.findUnique(
        {
          where: {
            email:
              session
                .user
                .email,
          },

          select: {
            id: true,
          },
        }
      );

    if (
      !user ||
      user.id !==
        paste.userId
    ) {
      notFound();
    }
  }

  // ✅ optimizado
  const lines =
    paste.content.split(
      "\n"
    );

  const totalLines =
    lines.length;

  // ✅ evitar matar React
  const MAX_RENDER =
    5000;

  const renderLines =
    totalLines >
    MAX_RENDER
      ? lines.slice(
          0,
          MAX_RENDER
        )
      : lines;

  const hiddenLines =
    totalLines -
    renderLines.length;

  // ✅ detectar IPTV gigante
  const hugePaste =
    totalLines >
      15000 ||
    paste.content.length >
      500000;

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">

      <div className="max-w-7xl mx-auto">

        {/* top */}
        <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <Link
            href="/"
            className="
              inline-block
              bg-gray-800
              hover:bg-gray-700
              text-white
              px-4 py-2
              rounded-lg
              transition
              w-fit
            "
          >
            ← Nuevo Paste
          </Link>

          <div className="flex gap-3 flex-wrap">

            <Link
              href={`/raw/${paste.slug}`}
              target="_blank"
              className="
                bg-gray-800
                hover:bg-gray-700
                text-white
                px-5 py-2
                rounded-2xl
                font-semibold
                transition
              "
            >
              Raw
            </Link>

            <Link
              href={`/edit/${paste.slug}`}
              className="
                bg-yellow-500
                hover:bg-yellow-600
                text-white
                px-5 py-2
                rounded-2xl
                font-semibold
                transition
              "
            >
              Editar
            </Link>

          </div>
        </div>

        {/* title */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">

          <h1 className="text-3xl lg:text-5xl font-bold text-blue-500 break-all">
            {paste.title ||
              `Paste: ${paste.slug}`}
          </h1>

          <div className="
            bg-zinc-900
            border
            border-zinc-700
            px-5 py-3
            rounded-2xl
            text-zinc-300
            font-semibold
            w-fit
          ">
            {totalLines.toLocaleString()} líneas
          </div>

        </div>

        {/* modo rendimiento */}
        {hugePaste && (
          <div className="
            mb-6
            bg-orange-500/20
            border border-orange-500
            text-orange-300
            px-5 py-4
            rounded-2xl
            text-sm
            font-medium
          ">
            ⚡ Lista IPTV gigante detectada.
            El visor fue optimizado automáticamente
            para evitar congelamientos.
          </div>
        )}

        {/* viewer */}
        <div className="
          bg-zinc-900
          border
          border-zinc-700
          rounded-3xl
          shadow-lg
          overflow-hidden
        ">

          {/* header */}
          <div className="
            flex
            bg-zinc-950
            border-b
            border-zinc-700
            px-6 py-3
            text-sm
            text-zinc-400
          ">
            <span className="font-semibold break-all">
              {paste.title ||
                paste.slug}
            </span>
          </div>

          {/* content */}
          <div className="
            overflow-auto
            max-h-[80vh]
          ">

            <div className="min-w-full">

              {renderLines.map(
                (
                  line,
                  index
                ) => (
                  <div
                    key={
                      index
                    }
                    className="
                      flex
                      hover:bg-zinc-800/40
                      transition
                    "
                  >

                    {/* line number */}
                    <div className="
                      w-20
                      shrink-0
                      text-right
                      px-4 py-1
                      text-zinc-500
                      select-none
                      border-r
                      border-zinc-800
                    ">
                      {index + 1}
                    </div>

                    {/* content */}
                    <pre className="
                      flex-1
                      px-6 py-1
                      whitespace-pre-wrap
                      text-sm lg:text-base
                      leading-7
                      text-white
                      break-all
                    ">
                      {line || " "}
                    </pre>

                  </div>
                )
              )}

              {/* hidden warning */}
              {hiddenLines >
                0 && (
                <div className="
                  p-6
                  text-center
                  text-orange-400
                  border-t
                  border-zinc-700
                  bg-zinc-950
                ">

                  ⚡ Se ocultaron{" "}
                  <strong>
                    {hiddenLines.toLocaleString()}
                  </strong>{" "}
                  líneas para evitar
                  congelamientos del navegador.

                  <div className="mt-4">

                    <Link
                      href={`/raw/${paste.slug}`}
                      target="_blank"
                      className="
                        inline-block
                        bg-orange-500
                        hover:bg-orange-600
                        text-white
                        px-5 py-3
                        rounded-2xl
                        font-semibold
                        transition
                      "
                    >
                      Ver lista completa RAW
                    </Link>

                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}