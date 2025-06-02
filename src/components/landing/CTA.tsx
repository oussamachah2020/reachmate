"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="container mx-auto px-4 py-20 md:py-28">
      <motion.div
        className="relative overflow-hidden rounded-3xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-primary animated-gradient" />

        {/* Decorative elements */}
        <motion.div
          className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="relative p-8 md:p-12 lg:p-16">
          <div className="mx-auto max-w-3xl text-center">
            <motion.h2
              className="text-3xl font-bold text-white sm:text-4xl md:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Ready to transform your email workflow?
            </motion.h2>

            <motion.p
              className="mt-6 text-lg text-white/90"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Join thousands of professionals who use ReachMate to streamline
              their email communications and boost productivity.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="bg-white cursor-pointer text-primary hover:bg-white"
                >
                  <span className="text-primary">Start Free Trial</span>
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
              <Link href="/demo">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 bg-white/10 text-white hover:text-primary"
                >
                  Request Demo
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
