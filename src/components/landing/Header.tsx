"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Mail, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "../ui/theme-toggle";

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "Testimonials", href: "#testimonials" },
  { name: "Pricing", href: "#pricing" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent, targetId: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled
          ? "py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/20 dark:border-slate-700/20 shadow-lg shadow-gray-900/5 dark:shadow-black/20"
          : "py-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/95 to-white/90 dark:from-slate-900/90 dark:via-slate-900/95 dark:to-slate-900/90 backdrop-blur-xl"></div>

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 animate-fade-in-left">
            <div className="relative group">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-2 shadow-lg flex items-center justify-center transition-all duration-300 group-hover:shadow-xl group-hover:scale-110">
                <Mail className="h-6 w-6 text-white" />
              </div>

              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500/30 to-teal-500/30 opacity-0 group-hover:opacity-100 blur-lg transition-all duration-500 animate-pulse"></div>

              <div className="absolute top-0 right-0 transform translate-x-1 -translate-y-1">
                <Sparkles className="h-3 w-3 text-emerald-400 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-spin" />
              </div>
            </div>

            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              ReachMate
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex items-center space-x-6 animate-fade-in-up">
              {navLinks?.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="relative text-sm font-medium text-gray-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 py-2 px-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 group"
                  onClick={(e) => handleSmoothScroll(e, link.href.slice(1))}
                >
                  {link.name}

                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></div>
                </a>
              ))}

              <ThemeToggle />
            </nav>

            <div className="flex items-center space-x-4 animate-fade-in-right">
              <a
                href="/sign-in"
                className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors duration-300 px-4 py-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              >
                Sign in
              </a>

              <Link href={"/sign-in"}>
                <Button size="sm" className="relative overflow-hidden">
                  <span className="relative z-10 flex items-center">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>

                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </Button>
              </Link>
            </div>
          </div>

          <button
            className="block md:hidden p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-700 hover:scale-110 transition-all duration-300 focus:outline-none group"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="relative w-6 h-6">
              <Menu
                className={`absolute inset-0 h-6 w-6 text-gray-700 dark:text-slate-300 transition-all duration-300 ${isMobileMenuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"}`}
              />
              <X
                className={`absolute inset-0 h-6 w-6 text-gray-700 dark:text-slate-300 transition-all duration-300 ${isMobileMenuOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`}
              />
            </div>

            <div className="absolute inset-0 rounded-xl bg-emerald-500 opacity-0 group-hover:opacity-10 blur-lg transition-all duration-300"></div>
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ${isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="absolute left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-gray-200/20 dark:border-slate-700/20 shadow-xl">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>

          <nav className="flex flex-col px-4 py-6 space-y-2">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-sm font-medium text-gray-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 py-3 px-4 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 group"
                onClick={(e) => handleSmoothScroll(e, link.href.slice(1))}
              >
                <span className="flex items-center">
                  {link.name}
                  <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </span>
              </a>
            ))}

            <div className="pt-4 border-t border-gray-200/50 dark:border-slate-700/50 space-y-4">
              <a
                href="/sign-in"
                className="block text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors duration-300 py-3 px-4 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              >
                Sign in
              </a>

              <Link href={"/sign-up"}>
                <Button size="sm" className="w-full">
                  <span className="flex items-center justify-center">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Button>
              </Link>

              <div className="flex justify-center pt-2">
                <ThemeToggle />
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}