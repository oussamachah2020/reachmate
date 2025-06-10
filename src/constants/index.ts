const templatePrompts = [
  {
    name: "Welcome Email",
    description: "Professional welcome email for new clients/customers",
    prompt:
      "Create a warm and professional welcome email template for new clients. Include placeholders for personalization and maintain a friendly yet business tone.",
  },
  {
    name: "Follow-up Email",
    description: "Follow-up after meeting or presentation",
    prompt:
      "Create a professional follow-up email template after a business meeting or presentation. Include action items and next steps.",
  },
  {
    name: "Thank You Email",
    description: "Express gratitude professionally",
    prompt:
      "Create a professional thank you email template that can be used for various business scenarios like after purchases, meetings, or collaborations.",
  },
  {
    name: "Appointment Confirmation",
    description: "Confirm scheduled appointments",
    prompt:
      "Create a professional appointment confirmation email template with all necessary details and instructions.",
  },
  {
    name: "Product Launch",
    description: "Announce new products or services",
    prompt:
      "Create an engaging product launch email template that builds excitement and includes key product benefits.",
  },
  {
    name: "Newsletter Template",
    description: "Regular newsletter format",
    prompt:
      "Create a professional newsletter email template with sections for updates, news, and call-to-actions.",
  },
  {
    name: "Custom Request",
    description: "Describe your specific needs",
    prompt: "",
  },
];

const templateVariables = [
  { name: "First Name", value: "[First Name]" },
  { name: "Last Name", value: "[Last Name]" },
  { name: "Company", value: "[Company]" },
  { name: "Email", value: "[Email]" },
  { name: "Phone", value: "[Phone]" },
  { name: "Date", value: "[Date]" },
  { name: "Address", value: "[Address]" },
  { name: "Custom Field", value: "[Custom Field]" },
];

export { templatePrompts, templateVariables };
