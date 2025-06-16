//@ts-nocheck
"use client";
import React, { useState } from "react";
import { Check, Crown, Zap, Users, Star, ArrowRight } from "lucide-react";

// Mock plan constants - simplified for individual users
const PLAN = {
  FREE: "FREE",
  PRO: "PRO",
};

// Mock current user plan
const mockUser = {
  plan: PLAN.FREE,
  billingCycle: "monthly",
};

const ReachMatePlanManagement = () => {
  const [currentPlan, setCurrentPlan] = useState(mockUser.plan);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [isLoading, setIsLoading] = useState(false);

  const plans = [
    {
      id: PLAN.FREE,
      name: "Free",
      icon: <Star className="w-5 h-5" />,
      price: { monthly: 0, yearly: 0 },
      description: "Perfect for getting started",
      features: [
        "25 contacts",
        "50 messages/month",
        "3 email templates",
        "Basic analytics",
        "Mobile app access",
        "Email support",
      ],
      color: "from-gray-500 to-gray-600",
      popular: false,
    },
    {
      id: PLAN.PRO,
      name: "Pro",
      icon: <Zap className="w-5 h-5" />,
      price: { monthly: 19, yearly: 190 },
      description: "Unlock your full potential",
      features: [
        "Unlimited contacts",
        "Unlimited messages",
        "Unlimited templates",
        "Email sequences",
        "Advanced analytics",
        "CRM integrations",
        "Priority support",
        "Custom branding",
        "Export data",
      ],
      color: "from-green-500 to-green-600",
      popular: true,
    },
  ];

  const handlePlanChange = async (newPlan: any) => {
    if (newPlan === currentPlan) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setCurrentPlan(newPlan);
    setIsLoading(false);
  };

  // const getCurrentPlanBadge = () => {
  //   const plan = plans.find((p) => p.id === currentPlan);
  //   if (!plan) return null;

  //   return (
  //     <div className="flex items-center gap-2 mb-8">
  //       <div
  //         className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${plan.color} text-white font-medium`}
  //       >
  //         {plan.icon}
  //         <span>Current: {plan.name}</span>
  //       </div>
  //       {currentPlan === PLAN.FREE && (
  //         <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white font-medium animate-pulse">
  //           <ArrowRight className="w-4 h-4" />
  //           <span>Ready to upgrade?</span>
  //         </div>
  //       )}
  //     </div>
  //   );
  // };

  return (
    <div className="min-h-screen mt-5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              ReachMate Plans
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Choose the plan that fits your outreach needs
          </p>
          <div className="flex items-center justify-center gap-4 p-1 bg-white dark:bg-gray-800 rounded-full shadow-sm w-fit mx-auto">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-green-500 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingCycle === "yearly"
                  ? "bg-green-500 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <span>Yearly</span>
              <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan;
            const price =
              typeof plan.price[billingCycle] === "number"
                ? plan.price[billingCycle]
                : plan.price[billingCycle];

            return (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
                  plan.popular ? "ring-2 ring-green-500 scale-105" : ""
                } ${isCurrentPlan ? "ring-2 ring-green-500" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-2 text-sm font-medium">
                    Current Plan
                  </div>
                )}

                <div
                  className={`p-6 ${plan.popular || isCurrentPlan ? "pt-12" : ""}`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-r ${plan.color} flex items-center justify-center text-white mb-4`}
                  >
                    {plan.icon}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {plan.description}
                  </p>

                  <div className="mb-6">
                    {typeof price === "number" ? (
                      <div>
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          ${price}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          /{billingCycle === "yearly" ? "year" : "month"}
                        </span>
                        {billingCycle === "yearly" && price > 0 && (
                          <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                            Save $38 annually
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {price}
                      </span>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                      >
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePlanChange(plan?.id)}
                    disabled={isCurrentPlan || isLoading}
                    className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                      isCurrentPlan
                        ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 cursor-not-allowed"
                        : plan.popular
                          ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg"
                          : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : isCurrentPlan ? (
                      "Current Plan"
                    ) : plan.id === PLAN.FREE ? (
                      "Downgrade"
                    ) : currentPlan === PLAN.FREE ? (
                      "Upgrade Now"
                    ) : (
                      "Switch Plan"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                What happens if I exceed my Free plan limits?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                You'll be notified when approaching limits. You can upgrade to
                Pro anytime to continue sending messages without interruption.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I cancel my Pro subscription anytime?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Yes, you can cancel anytime. You'll retain Pro features until
                the end of your billing period, then automatically switch to
                Free.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Do I keep my data if I downgrade to Free?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Absolutely! All your contacts, messages, and templates are
                preserved. You'll just have the Free plan's monthly limits going
                forward.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Which CRM integrations are available?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Pro users can integrate with popular CRMs like Salesforce,
                HubSpot, Pipedrive, and more to sync contacts and track
                interactions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReachMatePlanManagement;
