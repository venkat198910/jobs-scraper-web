export type CompanyMetadata = {
  type: string;
  employees: string;
  rating?: number;
};

const COMPANY_METADATA: Record<string, CompanyMetadata> = {
  "crowdstrike": { type: "Product", employees: "~10,000+", rating: 5.0 },
  "okta": { type: "Product", employees: "~6,000+", rating: 5.0 },
  "morgan stanley": { type: "Banking Technology", employees: "~80,000+", rating: 4.9 },
  "sumo logic": { type: "Product (SaaS)", employees: "~800-1,000", rating: 4.9 },
  "eightfold ai": { type: "Product", employees: "~1,000+", rating: 4.8 },
  "cognite": { type: "Product", employees: "~1,000+", rating: 4.8 },
  "emirates nbd": { type: "Banking Technology", employees: "~30,000+", rating: 4.8 },
  "hycu": { type: "Product", employees: "~200-500", rating: 4.7 },
  "bmc software": { type: "Product", employees: "~6,000-7,000", rating: 4.6 },
  "ig group": { type: "Product / Fintech", employees: "~2,000+", rating: 4.3 },
  "shuru": { type: "Product / Consumer Platform", employees: "~200-500", rating: 4.0 },
  "innova esi": { type: "Service Based", employees: "~5,000+", rating: 4.0 },
  "ust": { type: "Service Based", employees: "~30,000+", rating: 4.0 },
  "ust global": { type: "Service Based", employees: "~30,000+", rating: 4.0 },
  "bosch global software technologies": { type: "Product Engineering / Service Based", employees: "~30,000+", rating: 4.3 },
  "google": { type: "Product", employees: "~180,000+", rating: 5.0 },
  "microsoft": { type: "Product", employees: "~220,000+", rating: 5.0 },
  "amazon": { type: "Product", employees: "~1,500,000+", rating: 4.8 },
  "amazon (aws)": { type: "Product", employees: "~1,500,000+", rating: 4.8 },
  "apple": { type: "Product", employees: "~160,000+", rating: 4.9 },
  "meta": { type: "Product", employees: "~70,000+", rating: 4.8 },
  "nvidia": { type: "Product", employees: "~30,000+", rating: 5.0 },
  "adobe": { type: "Product", employees: "~30,000+", rating: 4.8 },
  "salesforce": { type: "Product (SaaS)", employees: "~70,000+", rating: 4.7 },
  "servicenow": { type: "Product (SaaS)", employees: "~25,000+", rating: 4.8 },
  "oracle": { type: "Product", employees: "~150,000+", rating: 4.5 },
  "sap": { type: "Product", employees: "~100,000+", rating: 4.6 },
  "cisco": { type: "Product", employees: "~80,000+", rating: 4.6 },
  "intel": { type: "Product", employees: "~120,000+", rating: 4.4 },
  "amd": { type: "Product", employees: "~25,000+", rating: 4.7 },
  "qualcomm": { type: "Product", employees: "~50,000+", rating: 4.5 },
  "broadcom": { type: "Product", employees: "~20,000+", rating: 4.5 },
  "red hat": { type: "Product", employees: "~20,000+", rating: 4.7 },
  "datadog": { type: "Product (SaaS)", employees: "~5,000+", rating: 4.8 },
  "snowflake": { type: "Product (SaaS)", employees: "~7,000+", rating: 4.8 },
  "cloudflare": { type: "Product", employees: "~4,000+", rating: 4.8 },
  "mongodb": { type: "Product", employees: "~5,000+", rating: 4.7 },
  "elastic": { type: "Product", employees: "~3,000+", rating: 4.6 },
  "paypal": { type: "Product", employees: "~25,000+", rating: 4.4 },
  "visa": { type: "Product / Payments", employees: "~30,000+", rating: 4.7 },
  "mastercard": { type: "Product / Payments", employees: "~30,000+", rating: 4.7 },
  "jpmorgan chase": { type: "Banking Technology", employees: "~300,000+", rating: 4.5 },
  "goldman sachs": { type: "Banking Technology", employees: "~45,000+", rating: 4.5 },
  "capital one": { type: "Banking Technology", employees: "~50,000+", rating: 4.6 },
  "flipkart": { type: "Product / Ecommerce", employees: "~20,000+", rating: 4.5 },
  "phonepe": { type: "Product / Fintech", employees: "~8,000+", rating: 4.6 },
  "zoho": { type: "Product (SaaS)", employees: "~15,000+", rating: 4.7 },
  "freshworks": { type: "Product (SaaS)", employees: "~5,000+", rating: 4.5 },
  "emirates group": { type: "Enterprise Technology", employees: "~100,000+", rating: 4.6 },
  "first abu dhabi bank (fab)": { type: "Banking Technology", employees: "~7,000+", rating: 4.5 },
  "adcb": { type: "Banking Technology", employees: "~5,000+", rating: 4.4 },
  "mashreq": { type: "Banking Technology", employees: "~5,000+", rating: 4.4 },
  "noon": { type: "Product / Ecommerce", employees: "~5,000+", rating: 4.3 },
};

export function getCompanyMetadata(company?: string): CompanyMetadata | undefined {
  const normalized = normalizeCompanyName(company);
  if (!normalized) return undefined;

  const exactOrFuzzyMatch =
    COMPANY_METADATA[normalized] ??
    Object.entries(COMPANY_METADATA).find(([name]) => normalized.includes(name) || name.includes(normalized))?.[1];

  return exactOrFuzzyMatch ?? inferCompanyMetadata(normalized);
}

function normalizeCompanyName(company?: string) {
  return String(company ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function inferCompanyMetadata(normalizedCompany: string): CompanyMetadata {
  if (/\b(bank|capital|financial|finance|securities|payments|fintech)\b/.test(normalizedCompany)) {
    return { type: "Banking Technology", employees: "Employee count unknown" };
  }

  if (
    /\b(consulting|consultants|services|solutions|systems|technologies|technology|infotech|esi|outsourcing)\b/.test(
      normalizedCompany,
    )
  ) {
    return { type: "Service Based", employees: "Employee count unknown" };
  }

  return { type: "Product / Enterprise", employees: "Employee count unknown" };
}
