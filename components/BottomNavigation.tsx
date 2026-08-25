"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Plus, Users, TrendingUp } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Inicio", href: "/", icon: Home },
    { name: "Partidos", href: "/games", icon: Calendar },
    { name: "Cargar", href: "/new-game", icon: Plus, isPrimary: true },
    { name: "Desempeño", href: "/performance", icon: TrendingUp },
    { name: "Rivales", href: "/opponents", icon: Users },
  ];

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 px-4 pointer-events-none">
      <nav className="max-w-md mx-auto bg-[#372D2E] text-[#F5F1F0] rounded-full p-2 shadow-2xl border border-[#DAD0C7]/20 pointer-events-auto backdrop-blur-md">
        <div className="flex justify-around items-center h-14 relative px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            if (item.isPrimary) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center -mt-6 group"
                >
                  <div className="bg-[#DFD6CD] text-[#372D2E] p-3.5 rounded-full shadow-lg transition transform group-active:scale-90 border-4 border-[#F5F1F0]">
                    <Icon className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <span className="text-[9px] font-bebas tracking-wider text-[#372D2E] mt-0.5 bg-[#DFD6CD] px-2 py-0.5 rounded-full uppercase">
                    {item.name}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                  isActive
                    ? "text-[#DFD6CD] font-bold scale-105"
                    : "text-[#F5F1F0]/50 hover:text-[#F5F1F0]/80"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-2"}`}
                />
                <span className="text-[10px] font-bebas tracking-wider uppercase mt-0.5">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
