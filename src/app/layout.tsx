import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

const ggSans = localFont({
  variable: "--font-gg-sans",
  display: "swap",
  src: [
    {
      path: "../../public/fonts/gg sans Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/gg sans Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/gg sans Semibold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/gg sans Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Neural Social Network",
  description: "Interactive neural network visualization and social network analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${ggSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          {children}
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
