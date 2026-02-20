import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import { SoundProvider } from "@/context/SoundContext";
import "./globals.css";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TYPEVERSE AI | The Ultimate Typing Ecosystem",
  description: "Join the future of typing. AI-powered learning, competitive gamification, and world-class analytics.",
  keywords: ["typing", "touch typing", "game", "competition", "AI learning", "keyboard"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} antialiased`}>
        <SoundProvider>
          <AuthProvider>
            <Script
              async
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9489303278308026"
              crossOrigin="anonymous"
              strategy="afterInteractive"
            />
            <Navbar />

            {/* Top Ad Unit */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', margin: '1rem 0' }}>
                {/* Replace '1234567890' with actual Top Ad Unit ID from AdSense dashboard */}
                <span style={{ color: '#666', fontSize: '0.8rem' }}>AdSpace (Top) - Configure in src/app/layout.tsx</span>
              </div>
            </div>

            {children}

            {/* Bottom Ad Unit */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', margin: '2rem 0' }}>
                {/* Replace '0987654321' with actual Bottom Ad Unit ID from AdSense dashboard */}
                <span style={{ color: '#666', fontSize: '0.8rem' }}>AdSpace (Bottom) - Configure in src/app/layout.tsx</span>
              </div>
            </div>

          </AuthProvider>
        </SoundProvider>
      </body>
    </html>
  );
}
