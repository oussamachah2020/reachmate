"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Github, Twitter, Linkedin, Instagram } from "lucide-react";
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
    <footer className="border-t border-primary/10 bg-background py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="h-9 w-9 rounded-full  bg-primary p-2 shadow-md">
                <Mail className="h-full w-full text-white" />
              </div>
              <span className="text-xl font-bold text-primary bg-clip-text ">
                ReachMate
              </span>
            </motion.div>

            <motion.p
              className="mt-4 text-muted-foreground max-w-xs"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Professional email management platform for businesses and
              individuals. Streamline your communications and boost
              productivity.
            </motion.p>

            <motion.div
              className="mt-6 flex space-x-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {socialLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 text-foreground/70 transition-colors hover:bg-primary/5 hover:text-primary"
                  aria-label={link.name}
                >
                  {link.icon}
                </Link>
              ))}
              <div className="inline-flex h-9 w-9 items-center justify-center">
                <ThemeToggle />
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-4">
            {footerLinks.map((group, groupIndex) => (
              <motion.div
                key={groupIndex}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 + groupIndex * 0.1 }}
              >
                <h3 className="font-medium text-foreground">{group.title}</h3>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          className="mt-12 border-t border-primary/10 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p className="text-sm text-muted-foreground">
            © {currentYear} ReachMate. All rights reserved.
          </p>

        </motion.div>
      </div>
    </footer>
  );
}
