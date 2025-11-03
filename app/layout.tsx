import type { Metadata } from "next";
import { Inter } from "next/font/google";
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';

const inter = Inter({ subsets: ["latin"] });

// Force all routes to be dynamic (prevents build-time static generation)
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export const metadata: Metadata = {
  title: "Interactors of the ciliary trafficking machinery (Homo sapiens)",
  description: "Interactive visualization of IFT and BBSome protein-protein interactions from AlphaFold3 predictions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
