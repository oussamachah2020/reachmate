"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  BarChart3,
  Users,
  Sparkles,
  Clock,
  Shield,
  Target,
  Mail,
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
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section
      id="features"
      className="relative overflow-hidden py-20 md:py-28 bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        {/* Floating shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-emerald-200/30 to-teal-200/30 dark:from-emerald-500/10 dark:to-teal-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-60 right-20 w-40 h-40 bg-gradient-to-r from-green-200/30 to-emerald-200/30 dark:from-green-500/10 dark:to-emerald-500/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-gradient-to-r from-teal-200/30 to-cyan-200/30 dark:from-teal-500/10 dark:to-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3e%3cpath d='m 60 0 l 0 60 l -60 0 l 0 -60' stroke='%23000000' stroke-width='1' fill='none'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23grid)'/%3e%3c/svg%3e")`,
          }}
        ></div>
        <div
          className="absolute inset-0 opacity-0 dark:opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='dark-grid' width='60' height='60' patternUnits='userSpaceOnUse'%3e%3cpath d='m 60 0 l 0 60 l -60 0 l 0 -60' stroke='%23ffffff' stroke-width='1' fill='none'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23dark-grid)'/%3e%3c/svg%3e")`,
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 dark:backdrop-blur-sm rounded-full text-emerald-800 dark:text-emerald-300 text-sm font-semibold border-0 dark:border dark:border-emerald-800/30">
            <Sparkles className="w-4 h-4 mr-2" />
            Powerful Features
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            <span className="block text-gray-900 dark:text-slate-100">
              Everything you need for
            </span>
            <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 dark:from-emerald-400 dark:via-teal-400 dark:to-green-400 bg-clip-text text-transparent">
              professional emails
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-xl text-gray-600 dark:text-slate-300 leading-relaxed">
            Streamline your email workflow with intelligent features designed to
            boost productivity and engagement. From AI-powered insights to
            seamless collaboration.
          </p>
        </div>

        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in-up-delayed">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 dark:from-emerald-500/10 dark:to-teal-500/10 rounded-2xl blur-xl scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500"></div>

              <div
                className={`relative h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-8 transition-all duration-500 hover:border-emerald-300/50 dark:hover:border-emerald-600/50 hover:shadow-2xl hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/20 ${
                  hoveredIndex === index
                    ? "transform -translate-y-2 scale-[1.02]"
                    : ""
                }`}
              >
                <div className="mb-6 relative">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg group-hover:shadow-xl group-hover:shadow-emerald-500/25 transition-all duration-500">
                    {feature.icon}
                  </div>

                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-400 dark:bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100"></div>
                <div className="absolute bottom-4 left-4 w-1 h-8 bg-gradient-to-t from-emerald-400 to-transparent dark:from-emerald-500 rounded-full opacity-0 group-hover:opacity-60 transition-all duration-500 delay-200"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center animate-fade-in-up-delayed">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-xl opacity-20"></div>
            <div className="relative bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 rounded-2xl p-8 border border-emerald-200/50 dark:border-emerald-800/30 backdrop-blur-sm">
              <div className="flex items-center justify-center space-x-2 text-emerald-700 dark:text-emerald-300 mb-4">
                <Target className="w-5 h-5" />
                <span className="font-semibold">
                  Ready to transform your email workflow?
                </span>
              </div>
              <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 group">
                Start Free Trial
                <Mail className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}