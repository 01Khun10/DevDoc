const profiles = [
  {
    name: "Standard Software Documentation Profile",
    code: "STANDARD_SOFTWARE",
    description: "General-purpose software documentation profile for complete software projects.",
    audience: "Software teams, client projects, internal systems, SaaS products, and professional projects.",
    tone: "Formal, complete, neutral, and industry-friendly.",
    displayOrder: 1
  },
  {
    name: "Academic Project Profile",
    code: "ACADEMIC_PROJECT",
    description: "Structured documentation profile for academic software projects.",
    audience: "Students, supervisors, evaluators, and academic software project teams.",
    tone: "Academic but practical, clean, and easy to understand.",
    displayOrder: 2
  },
  {
    name: "Company Software Documentation Profile",
    code: "COMPANY_SOFTWARE",
    description: "Practical documentation profile for company, client, startup, and product software projects.",
    audience: "Software companies, product teams, agencies, internal teams, startups, and clients.",
    tone: "Professional, business-friendly, practical, and delivery-focused.",
    displayOrder: 3
  }
];

module.exports = profiles;
