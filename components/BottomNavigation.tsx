"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, PlusCircle, Users, TrendingUp } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Inicio", href: "/", icon: Home },
    { name: "Partidos", href: "/games", icon: Calendar },
    { name: "Cargar", href: "/new-game", icon: PlusCircle, isPrimary: true },
    { name: "Desempeño", href: "/performance", icon: TrendingUp },
    { name: "Rivales", href: "/opponents", icon: Users },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="bg-orange-600 text-white p-3 rounded-full shadow-lg active:scale-95 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-semibold text-orange-600 mt-1">
                  {item.name}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive
                  ? "text-orange-600 font-medium"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
