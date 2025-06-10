"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MessageSquare,
  Sparkles,
  Copy,
  RefreshCw,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  Zap,
} from "lucide-react";

const MessageResponseGenerator = () => {
  const [originalMessage, setOriginalMessage] = useState("");
  const [messageType, setMessageType] = useState("job-application");
  const [tone, setTone] = useState("professional");
  const [context, setContext] = useState({
    name: "",
    role: "",
    company: "",
    experience: "",
  });
  const [generatedResponse, setGeneratedResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  const messageTypes = [
    { value: "job-application", label: "Job Application", icon: "💼" },
    { value: "networking", label: "Networking", icon: "🤝" },
    { value: "follow-up", label: "Follow-up", icon: "📧" },
    { value: "inquiry", label: "General Inquiry", icon: "❓" },
    { value: "thank-you", label: "Thank You", icon: "🙏" },
    { value: "other", label: "Other", icon: "📝" },
  ];

  const tones = [
    { value: "professional", label: "Professional" },
    { value: "friendly", label: "Friendly" },
    { value: "confident", label: "Confident" },
    { value: "enthusiastic", label: "Enthusiastic" },
    { value: "formal", label: "Formal" },
    { value: "casual", label: "Casual" },
  ];

  const examples = {
    "job-posting": `We are looking for a Senior Full Stack Developer to join our growing team at TechCorp. 

Requirements:
- 5+ years of experience with React and Node.js
- Strong background in cloud technologies (AWS/Azure)
- Experience with agile development methodologies
- Excellent communication skills

What we offer:
- Competitive salary ($120k-$150k)
- Remote work flexibility
- Health benefits and 401k matching
- Professional development opportunities

If you're passionate about building scalable web applications and want to work with cutting-edge technologies, we'd love to hear from you!`,

    "recruiter-email": `Hi there,

I hope this message finds you well. I came across your LinkedIn profile and was impressed by your background in software engineering, particularly your experience with Python and machine learning.

I'm currently working with a fast-growing fintech startup that's looking for a Senior Data Scientist to join their team. The role offers excellent growth opportunities, competitive compensation, and the chance to work on exciting projects in the financial technology space.

Would you be open to a brief conversation about this opportunity? I'd love to learn more about your career goals and see if this might be a good fit.

Best regards,
Sarah Johnson - Technical Recruiter`,

    networking: `Hi [Name],

I hope you're doing well! I noticed we both work in the tech industry and share some common connections. I'm really interested in learning more about your experience at [Company], especially your work in product management.

I'm currently exploring opportunities to transition into product management from my current role in software development, and I'd love to get your insights on the field.

Would you be open to connecting for a brief coffee chat or video call sometime in the next couple of weeks? I'd really appreciate any advice you might have.

Thanks for considering, and I look forward to potentially connecting!

Best regards,
[Your Name]`,
  };

  const generateResponse = async () => {
    if (!originalMessage.trim()) {
      setError("Please enter a message or job description to respond to.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const prompt = `You are a professional communication assistant helping someone craft a perfect response to a message or job description. 

Original message/job description:
"""
${originalMessage}
"""

Context about the person responding:
- Name: ${context.name || "the candidate"}
- Current role: ${context.role || "professional"}
- Target company: ${context.company || "Not specified"}
- Experience: ${context.experience || "Not specified"} years
- Message type: ${messageType}
- Desired tone: ${tone}

Please generate a professional, well-structured response that:
1. Is appropriate for the message type (${messageType})
2. Uses a ${tone} tone
3. Addresses key points from the original message
4. Includes relevant personal context where appropriate
5. Has a clear call-to-action or next steps
6. Is concise but comprehensive
7. Follows professional email/message formatting

The response should be ready to send with minimal editing needed.`;

      const response = await fetch("/api/claude", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: prompt,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate response");
      }

      const data = await response.json();
      setGeneratedResponse(data.response);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to generate response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (generatedResponse) {
      try {
        await navigator.clipboard.writeText(generatedResponse);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } catch (err) {
        console.error("Failed to copy: ", err);
      }
    }
  };

  const downloadResponse = () => {
    if (generatedResponse) {
      const blob = new Blob([generatedResponse], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "email_template.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const loadExample = (exampleKey: number) => {
    //@ts-ignore
    if (examples[exampleKey]) {
      //@ts-ignore
      setOriginalMessage(examples[exampleKey]);
    }
  };

  return (
    <div className="min-h-screen">
      <div>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-green-500 text-white dark:bg-green-600 rounded-full">
              <Zap className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold ">AI Email Template Generator</h1>
          </div>
          <p className="text-lg  max-w-2xl mx-auto">
            Simply paste any job description or message, and get a professional
            email template instantly
          </p>
        </div>

        {/* Success/Error Alerts */}
        {showSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Email template copied to clipboard successfully!
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="border-green-200 dark:border-green-800 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <MessageSquare className="w-5 h-5" />
                Input Details
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Enter the message details and your preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Message Type Selection */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Response Type
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {messageTypes.map((type) => (
                    <Button
                      key={type.value}
                      variant={
                        messageType === type.value ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setMessageType(type.value)}
                      className={
                        messageType === type.value
                          ? "bg-green-600 hover:bg-green-700"
                          : "hover:bg-green-50"
                      }
                    >
                      <span className="mr-2">{type.icon}</span>
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Original Message */}
              <div>
                <Label htmlFor="originalMessage">
                  Job Description / Message to Respond To
                </Label>
                <Textarea
                  id="originalMessage"
                  placeholder="Paste the job description, recruiter message, or any text you want to create a response template for..."
                  value={originalMessage}
                  onChange={(e) => setOriginalMessage(e.target.value)}
                  className="min-h-[200px] mt-2"
                />
              </div>

              {/* Context Information */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Personal Context (Optional)
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="name" className="text-xs text-gray-600">
                      Your Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={context.name}
                      onChange={(e) =>
                        setContext({ ...context, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="role" className="text-xs text-gray-600">
                      Current Role
                    </Label>
                    <Input
                      id="role"
                      placeholder="Your title/role"
                      value={context.role}
                      onChange={(e) =>
                        setContext({ ...context, role: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="company" className="text-xs text-gray-600">
                      Target Company
                    </Label>
                    <Input
                      id="company"
                      placeholder="Company name"
                      value={context.company}
                      onChange={(e) =>
                        setContext({ ...context, company: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="experience"
                      className="text-xs text-gray-600"
                    >
                      Years of Experience
                    </Label>
                    <Input
                      id="experience"
                      placeholder="e.g., 5"
                      value={context.experience}
                      onChange={(e) =>
                        setContext({ ...context, experience: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Tone Selection */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Email Tone
                </Label>
                <div className="flex flex-wrap gap-2">
                  {tones.map((toneOption) => (
                    <Badge
                      key={toneOption.value}
                      variant={
                        tone === toneOption.value ? "default" : "outline"
                      }
                      className={`cursor-pointer px-3 py-1 ${
                        tone === toneOption.value
                          ? "bg-green-600 hover:bg-green-700"
                          : "hover:bg-green-50"
                      }`}
                      onClick={() => setTone(toneOption.value)}
                    >
                      {toneOption.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateResponse}
                disabled={isLoading || !originalMessage.trim()}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Email Template...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Email Template
                  </>
                )}
              </Button>

              {/* Quick Examples */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Try These Examples
                </Label>
                <div className="space-y-2">
                  {Object.entries({
                    "job-posting": "💼 Job Posting Response",
                    "recruiter-email": "📧 Recruiter Email Reply",
                    networking: "🤝 Networking Message",
                  }).map(([key, title]) => (
                    <Button
                      key={key}
                      variant="ghost"
                      size="sm"
                      onClick={() => loadExample(key as unknown as number)}
                      className="w-full justify-start text-left hover:bg-green-50"
                    >
                      <div>
                        <div className="font-medium">{title}</div>
                        <div className="text-xs text-gray-500 truncate">
                          Click to load example content
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Mail className="w-5 h-5" />
                Generated Email Template
              </CardTitle>
              <CardDescription>
                Your professional, ready-to-send email template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[400px] mb-4 border">
                {generatedResponse ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        Template Generated Successfully
                      </span>
                    </div>
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 font-sans">
                      {generatedResponse}
                    </pre>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[350px] text-gray-500 text-center">
                    <div>
                      <Mail className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium mb-2">
                        Ready to Generate Your Email Template
                      </p>
                      <p className="text-sm">
                        Enter your message details on the left and click
                        "Generate Email Template"
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {generatedResponse && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    size="sm"
                    className="hover:bg-green-50 border-green-200"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Template
                  </Button>
                  <Button
                    onClick={generateResponse}
                    variant="outline"
                    size="sm"
                    className="hover:bg-green-50 border-green-200"
                    disabled={isLoading}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                  <Button
                    onClick={downloadResponse}
                    variant="outline"
                    size="sm"
                    className="hover:bg-green-50 border-green-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MessageResponseGenerator;
