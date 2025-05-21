"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "../ui/theme-toggle";

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

  return (
    <header
      className={`sticky-nav transition-all duration-300 ${
        isScrolled
          ? "glassmorphism py-3 shadow-md"
          : "bg-background/95 py-4 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-primary p-2 shadow-md flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary-foreground" />
              </div>
              <motion.div
                className="absolute -inset-1 rounded-full bg-primary/20"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.2, 0.5],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
            <span className="text-xl font-semibold text-foreground">
              ReachMate
            </span>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
            <motion.nav
              className="flex items-center space-x-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Link
                href="#features"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors focus:text-primary focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
              >
                Features
              </Link>
              <Link
                href="#testimonials"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors focus:text-primary focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
              >
                Testimonials
              </Link>
              <Link
                href="#pricing"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors focus:text-primary focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
              >
                Pricing
              </Link>
              <ThemeToggle />
            </motion.nav>

            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Link
                href="/sign-in"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors focus:text-primary/80 focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
              >
                Sign in
              </Link>
              <Link href="/sign-up">
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring"
                  size="sm"
                >
                  Get Started
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Mobile menu button */}
          <motion.button
            className="block md:hidden p-2 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden glassmorphism absolute left-0 right-0 top-full z-20 px-4 py-6 shadow-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <nav className="flex flex-col space-y-4">
              <Link
                href="#features"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors focus:text-primary focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#testimonials"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors focus:text-primary focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Testimonials
              </Link>
              <Link
                href="#pricing"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors focus:text-primary focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <div className="flex flex-col space-y-4 pt-4">
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors focus:text-primary/80 focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md w-full shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring"
                    size="sm"
                  >
                    Get Started
                  </Button>
                </Link>
                <ThemeToggle />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
