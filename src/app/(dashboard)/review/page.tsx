"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sparkles,
  FileText,
  Wand2,
  CheckCircle,
  AlertCircle,
  Copy,
  RefreshCw,
  Lightbulb,
  Target,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

const EmailTemplateReviewer = () => {
  const [context, setContext] = useState<string>("");
  const [emailTemplate, setEmailTemplate] = useState<string>("");
  const [improvedTemplate, setImprovedTemplate] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasResult, setHasResult] = useState<boolean>(false);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      setIsLoading(true);
      setError(null);
      setImprovedTemplate("");
      setHasResult(false);

      const prompt = `Given the following context and email template, please review the email for clarity, tone, conciseness, grammar, and effectiveness. Suggest improvements and provide the revised template. If no improvements are needed, state that the template is good as is, perhaps with minor suggestions.

Context:
${context}

Email Template:
${emailTemplate}`;

      try {
        const response = await fetch(`/api/gemini`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        setImprovedTemplate(data.text);
        setHasResult(true);
        toast.success("Email template reviewed successfully!");
      } catch (err: any) {
        console.error("Error reviewing email template:", err);
        setError(
          err.message || "Failed to review email template. Please try again."
        );
        toast.error("Failed to review email template");
      } finally {
        setIsLoading(false);
      }
    },
    [context, emailTemplate]
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(improvedTemplate);
    toast.success("Improved template copied to clipboard!");
  }, [improvedTemplate]);

  const handleReset = useCallback(() => {
    setContext("");
    setEmailTemplate("");
    setImprovedTemplate("");
    setError(null);
    setHasResult(false);
  }, []);

  const isFormValid = context.trim() && emailTemplate.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-2xl ">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Email Template Reviewer
              </h1>
              <p className="text-muted-foreground text-sm lg:text-base mt-1">
                AI-powered email optimization and improvement
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary" className="gap-1">
              <Wand2 className="h-3 w-3" />
              AI-Powered
            </Badge>
            <Badge variant="outline" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Instant Results
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="border-0  bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Email Context</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Provide context for better AI analysis
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Label
                    htmlFor="context"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Lightbulb className="h-4 w-4" />
                    Context & Purpose
                  </Label>
                  <Textarea
                    id="context"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="e.g., This email is to apologize to a customer for a delayed order and offer a discount on their next purchase. The tone should be professional yet empathetic."
                    className="min-h-[120px] resize-none transition-all focus:ring-2 focus:ring-primary/20"
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    Describe the email's purpose, target audience, and desired
                    tone
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0  bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Email Template</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Your current email draft
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Label
                    htmlFor="emailTemplate"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Email Content
                  </Label>
                  <Textarea
                    id="emailTemplate"
                    value={emailTemplate}
                    onChange={(e) => setEmailTemplate(e.target.value)}
                    placeholder="e.g., Hi [Customer Name], We are sorry your order is delayed. Here is a 10% off for next time. Best, [Your Name]"
                    className="min-h-[160px] resize-none transition-all focus:ring-2 focus:ring-primary/20"
                    rows={7}
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste your email template or draft here
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !isFormValid}
                className="flex-1 h-12 text-white bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary  transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Review & Improve
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isLoading}
                className="h-12 px-6 hover:bg-muted transition-all"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <Card className="border-0  bg-card/50 backdrop-blur-sm min-h-[400px]">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        AI Review & Suggestions
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {hasResult
                          ? "Analysis complete"
                          : "Results will appear here"}
                      </p>
                    </div>
                  </div>
                  {hasResult && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="gap-2 hover:bg-muted transition-all"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                {error && (
                  <Alert className="border-destructive/20 bg-destructive/5">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <AlertDescription className="text-destructive">
                      <strong>Error:</strong> {error}
                    </AlertDescription>
                  </Alert>
                )}

                {isLoading && (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center space-y-4">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
                        <Sparkles className="h-6 w-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <div>
                        <p className="font-medium text-primary">
                          Analyzing your email...
                        </p>
                        <p className="text-sm text-muted-foreground">
                          AI is reviewing for clarity, tone, and effectiveness
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!isLoading && !error && !hasResult && (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center space-y-4">
                      <div className="p-4 bg-muted/30 rounded-full w-fit mx-auto">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">
                          Ready for Analysis
                        </p>
                        <p className="text-sm text-muted-foreground/70">
                          Fill in the context and email template to get started
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {hasResult && improvedTemplate && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        Analysis Complete
                      </span>
                    </div>
                    <Separator />
                    <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg p-4 border">
                      <div className="prose prose-sm max-w-none">
                        <div
                          className="whitespace-pre-wrap text-sm leading-relaxed"
                          style={{
                            fontFamily:
                              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          }}
                        >
                          {improvedTemplate}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="border-0  bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg shrink-0">
                    <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100">
                      Pro Tips
                    </h4>
                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      <li>
                        • Be specific about your email's purpose and target
                        audience
                      </li>
                      <li>
                        • Include desired tone (formal, casual, empathetic,
                        etc.)
                      </li>
                      <li>
                        • Mention any specific requirements or constraints
                      </li>
                      <li>
                        • The more context you provide, the better the AI
                        suggestions
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateReviewer;
