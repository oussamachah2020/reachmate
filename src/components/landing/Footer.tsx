"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Heart,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#features" },
        { name: "Pricing", href: "#pricing" },
        { name: "Testimonials", href: "#testimonials" },
        { name: "API", href: "/api" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "/docs" },
        { name: "Guides", href: "/guides" },
        { name: "Blog", href: "/blog" },
        { name: "Support", href: "/support" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Contact", href: "/contact" },
        { name: "Partners", href: "/partners" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy", href: "/privacy" },
        { name: "Terms", href: "/terms" },
        { name: "Security", href: "/security" },
        { name: "Compliance", href: "/compliance" },
      ],
    },
  ];

  const socialLinks = [
    { name: "Twitter", icon: <Twitter className="h-5 w-5" />, href: "#" },
    { name: "GitHub", icon: <Github className="h-5 w-5" />, href: "#" },
    { name: "LinkedIn", icon: <Linkedin className="h-5 w-5" />, href: "#" },
    { name: "Instagram", icon: <Instagram className="h-5 w-5" />, href: "#" },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-gray-200/50 dark:border-slate-700/50 bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 py-16 md:py-20">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-emerald-200/20 to-teal-200/20 dark:from-emerald-500/10 dark:to-teal-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-green-200/20 to-emerald-200/20 dark:from-green-500/10 dark:to-emerald-500/10 rounded-full blur-3xl animate-float-delayed"></div>

        <div
          className="absolute inset-0 opacity-[0.01] dark:opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='footer-grid' width='40' height='40' patternUnits='userSpaceOnUse'%3e%3cpath d='m 40 0 l 0 40 l -40 0 l 0 -40' stroke='%23000000' stroke-width='1' fill='none'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23footer-grid)'/%3e%3c/svg%3e")`,
          }}
        ></div>
        <div
          className="absolute inset-0 opacity-0 dark:opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='footer-dark-grid' width='40' height='40' patternUnits='userSpaceOnUse'%3e%3cpath d='m 40 0 l 0 40 l -40 0 l 0 -40' stroke='%23ffffff' stroke-width='1' fill='none'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23footer-dark-grid)'/%3e%3c/svg%3e")`,
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2 animate-fade-in-up">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-2 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Mail className="h-full w-full text-white" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 hover:opacity-20 blur-xl transition-all duration-500"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                ReachMate
              </span>
            </div>

            <p className="text-gray-600 dark:text-slate-300 max-w-sm leading-relaxed mb-8">
              Professional email management platform for businesses and
              individuals. Streamline your communications and boost productivity
              with intelligent automation.
            </p>

            <div className="flex items-center space-x-3">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="group relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-gray-600 dark:text-slate-400 transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 hover:scale-110 hover:shadow-lg"
                  aria-label={link.name}
                >
                  {link.icon}
                  <div className="absolute inset-0 rounded-xl bg-emerald-500 opacity-0 group-hover:opacity-10 blur-lg transition-all duration-300"></div>
                </a>
              ))}

              <div className="ml-2">
                <ThemeToggle />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-4">
            {footerLinks.map((group, groupIndex) => (
              <div
                key={groupIndex}
                className="animate-fade-in-up-delayed"
                style={{ animationDelay: `${0.1 + groupIndex * 0.1}s` }}
              >
                <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-6 relative">
                  {group.title}
                  <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                </h3>
                <ul className="space-y-4">
                  {group.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href}
                        className="group inline-flex items-center text-sm text-gray-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300"
                      >
                        <span className="group-hover:translate-x-1 transition-transform duration-300">
                          {link.name}
                        </span>
                        <ArrowRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 animate-fade-in-up-delayed">
          <div className="relative bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl p-8 border border-emerald-200/50 dark:border-emerald-800/30 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-200/30 to-transparent dark:from-emerald-500/20 rounded-bl-full"></div>

            <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">Stay Updated</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">
                Get the latest email tips and product updates
              </h3>
              <p className="text-gray-600 dark:text-slate-300 mb-6">
                Join our newsletter for weekly insights and exclusive features.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                  Subscribe
                  <ArrowRight className="w-4 h-4 ml-2 inline group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200/50 dark:border-slate-700/50 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 animate-fade-in-up-delayed">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
            <span>© {currentYear} ReachMate. Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
            <span>for better communication.</span>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <a
              href="#privacy"
              className="text-gray-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300"
            >
              Privacy
            </a>
            <a
              href="#terms"
              className="text-gray-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300"
            >
              Terms
            </a>
            <a
              href="#cookies"
              className="text-gray-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300"
            >
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
