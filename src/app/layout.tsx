import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TamagotchiProvider } from "@/context/TamagotchiContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tamagotchi Game",
  description: "A virtual pet game built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TamagotchiProvider>
          {children}
        </TamagotchiProvider>
      </body>
    </html>
  );
}
