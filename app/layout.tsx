import type { Metadata, Viewport } from "next";
import BottomNavigation from "@/components/BottomNavigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nara Stats",
  description: "Estadísticas de básquet personalizadas",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nara Stats",
  },
};

export const viewport: Viewport = {
  themeColor: "#ea580c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gray-100 text-gray-900 min-h-screen antialiased pb-20">
        {children}
        <BottomNavigation />
      </body>
    </html>
  );
}
