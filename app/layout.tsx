"use client";

import "./globals.css";
import Providers from "./providers";
import { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] =
    useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved =
      (localStorage.getItem("theme") as
        | "dark"
        | "light") || "dark";

    setTheme(saved);

    document.documentElement.classList.remove(
      "light",
      "dark"
    );

    document.documentElement.classList.add(
      saved
    );
  }, []);

  const toggleTheme = () => {
    const nextTheme =
      theme === "dark"
        ? "light"
        : "dark";

    setTheme(nextTheme);

    localStorage.setItem(
      "theme",
      nextTheme
    );

    document.documentElement.classList.remove(
      "light",
      "dark"
    );

    document.documentElement.classList.add(
      nextTheme
    );
  };

  return (
    <html lang="es">
      <body>
        <button
          onClick={toggleTheme}
          className="fixed bottom-5 left-5 z-[9999] px-4 py-2 rounded-2xl font-semibold shadow-xl border backdrop-blur-md transition-all duration-300
          bg-zinc-900/90 text-white border-zinc-700
          hover:scale-105
          light:bg-white/90 light:text-zinc-900 light:border-zinc-300"
        >
          {theme === "dark"
            ? "☀ Claro"
            : "🌙 Oscuro"}
        </button>

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}