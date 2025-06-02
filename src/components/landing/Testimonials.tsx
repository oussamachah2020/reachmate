"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Star, Quote } from "lucide-react";
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
      className="relative bg-primary py-20 md:py-28 overflow-hidden"
    >
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-[url('/subtle-pattern.png')] opacity-5"></div>

      <div className="container relative mx-auto px-4">
        <motion.div
          className="mx-auto max-w-4xl text-center space-y-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white border border-white/30 text-sm font-medium">
            <Star className="h-4 w-4 fill-current" />
            Customer Stories
          </div>
          <h2 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            Loved by <span className="text-white">professionals</span>
          </h2>
          <p className="text-xl text-white max-w-2xl mx-auto leading-relaxed">
            Join thousands of professionals who trust ReachMate for their email
            communications and see real results.
          </p>
        </motion.div>

        <div className="mt-16 mx-auto max-w-4xl">
          <div className="relative">
            {/* Main testimonial card */}
            <div className="relative h-[400px] md:h-[350px] overflow-hidden">
              <AnimatePresence custom={direction} initial={false}>
                <motion.div
                  key={current}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 25,
                  }}
                  className="absolute inset-0"
                >
                  <div className="h-full bg-white rounded-xl shadow-lg border border-gray-100 p-8 md:p-10 flex flex-col justify-center relative overflow-hidden">
                    {/* Decorative corner accent */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[oklch(0.696_0.17_162.48)]/10 rounded-bl-full"></div>

                    {/* Quote icon */}
                    <div className="absolute top-6 left-6 text-primary/50">
                      <Quote className="h-8 w-8 fill-current" />
                    </div>

                    {/* Stars */}
                    <div className="flex justify-center mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 mx-0.5 ${
                            i < testimonials[current].stars
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-200 fill-gray-200"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Testimonial text */}
                    <blockquote className="text-center text-lg md:text-xl text-gray-700 mb-8 leading-relaxed max-w-3xl mx-auto">
                      "{testimonials[current].testimonial}"
                    </blockquote>

                    {/* Author info */}
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center">
                        <p className="font-semibold text-gray-900 text-lg">
                          {testimonials[current].name}
                        </p>
                        <p className="text-gray-600 mt-1 text-sm">
                          {testimonials[current].role} at{" "}
                          <span className="font-medium text-[oklch(0.696_0.17_162.48)]">
                            {testimonials[current].company}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                className="h-10 w-10 rounded-full bg-transparent border-white dark:bg-white text-gray-700 transition-all duration-200 shadow-sm"
              >
                <ArrowLeft className="h-4 w-4 text-white dark:text-primary" />
              </Button>

              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`h-2 w-2 rounded-full transition-all duration-200 ${
                      current === index
                        ? "bg-white w-8"
                        : "bg-gray-200 hover:bg-gray-200"
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
                className="h-10 w-10 rounded-full bg-transparent border-white dark:bg-white text-gray-700 transition-all duration-200 shadow-sm"
              >
                <ArrowRight className="h-4 w-4 text-white dark:text-primary" />
              </Button>
            </div>
          </div>

          {/* Trust indicators */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-sm text-white mb-4">
              Trusted by professionals at
            </p>
            <div className="flex flex-wrap text-white items-center justify-center gap-4">
              <div className="px-4 py-2 bg-white/30 backdrop-blur-lg rounded-lg border border-white/40 font-medium text-sm shadow-sm hover:bg-white/40 transition-all">
                CreativeFlow
              </div>
              <div className="px-4 py-2 bg-white/30 backdrop-blur-lg rounded-lg border border-white/40 font-medium text-sm shadow-sm hover:bg-white/40 transition-all">
                Nexus Innovations
              </div>
              <div className="px-4 py-2 bg-white/30 backdrop-blur-lg rounded-lg border border-white/40 font-medium text-sm shadow-sm hover:bg-white/40 transition-all">
                Independent
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}