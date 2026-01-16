import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Cultural Time Machine",
  description: "Experience history through AI-powered immersion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-gray-100`}>
        <div className="min-h-screen">
          <header className="border-b border-gray-800">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-historical-roman rounded-md" />
                  <h1 className="text-xl font-bold">Cultural Time Machine</h1>
                </div>
                <nav className="hidden md:flex space-x-6">
                  <a href="/" className="hover:text-primary-400 transition">Home</a>
                  <a href="/eras" className="hover:text-primary-400 transition">Eras</a>
                  <a href="/about" className="hover:text-primary-400 transition">About</a>
                </nav>
              </div>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-gray-800 mt-12 py-6">
            <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
              <p>AI Cultural Time Machine • Open Source • Built with Next.js & Transformers.js</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
