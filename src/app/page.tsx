import Link from "next/link";
import { Mail, Zap, BarChart3, Users, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function IntroPage() {
  return (
    <div className="min-h-screen ">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 p-2 shadow-md">
              <Mail className="h-full w-full text-white" />
            </div>
            <span className="text-xl font-bold text-green-800">ReachMate</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-green-700 hover:text-green-600"
            >
              Sign in
            </Link>
            <Link href="/sign-up">
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <div className="inline-block rounded-full bg-green-100 px-4 py-1 text-sm font-medium text-green-800">
              Professional Email Management
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Streamline your</span>
              <span className="block bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                email workflow
              </span>
            </h1>
            <p className="max-w-md text-lg text-gray-600">
              Send professional emails to clients and companies with ease.
              Manage templates, track engagement, and boost your productivity.
            </p>
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  Get Started for Free
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-video overflow-hidden rounded-xl bg-white/80 p-4 shadow-2xl backdrop-blur-sm">
              <div className="h-full rounded-lg bg-gradient-to-br from-green-100 to-emerald-50 p-6">
                <div className="mb-4 flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-400"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                  <div className="h-3 w-3 rounded-full bg-green-400"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-6 w-3/4 rounded-md bg-white/70"></div>
                  <div className="h-4 w-1/2 rounded-md bg-white/70"></div>
                  <div className="h-20 rounded-md bg-white/70"></div>
                  <div className="flex justify-end">
                    <div className="h-8 w-24 rounded-md bg-green-500/70"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 p-4 shadow-lg">
              <Mail className="h-full w-full text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Powerful Email Features
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Everything you need to manage your professional email communications
            in one place.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <div className="rounded-xl bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">
              Quick Templates
            </h3>
            <p className="text-gray-600">
              Create and save professional email templates for different
              scenarios and clients.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-xl bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">
              Email Analytics
            </h3>
            <p className="text-gray-600">
              Track open rates, click-through rates, and engagement metrics for
              all your emails.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-xl bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">
              Client Management
            </h3>
            <p className="text-gray-600">
              Organize contacts, segment audiences, and personalize
              communications effortlessly.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-r from-green-500 to-emerald-600 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-white">
              Loved by professionals
            </h2>
            <p className="mt-4 text-lg text-green-100">
              Join thousands of professionals who trust ReachMate for their
              email communications.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-6">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <CheckCircle2 key={i} className="h-6 w-6 text-white" />
                ))}
              </div>
              <p className="text-lg font-medium text-white">
                "ReachMate has transformed how I communicate with clients. It's
                intuitive and powerful."
              </p>
              <div className="w-full">
                <p className="font-medium text-green-100">Sarah Johnson</p>
                <p className="text-sm text-green-200">Marketing Director</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="rounded-2xl bg-white/80 p-8 shadow-xl backdrop-blur-sm md:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Ready to get started?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Join thousands of professionals who use ReachMate to streamline
              their email communications.
            </p>
            <div className="mt-8 flex flex-col justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  Create Free Account
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-green-100 bg-white/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between space-y-6 md:flex-row md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 p-1.5 shadow-md">
                <Mail className="h-full w-full text-white" />
              </div>
              <span className="text-lg font-bold text-green-800">
                ReachMate
              </span>
            </div>
            <div className="flex space-x-6">
              <Link
                href="#"
                className="text-sm text-gray-600 hover:text-green-600"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-sm text-gray-600 hover:text-green-600"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-sm text-gray-600 hover:text-green-600"
              >
                Contact
              </Link>
            </div>
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} ReachMate. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
