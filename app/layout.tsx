import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Plus_Jakarta_Sans } from "next/font/google";
import BottomNavigation from "@/components/BottomNavigation";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";
import BackgroundPattern from "@/components/BackgroundPattern";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Platense Stats",
  description: "Estadísticas de básquet personalizadas",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Platense Stats",
  },
};

export const viewport: Viewport = {
  themeColor: "#372D2E",
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
    <html
      lang="es"
      className={`${bebasNeue.variable} ${plusJakartaSans.variable}`}
    >
      <body className="bg-[#F5F1F0] text-[#372D2E] font-sans min-h-screen antialiased pb-28 selection:bg-[#372D2E] selection:text-[#F5F1F0]">
        <BackgroundPattern />
        {children}
        <BottomNavigation />
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
