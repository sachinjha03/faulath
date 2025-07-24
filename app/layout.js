import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {MainContext} from "./context/ContextApi";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Business Continuity Management",
  description: "A prototype of business continuity management , designed and developed by AXO production",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
       <body className={`${geistSans.variable} ${geistMono.variable}`}>
            <MainContext>
              {children}
            </MainContext>
       </body>
     </html>
  );
}
