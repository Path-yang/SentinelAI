"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Camera, Activity, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Connect Camera", href: "/camera", icon: Camera },
  { name: "AI Detection", href: "/dashboard/watch", icon: Activity },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r lg:relative lg:z-0">
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <Link
            href="/"
            className="flex items-center space-x-2 text-primary font-bold text-xl tracking-tight"
          >
            <Image
              src="/images/logo-only.png"
              alt="SentinelAI Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span>SentinelAI</span>
          </Link>
        </div>

        {/* Sidebar navigation */}
        <nav className="flex flex-col h-[calc(100%-64px)] justify-between">
          <div className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-muted-foreground">
                  System Online
                </span>
              </div>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 