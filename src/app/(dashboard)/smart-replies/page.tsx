"use client";

import React, { useState } from "react";
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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary text-primary-foreground rounded-full shadow-lg">
              <Zap className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              AI Email Template Generator
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simply paste any job description or message, and get a professional
            email template instantly
          </p>
        </div>

        {showSuccess && (
          <div className="mb-6 p-4 border border-primary/20 bg-primary/5 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="text-primary font-medium">
                Email template copied to clipboard successfully!
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-destructive font-medium">{error}</span>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Card */}
          <div className="bg-card border border-border rounded-lg shadow-sm">
            <div className="p-6 border-b border-border">
              <h3 className="flex items-center gap-2 text-xl font-semibold text-primary mb-2">
                <MessageSquare className="w-5 h-5" />
                Input Details
              </h3>
              <p className="text-muted-foreground">
                Enter the message details and your preferences
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="text-sm font-medium mb-3 block text-foreground">
                  Response Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {messageTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setMessageType(type.value)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        messageType === type.value
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      <span className="mr-2">{type.icon}</span>
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Job Description / Message to Respond To
                </label>
                <textarea
                  placeholder="Paste the job description, recruiter message, or any text you want to create a response template for..."
                  value={originalMessage}
                  onChange={(e) => setOriginalMessage(e.target.value)}
                  className="w-full min-h-[200px] p-3 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none cursor-auto"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block text-foreground">
                  Personal Context (Optional)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Your Name
                    </label>
                    <input
                      placeholder="Your name"
                      value={context.name}
                      onChange={(e) =>
                        setContext({ ...context, name: e.target.value })
                      }
                      className="w-full p-2 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Current Role
                    </label>
                    <input
                      placeholder="Your title/role"
                      value={context.role}
                      onChange={(e) =>
                        setContext({ ...context, role: e.target.value })
                      }
                      className="w-full p-2 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Target Company
                    </label>
                    <input
                      placeholder="Company name"
                      value={context.company}
                      onChange={(e) =>
                        setContext({ ...context, company: e.target.value })
                      }
                      className="w-full p-2 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Years of Experience
                    </label>
                    <input
                      placeholder="e.g., 5"
                      value={context.experience}
                      onChange={(e) =>
                        setContext({ ...context, experience: e.target.value })
                      }
                      className="w-full p-2 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block text-foreground">
                  Email Tone
                </label>
                <div className="flex flex-wrap gap-2">
                  {tones.map((toneOption) => (
                    <button
                      key={toneOption.value}
                      onClick={() => setTone(toneOption.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        tone === toneOption.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {toneOption.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generateResponse}
                disabled={isLoading || !originalMessage.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Email Template...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Email Template
                  </>
                )}
              </button>

              <div>
                <label className="text-sm font-medium mb-3 block text-foreground">
                  Try These Examples
                </label>
                <div className="space-y-2">
                  {Object.entries({
                    "job-posting": "💼 Job Posting Response",
                    "recruiter-email": "📧 Recruiter Email Reply",
                    networking: "🤝 Networking Message",
                  }).map(([key, title]) => (
                    <button
                      key={key}
                      onClick={() => loadExample(key as any)}
                      className="w-full p-3 text-left bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                    >
                      <div className="font-medium text-secondary-foreground">
                        {title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Click to load example content
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Output Card */}
          <div className="bg-card border border-border rounded-lg shadow-sm">
            <div className="p-6 border-b border-border">
              <h3 className="flex items-center gap-2 text-xl font-semibold text-primary mb-2">
                <Mail className="w-5 h-5" />
                Generated Email Template
              </h3>
              <p className="text-muted-foreground">
                Your professional, ready-to-send email template
              </p>
            </div>
            <div className="p-6">
              <div className="bg-muted rounded-lg p-4 min-h-[400px] mb-4 border border-border">
                {generatedResponse ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-primary">
                        Template Generated Successfully
                      </span>
                    </div>
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground font-mono">
                      {generatedResponse}
                    </pre>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[350px] text-muted-foreground text-center">
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

              {generatedResponse && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Template
                  </button>
                  <button
                    onClick={generateResponse}
                    disabled={isLoading}
                    className="px-3 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border rounded-md text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </button>
                  <button
                    onClick={downloadResponse}
                    className="px-3 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageResponseGenerator;
