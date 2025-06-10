"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Star,
  Quote,
  Sparkles,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Testimonial = {
  name: string;
  role: string;
  company: string;
  testimonial: string;
  stars: number;
  avatar?: string;
};

export function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director",
      company: "CreativeFlow",
      testimonial:
        "ReachMate has transformed how I communicate with clients. The templates save me hours each week, and the analytics help me understand what messages resonate most.",
      stars: 5,
      avatar: "/avatars/sarah-johnson.jpg",
    },
    {
      name: "Alex Rodriguez",
      role: "Business Development",
      company: "Nexus Innovations",
      testimonial:
        "I've tried many email tools, but ReachMate is in a league of its own. The client management features and scheduled sending have boosted my response rates by 40%.",
      stars: 5,
      avatar: "/avatars/alex-rodriguez.jpg",
    },
    {
      name: "Jamie Chen",
      role: "Freelance Consultant",
      company: "Independent",
      testimonial:
        "As a freelancer managing multiple clients, ReachMate has been a game-changer. The professional templates and easy tracking help me maintain relationships efficiently.",
      stars: 4,
      avatar: "/avatars/jamie-chen.jpg",
    },
  ];

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrent((prevCurrent) => (prevCurrent + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [autoplay, testimonials.length]);

  const handlePrevious = () => {
    setAutoplay(false);
    setDirection(-1);
    setCurrent((prevCurrent) =>
      prevCurrent === 0 ? testimonials.length - 1 : prevCurrent - 1
    );
  };

  const handleNext = () => {
    setAutoplay(false);
    setDirection(1);
    setCurrent((prevCurrent) => (prevCurrent + 1) % testimonials.length);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <section
      id="testimonials"
      className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-green-500 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800"
    >
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-40 h-40 bg-white/10 dark:bg-emerald-400/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-60 right-20 w-32 h-32 bg-white/15 dark:bg-teal-400/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-white/10 dark:bg-green-400/10 rounded-full blur-3xl animate-pulse"></div>

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='testimonial-grid' width='60' height='60' patternUnits='userSpaceOnUse'%3e%3cpath d='m 60 0 l 0 60 l -60 0 l 0 -60' stroke='%23ffffff' stroke-width='1' fill='none'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23testimonial-grid)'/%3e%3c/svg%3e")`,
          }}
        ></div>
      </div>

      <div className="container relative mx-auto px-4 z-10">
        <div className="mx-auto max-w-4xl text-center space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 dark:bg-slate-800/50 backdrop-blur-sm border border-white/30 dark:border-slate-700/50 text-white text-sm font-semibold">
            <Heart className="h-4 w-4 fill-current text-red-300" />
            Customer Stories
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            <span className="block">Loved by</span>
            <span className="block bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
              professionals
            </span>
          </h2>

          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Join thousands of professionals who trust ReachMate for their email
            communications and see real results every day.
          </p>
        </div>

        <div className="mt-16 mx-auto max-w-4xl">
          <div className="relative">
            <div className="relative h-[400px] md:h-[350px] overflow-hidden">
              <div
                key={current}
                className="absolute inset-0 transition-all duration-700 ease-in-out"
                style={{
                  transform: `translateX(${direction * 0}px)`,
                  opacity: 1,
                }}
              >
                <div className="h-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 dark:from-emerald-400/5 dark:to-teal-400/5"></div>

                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-400/20 to-transparent dark:from-emerald-500/20 rounded-bl-full"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-teal-400/20 to-transparent dark:from-teal-500/20 rounded-tr-full"></div>

                  <div className="absolute top-8 left-8 text-emerald-500/30 dark:text-emerald-400/30">
                    <Quote className="h-12 w-12 fill-current" />
                  </div>

                  <div className="flex justify-center mb-8 relative z-10">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-6 w-6 mx-1 transition-all duration-300 ${
                          i < testimonials[current].stars
                            ? "text-amber-400 fill-amber-400 scale-110"
                            : "text-gray-300 dark:text-gray-600 fill-gray-300 dark:fill-gray-600"
                        }`}
                      />
                    ))}
                  </div>

                  <blockquote className="text-center text-lg md:text-xl text-gray-700 dark:text-slate-200 mb-10 leading-relaxed max-w-3xl mx-auto relative z-10 font-medium">
                    "{testimonials[current].testimonial}"
                  </blockquote>

                  <div className="flex items-center justify-center gap-4 relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {testimonials[current].name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>

                    <div className="text-left">
                      <p className="font-bold text-gray-900 dark:text-slate-100 text-lg">
                        {testimonials[current].name}
                      </p>
                      <p className="text-gray-600 dark:text-slate-400 text-sm">
                        {testimonials[current].role} at{" "}
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {testimonials[current].company}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex items-center justify-center gap-6 animate-fade-in-up-delayed">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                className="group hover:scale-110 active:scale-95"
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
              </Button>

              <div className="flex gap-3">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`h-3 w-3 rounded-full transition-all duration-300 hover:scale-125 ${
                      current === index
                        ? "bg-white w-10 shadow-lg"
                        : "bg-white/50 hover:bg-white/70"
                    }`}
                    onClick={() => {
                      setAutoplay(false);
                      setDirection(index > current ? 1 : -1);
                      setCurrent(index);
                    }}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                className="group hover:scale-110 active:scale-95"
              >
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </div>
          </div>

          <div className="mt-16 text-center animate-fade-in-up-delayed">
            <div className="inline-flex items-center gap-2 text-white/90 mb-6">
              <Sparkles className="h-5 w-5" />
              <span className="text-lg font-medium">
                Trusted by professionals at
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              {[
                "CreativeFlow",
                "Nexus Innovations",
                "Independent Consultants",
                "Tech Startups",
              ].map((company, index) => (
                <div
                  key={index}
                  className="px-6 py-3 bg-white/20 dark:bg-slate-800/50 backdrop-blur-lg rounded-xl border border-white/30 dark:border-slate-700/50 font-medium text-white shadow-lg hover:bg-white/30 dark:hover:bg-slate-700/50 hover:scale-105 transition-all duration-300 cursor-default"
                >
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}