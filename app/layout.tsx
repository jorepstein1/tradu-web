import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.traducards.app"),
  title: {
    default: "Tradu",
    template: "%s | Tradu",
  },
  description:
    "Look up Spanish–English translations and instantly turn them into Mochi spaced-repetition flashcards.",
  keywords: [
    "Spanish",
    "English",
    "translation",
    "flashcards",
    "spaced repetition",
    "Mochi",
    "vocabulary",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: "https://www.traducards.app",
    siteName: "Tradu",
    title: "Tradu — Spanish/English Flashcard Maker",
    description:
      "Look up Spanish–English translations and instantly turn them into Mochi spaced-repetition flashcards.",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Tradu — Spanish/English Flashcard Maker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tradu — Spanish/English Flashcard Maker",
    description:
      "Look up Spanish–English translations and instantly turn them into Mochi spaced-repetition flashcards.",
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
