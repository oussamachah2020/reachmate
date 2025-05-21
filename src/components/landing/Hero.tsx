"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 lg:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 pattern-dots opacity-30" />
      <div className="absolute inset-y-0 right-0 -z-10 w-[40%] bg-gradient-to-l from-primary/10 to-transparent" />

      <div className="container mx-auto px-4">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <motion.div
            className="space-y-6 md:space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Professional Email Management
            </motion.div>

            <motion.h1
              className="text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              <span className="block">Streamline your</span>
              <span className="block  bg-primary  bg-clip-text text-transparent">
                email workflow
              </span>
            </motion.h1>

            <motion.p
              className="max-w-md text-lg text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              Send professional emails to clients and companies with ease.
              Manage templates, track engagement, and boost your productivity.
            </motion.p>

            <motion.div
              className="flex flex-col space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Link href="/sign-up">
                <Button size="lg" className="bg-primary text-white">
                  <span>Get Started for Free</span>
                  <motion.span
                    className="ml-1"
                    animate={{
                      x: [0, 4, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      repeatType: "mirror",
                      duration: 1.5,
                      ease: "easeInOut",
                      repeatDelay: 1,
                    }}
                  >
                    →
                  </motion.span>
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-primary/20 text-foreground hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <div className="relative">
            <motion.div
              className="absolute -right-16 -top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 1 }}
            />

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.4,
              }}
              className="relative"
            >
              <motion.div
                className="glassmorphism aspect-video overflow-hidden rounded-2xl shadow-2xl"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="h-full bg-gradient-to-br from-background via-background to-primary/5 p-6">
                  <div className="mb-4 flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-red-400"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                    <div className="h-3 w-3 rounded-full bg-green-400"></div>
                    <div className="ml-auto text-xs text-muted-foreground">
                      ReachMate Pro
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="h-6 w-52 rounded-md bg-foreground/5"></div>
                        <div className="h-6 w-24 rounded-md bg-foreground/5"></div>
                      </div>
                      <div className="h-4 w-2/3 rounded-md bg-foreground/5"></div>
                    </div>

                    <div className="space-y-2">
                      <div className="h-32 rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
                        <div className="space-y-2">
                          <div className="h-4 w-full rounded-sm bg-white/30 dark:bg-white/10"></div>
                          <div className="h-4 w-3/4 rounded-sm bg-white/30 dark:bg-white/10"></div>
                          <div className="h-4 w-5/6 rounded-sm bg-white/30 dark:bg-white/10"></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <div className="h-8 w-20 rounded-md bg-foreground/10"></div>
                      <div className="h-8 w-24 rounded-md bg-primary/70"></div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute -bottom-6 -right-6 h-24 w-24 rounded-2xl bg-primary p-4 shadow-lg"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                whileHover={{
                  y: -5,
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
              >
                <Mail className="h-full w-full text-white" />
              </motion.div>

              <motion.div
                className="absolute -left-10 top-1/4 floating-delay-1 h-16 w-16 rounded-xl bg-yellow-500 p-3 shadow-lg"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <div className="h-full w-full rounded-md bg-white/90 dark:bg-white/30"></div>
              </motion.div>

              <motion.div
                className="absolute -left-4 -top-6 floating-delay-2 h-12 w-12 rounded-lg bg-primary p-2 shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <div className="h-full w-full rounded-sm bg-white/90 dark:bg-white/30"></div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
