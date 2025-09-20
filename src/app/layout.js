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

export const metadata = {
  title: "ProductivePro - Todo App",
  description: "A modern, productive todo app with authentication and real-time updates. Stay organized and get things done!",
  keywords: "todo app, productivity, task management, get things done",
  authors: [{ name: "Rehan Raza" }],
  openGraph: {
    title: "ProductivePro - Todo App",
    description: "Modern todo app with authentication and real-time sync",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
