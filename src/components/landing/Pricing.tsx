"use client";

import { Check, Zap, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for individuals getting started",
    features: [
      "Send up to 100 emails/month",
      "5 custom templates",
      "Basic template builder",
      "Email analytics",
      "Community support",
    ],
    buttonText: "Get Started for Free",
    buttonVariant: "outline" as const,
    popular: false,
  },
  {
    name: "Professional",
    price: "$29",
    period: "/month",
    description: "Ideal for growing businesses",
    features: [
      "Send up to 10,000 emails/month",
      "Unlimited custom templates",
      "Advanced template builder",
      "File attachments up to 25MB",
      "AI template review & optimization",
      "Priority email support",
      "Advanced analytics & reporting",
      "Resend API integration",
    ],
    buttonText: "Start Free Trial",
    buttonVariant: "default" as const,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/month",
    description: "For large organizations",
    features: [
      "Unlimited emails",
      "Unlimited templates & storage",
      "White-label solution",
      "Large file attachments up to 100MB",
      "Advanced AI insights & A/B testing",
      "Dedicated account manager",
      "Custom integrations & API access",
      "SSO & advanced security",
      "Custom onboarding",
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const,
    popular: false,
  },
];

export function Pricing() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="py-20 px-4 bg-background dark:bg-slate-900 relative overflow-hidden transition-colors duration-500">
      {/* Animated Background decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-emerald-500/5 dark:bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/5 rounded-full blur-3xl animate-spin-slow"></div>

      <div className="max-w-7xl mx-auto relative">
        {/* Animated Header */}
        <div
          className={`text-center mb-16 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <Badge
            variant="secondary"
            className="mb-6 bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 transition-all duration-300 hover:scale-105"
          >
            <Zap className="w-3 h-3 mr-2 animate-bounce" />
            Professional Email Management
          </Badge>
          <h2 className="text-5xl font-bold text-foreground dark:text-white mb-6 transition-colors duration-300">
            Choose your{" "}
            <span className=" dark:text-emerald-400 bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-400 dark:to-emerald-300 bg-clip-text text-transparent animate-gradient">
              email workflow
            </span>
          </h2>
          <p className="text-xl text-muted-foreground dark:text-slate-400 max-w-3xl mx-auto leading-relaxed transition-colors duration-300">
            Send professional emails to clients and companies with ease. Manage
            templates, track engagement, and boost your productivity with our
            intelligent email platform.
          </p>
        </div>

        {/* Animated Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-card/50 dark:bg-slate-800/50 border-border dark:border-slate-700 backdrop-blur-sm transition-all duration-700 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/10 group ${
                plan.popular
                  ? "ring-2 ring-emerald-500/50 scale-105 bg-card/80 dark:bg-slate-800/80 shadow-xl shadow-emerald-500/20"
                  : ""
              } ${isVisible ? `opacity-100 translate-y-0 delay-${index * 200}` : "opacity-0 translate-y-10"}`}
              style={{
                animationDelay: `${index * 200}ms`,
                animationFillMode: "both",
              }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 animate-bounce">
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1 shadow-lg">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8 group-hover:pb-6 transition-all duration-300">
                <CardTitle className="text-2xl font-bold text-foreground dark:text-white mb-2 transition-colors duration-300">
                  {plan.name}
                </CardTitle>
                <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-4xl font-bold text-foreground dark:text-white transition-colors duration-300">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground dark:text-slate-400 ml-1 transition-colors duration-300">
                      {plan.period}
                    </span>
                  )}
                </div>
                <CardDescription className="text-muted-foreground dark:text-slate-400 text-base transition-colors duration-300">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="px-6">
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className={`flex items-start transition-all duration-500 hover:translate-x-2 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
                      style={{
                        animationDelay: `${index * 200 + featureIndex * 100}ms`,
                        animationFillMode: "both",
                      }}
                    >
                      <Check className="w-5 h-5 text-emerald-500 dark:text-emerald-400 mr-3 mt-0.5 flex-shrink-0 transition-colors duration-300" />
                      <span className="text-foreground dark:text-slate-300 transition-colors duration-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-8 px-6 pb-6">
                <Button
                  className={`w-full h-12 text-base font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg group-hover:shadow-emerald-500/25 ${
                    plan.popular
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                      : "bg-transparent border-border dark:border-slate-600 text-foreground dark:text-slate-300 hover:bg-muted dark:hover:bg-slate-700 hover:text-foreground dark:hover:text-white"
                  }`}
                  variant={plan.buttonVariant}
                  size="lg"
                >
                  {plan.buttonText}
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Animated Stats Section */}
        <div
          className={`mt-20 text-center transition-all duration-1000 delay-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="grid md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="group hover:scale-110 transition-transform duration-300">
              <div className="text-3xl font-bold text-foreground dark:text-white mb-2 transition-colors duration-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                50K+
              </div>
              <div className="text-muted-foreground dark:text-slate-400 transition-colors duration-300">
                Active Users
              </div>
            </div>
            <div className="group hover:scale-110 transition-transform duration-300 delay-100">
              <div className="text-3xl font-bold text-foreground dark:text-white mb-2 transition-colors duration-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                99.9%
              </div>
              <div className="text-muted-foreground dark:text-slate-400 transition-colors duration-300">
                Uptime
              </div>
            </div>
            <div className="group hover:scale-110 transition-transform duration-300 delay-200">
              <div className="text-3xl font-bold text-foreground dark:text-white mb-2 transition-colors duration-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                2M+
              </div>
              <div className="text-muted-foreground dark:text-slate-400 transition-colors duration-300">
                Emails Sent
              </div>
            </div>
          </div>
        </div>

        {/* Animated Bottom CTA */}
        <div
          className={`text-center mt-16 transition-all duration-1000 delay-1200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <p className="text-muted-foreground dark:text-slate-400 mb-6 text-lg transition-colors duration-300">
            Need a custom solution? We'd love to help you build the perfect
            email workflow.
          </p>
          <Button
            variant="ghost"
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800 text-base transition-all duration-300 hover:scale-105"
          >
            Watch Demo
          </Button>
        </div>
      </div>
    </section>
  );
}
