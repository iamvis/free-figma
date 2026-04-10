import type { Metadata } from "next";
import { Caveat, JetBrains_Mono, Space_Grotesk, Work_Sans } from "next/font/google";
import "./globals.css";
import { Room } from "./Room";

const workSans = Work_Sans({ 
  subsets: ["latin"],
  variable: '--font-work-sans',
  weight: ['400', '600', '700']
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "700"],
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "FigPro",
  description: "Collaborative whiteboard for sketching, annotating, and shaping ideas together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
        className={`${workSans.className} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${caveat.variable} min-h-screen bg-primary-black antialiased`}>
          <Room>
            {children}
          </Room>

        </body>
    </html>
  );
}
