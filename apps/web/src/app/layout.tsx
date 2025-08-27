import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SentinelAI - Smart Camera Anomaly Detection",
  description: "Transform ordinary cameras into smart anomaly detectors",
  icons: {
    icon: [
      { url: "/images/logo-only.png", type: "image/png", sizes: "48x48" },
      { url: "/images/logo-only.png", type: "image/png", sizes: "72x72" },
      { url: "/images/logo-only.png", type: "image/png", sizes: "96x96" },
      { url: "/images/logo-only.png", type: "image/png", sizes: "144x144" },
      { url: "/images/logo-only.png", type: "image/png", sizes: "192x192" },
      { url: "/images/logo-only.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/images/logo-only.png", type: "image/png", sizes: "180x180" },
    ],
    shortcut: [{ url: "/images/logo-only.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/logo-only.png" sizes="any" />
        <link rel="apple-touch-icon" href="/images/logo-only.png" sizes="180x180" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
} 