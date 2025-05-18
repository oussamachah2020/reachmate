import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // optional: add needed weights
});

export const metadata: Metadata = {
  title: "Reachmate – Personalized Email Outreach Made Simple",
  description:
    "Reachmate helps freelancers and job seekers craft and send personalized emails to clients and companies with ease. Save time, stay professional, and boost your chances with smart email templates.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <ThemeProvider defaultTheme="light" storageKey="email-app-theme">
          <Toaster position="top-right" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
