import type { Metadata } from "next";
import { Baloo_2, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "greek"],
});

const baloo = Baloo_2({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Μαθαίνω Παίζοντας",
  description: "Ψηφιακός βοηθός μάθησης με παιχνίδια για τις πρώτες τάξεις του Δημοτικού",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="el"
      className={`${inter.variable} ${baloo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-sky-50 text-slate-800">{children}</body>
    </html>
  );
}
