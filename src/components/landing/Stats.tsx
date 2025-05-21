"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

type Stat = {
  value: string;
  label: string;
};

export function Stats() {
  const stats: Stat[] = [
    { value: "1M+", label: "Emails Sent" },
    { value: "10K+", label: "Active Users" },
    { value: "98%", label: "Delivery Rate" },
    { value: "45%", label: "Higher Open Rates" }
  ];

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section 
      ref={ref}
      className="bg-primary/5 py-12 md:py-16"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="relative inline-block">
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 100, 
                    damping: 10, 
                    delay: 0.1 + index * 0.1 
                  }}
                  className="absolute -inset-2 rounded-lg bg-primary/10 -z-10"
                />
                <motion.h3 
                  className="text-4xl font-bold text-primary md:text-5xl"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                >
                  {stat.value}
                </motion.h3>
              </div>
              <p className="mt-2 text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}