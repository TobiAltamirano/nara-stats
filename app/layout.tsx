import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/bottom-nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nara Stats — Seguimiento de Basketball",
  description: "Estadísticas individuales y de equipo para Nara en Platense",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${inter.className} bg-gray-100 min-h-screen text-gray-900`}
      >
        {/* Contenedor centralizado para emular App Mobile en Desktop */}
        <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl relative pb-20">
          <main className="p-4">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
