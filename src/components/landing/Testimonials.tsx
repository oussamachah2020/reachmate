"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

type Testimonial = {
  name: string;
  role: string;
  company: string;
  testimonial: string;
  stars: number;
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
    },
    {
      name: "Alex Rodriguez",
      role: "Business Development",
      company: "Nexus Innovations",
      testimonial:
        "I've tried many email tools, but ReachMate is in a league of its own. The client management features and scheduled sending have boosted my response rates by 40%.",
      stars: 5,
    },
    {
      name: "Jamie Chen",
      role: "Freelance Consultant",
      company: "Independent",
      testimonial:
        "As a freelancer managing multiple clients, ReachMate has been a game-changer. The professional templates and easy tracking help me maintain relationships efficiently.",
      stars: 4,
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
    }, 5000);

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
      x: direction > 0 ? 200 : -200,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 200 : -200,
      opacity: 0,
    }),
  };

  return (
    <section id="testimonials" className="relative py-20 md:py-28">
      <div className="absolute inset-0 bg-primary " />

      <div className="container relative mx-auto px-4">
        <motion.div
          className="mx-auto max-w-4xl text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Loved by professionals
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Join thousands of professionals who trust ReachMate for their email
            communications.
          </p>
        </motion.div>

        <div className="mt-12 mx-auto max-w-3xl">
          <div className="relative h-[320px] overflow-hidden rounded-xl glassmorphism bg-white/10 p-6 md:p-8">
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
                  stiffness: 300,
                  damping: 30,
                }}
                className="absolute inset-0 flex flex-col justify-center p-6 md:p-8"
              >
                <div className="flex justify-center mb-6">
                  {[...Array(testimonials[current].stars)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-6 w-6 text-yellow-300 fill-yellow-300"
                    />
                  ))}
                  {[...Array(5 - testimonials[current].stars)].map((_, i) => (
                    <Star
                      key={i + testimonials[current].stars}
                      className="h-6 w-6 text-yellow-300/30"
                    />
                  ))}
                </div>

                <p className="text-center text-lg font-medium text-white mb-6">
                  "{testimonials[current].testimonial}"
                </p>

                <div className="text-center">
                  <p className="font-semibold text-white">
                    {testimonials[current].name}
                  </p>
                  <p className="text-sm text-white/70">
                    {testimonials[current].role},{" "}
                    {testimonials[current].company}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex justify-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            {testimonials.map((_, index) => (
              <Button
                key={index}
                variant="outline"
                size="icon"
                className={`h-2 w-2 rounded-full p-0 ${
                  current === index
                    ? "bg-white"
                    : "border-white/30 bg-white/10 hover:bg-white/20"
                }`}
                onClick={() => {
                  setAutoplay(false);
                  setDirection(index > current ? 1 : -1);
                  setCurrent(index);
                }}
              />
            ))}

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
