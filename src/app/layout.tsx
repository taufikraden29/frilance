import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Freelance Dashboard",
  description: "Manage your freelance projects, clients, and invoices",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-950 min-h-screen">
        <Providers>
          <div className="flex">
            <Sidebar />
            <main className="flex-1 ml-64 min-h-screen">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
