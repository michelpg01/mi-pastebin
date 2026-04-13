"use client";

import "./globals.css";
import Providers from "./providers";
import { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved =
      localStorage.getItem("theme") || "dark";

    setTheme(saved);

    document.documentElement.classList.remove(
      "light",
      "dark"
    );

    document.documentElement.classList.add(saved);
  }, []);

  const toggleTheme = () => {
    const newTheme =
      theme === "dark" ? "light" : "dark";

    setTheme(newTheme);

    localStorage.setItem("theme", newTheme);

    document.documentElement.classList.remove(
      "light",
      "dark"
    );

    document.documentElement.classList.add(newTheme);
  };

  return (
    <html lang="es">
      <body>
        <button
          onClick={toggleTheme}
          className="fixed top-4 right-4 z-[9999] px-4 py-2 rounded-xl font-semibold shadow-lg bg-zinc-800 text-white dark:bg-zinc-800 dark:text-white light:bg-white light:text-black border"
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