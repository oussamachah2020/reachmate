import React from "react";
import { Mail, ArrowRight, Zap, Users, TrendingUp } from "lucide-react";
import { Button } from "../ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center py-20 bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/90 via-emerald-50/20 to-teal-50/20 dark:from-slate-900/90 dark:via-emerald-950/20 dark:to-teal-950/20"></div>

      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-400 dark:from-emerald-400/30 dark:to-teal-400/30 rounded-full opacity-20 dark:opacity-40 animate-float dark:blur-sm"></div>
      <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-400 dark:from-teal-400/30 dark:to-cyan-400/30 rounded-lg opacity-20 dark:opacity-40 animate-float-delayed rotate-45 dark:blur-sm"></div>
      <div className="absolute bottom-40 left-20 w-12 h-12 bg-gradient-to-r from-green-500 to-teal-400 dark:from-emerald-500/40 dark:to-teal-400/40 rounded-full opacity-30 dark:opacity-50 animate-pulse dark:blur-sm"></div>

      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'%3e%3cpath d='m 40 0 l 0 40 l -40 0 l 0 -40' stroke='%23000000' stroke-width='1' fill='none'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23grid)'/%3e%3c/svg%3e")`,
        }}
      ></div>

      <div
        className="absolute inset-0 opacity-0 dark:opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='dark-grid' width='40' height='40' patternUnits='userSpaceOnUse'%3e%3cpath d='m 40 0 l 0 40 l -40 0 l 0 -40' stroke='%23ffffff' stroke-width='1' fill='none'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23dark-grid)'/%3e%3c/svg%3e")`,
        }}
      ></div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-emerald-900/50 dark:to-teal-900/50 dark:backdrop-blur-sm rounded-full text-green-800 dark:text-emerald-300 text-sm font-semibold animate-fade-in-up border-0 dark:border dark:border-emerald-800/30">
              <Zap className="w-4 h-4 mr-2" />
              Professional Email Management
            </div>

            <div className="space-y-6 animate-fade-in-up-delayed">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="block text-gray-900 dark:text-slate-100">
                  Streamline your
                </span>
                <span className="block bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  email workflow
                </span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Send professional emails to clients and companies with ease.
                Manage templates, track engagement, and boost your productivity
                with our intelligent email platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="group text-white">
                  Get Started for Free
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button variant="outline" size="lg">
                  Watch Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 pt-8 border-t border-gray-200 dark:border-slate-700/50">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                    50K+
                  </div>
                  <div className="text-sm text-gray-600 dark:text-slate-400">
                    Active Users
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                    99.9%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-slate-400">
                    Uptime
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                    2M+
                  </div>
                  <div className="text-sm text-gray-600 dark:text-slate-400">
                    Emails Sent
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative lg:ml-8">
            <div className="relative bg-white dark:bg-slate-800/80 dark:backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-700/50 animate-fade-in-right">
              <div className="bg-gray-50 dark:bg-slate-900/80 px-6 py-4 border-b border-gray-200 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-slate-400 font-medium">
                    ReachMate Pro
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="w-48 h-6 bg-gray-200 dark:bg-slate-700/50 rounded animate-pulse"></div>
                    <div className="w-32 h-4 bg-gray-100 dark:bg-slate-600/50 rounded mt-2 animate-pulse"></div>
                  </div>
                  <div className="w-24 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg animate-pulse shadow-lg"></div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-2xl p-6 space-y-4 border border-green-100 dark:border-emerald-800/30 dark:backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 dark:bg-gradient-to-r dark:from-emerald-500 dark:to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <div className="w-40 h-4 bg-white/60 dark:bg-slate-700/60 rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="w-full h-4 bg-white/60 dark:bg-slate-700/60 rounded animate-pulse"></div>
                    <div className="w-5/6 h-4 bg-white/60 dark:bg-slate-700/60 rounded animate-pulse"></div>
                    <div className="w-4/5 h-4 bg-white/60 dark:bg-slate-700/60 rounded animate-pulse"></div>
                    <div className="w-3/4 h-4 bg-white/60 dark:bg-slate-700/60 rounded animate-pulse"></div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-3">
                    <div className="w-20 h-8 bg-gray-100 dark:bg-slate-700/50 rounded animate-pulse"></div>
                    <div className="w-16 h-8 bg-gray-100 dark:bg-slate-700/50 rounded animate-pulse"></div>
                  </div>
                  <div className="w-28 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg animate-pulse shadow-lg"></div>
                </div>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-emerald-500 dark:to-teal-600 rounded-xl shadow-lg dark:shadow-2xl flex items-center justify-center animate-float">
              <Mail className="w-8 h-8 text-white" />
            </div>

            <div className="absolute -bottom-4 -left-8 w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-teal-500 dark:to-cyan-500 rounded-xl shadow-lg dark:shadow-2xl flex items-center justify-center animate-float-delayed">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>

            <div className="absolute top-1/3 -left-6 w-14 h-14 bg-gradient-to-r from-teal-400 to-green-500 dark:from-cyan-400 dark:to-emerald-500 rounded-full shadow-lg dark:shadow-2xl flex items-center justify-center animate-pulse">
              <Users className="w-6 h-6 text-white" />
            </div>

            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 dark:from-emerald-500/10 dark:to-teal-500/10 rounded-3xl blur-3xl scale-110 -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
