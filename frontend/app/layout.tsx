import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthGate from "./components/AuthGateWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "NousFit AdminBoard",
  description: "Panel administrativo de NousFit",
  viewport: "width=device-width, initial-scale=1.0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthGate>
          <main className="flex-1">{children}</main>
        </AuthGate>
      </body>
    </html>
  );
}