"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  BarChart3, 
  Users, 
  Sparkles,
  Clock,
  Shield 
} from "lucide-react";

type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

export function Features() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const features: Feature[] = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Quick Templates",
      description:
        "Create and save professional email templates for different scenarios and clients.",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Email Analytics",
      description:
        "Track open rates, click-through rates, and engagement metrics for all your emails.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Client Management",
      description:
        "Organize contacts, segment audiences, and personalize communications effortlessly.",
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI Enhancements",
      description:
        "Leverage AI to improve your email content, suggest better subject lines, and optimize send times.",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Scheduled Sending",
      description:
        "Plan your communications in advance with powerful scheduling features for optimal delivery times.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Email Security",
      description:
        "Enterprise-grade security ensures your sensitive communications are always protected.",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="features" className="container mx-auto px-4 py-20 md:py-28 ">
      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
          Powerful Email Features
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          Everything you need to manage your professional email communications
          in one place.
        </p>
      </motion.div>

      <motion.div
        className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        {features.map((feature, index) => (
          <motion.div key={index} variants={item} className="relative">
            <motion.div
              className="h-full  rounded-xl border border-gray-200 dark:border-gray-800 p-6 transition-all duration-300 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-md dark:hover:bg-gray-800/50"
              animate={{
                y: hoveredIndex === index ? -5 : 0,
              }}
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary`}
              >
                {feature.icon}
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}