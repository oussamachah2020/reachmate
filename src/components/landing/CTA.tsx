"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

export function CTA() {
  return (
    <section className=" mx-auto px-4 py-20 md:py-28">
      <div className="relative overflow-hidden rounded-3xl animate-fade-in-up">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-green-500 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900" />

        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/80 to-teal-600/80 dark:from-emerald-900/50 dark:to-teal-900/50" />

        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='cta-grid' width='60' height='60' patternUnits='userSpaceOnUse'%3e%3cpath d='m 60 0 l 0 60 l -60 0 l 0 -60' stroke='%23ffffff' stroke-width='1' fill='none'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23cta-grid)'/%3e%3c/svg%3e")`,
          }}
        ></div>

        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 dark:bg-emerald-400/10 blur-3xl animate-float" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-white/10 dark:bg-teal-400/10 blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 dark:bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />

        <div className="absolute top-8 right-8 w-12 h-12 bg-white/20 dark:bg-emerald-400/20 rounded-2xl rotate-45 animate-float"></div>
        <div className="absolute bottom-8 left-8 w-8 h-8 bg-white/30 dark:bg-teal-400/30 rounded-full animate-float-delayed"></div>
        <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-white/25 dark:bg-green-400/25 rounded-full animate-pulse"></div>

        <div className="relative p-8 md:p-12 lg:p-16 z-10">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 dark:bg-slate-800/50 backdrop-blur-sm border border-white/30 dark:border-slate-600/50 text-white text-sm font-semibold mb-8 animate-fade-in-up">
              <Sparkles className="h-4 w-4 animate-spin-slow" />
              Transform Your Workflow
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8 animate-fade-in-up-delayed">
              <span className="block">Ready to</span>
              <span className="block bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
                revolutionize
              </span>
              <span className="block">your emails?</span>
            </h2>

            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-12 animate-fade-in-up-delayed">
              Join thousands of professionals who use ReachMate to streamline
              their email communications and boost productivity by 40%.
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-12 animate-fade-in-up-delayed">
              {[
                "14-day free trial",
                "No credit card required",
                "Setup in 2 minutes",
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-white/90 font-medium"
                >
                  <CheckCircle className="h-5 w-5 text-emerald-200 dark:text-emerald-300" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in-up-delayed">
              <Link href={"/sign-in"}>
                <Button size="lg" className="relative overflow-hidden">
                  <span className="relative z-10 text-white flex items-center">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                className="relative overflow-hidden"
              >
                <span className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  Watch Demo
                </span>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-16 pt-8 border-t border-white/20 dark:border-slate-600/30 animate-fade-in-up-delayed">
              <p className="text-white/70 text-sm mb-4">
                Trusted by professionals worldwide
              </p>
              <div className="flex flex-wrap justify-center gap-8 items-center opacity-70">
                {[
                  "50K+ Users",
                  "99.9% Uptime",
                  "2M+ Emails Sent",
                  "4.9★ Rating",
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="text-white font-semibold text-sm bg-white/10 dark:bg-slate-800/30 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20 dark:border-slate-600/30"
                  >
                    {stat}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
