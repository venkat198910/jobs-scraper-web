export type CompanyMetadata = {
  type: string;
  employees: string;
  rating?: number;
  source?: "curated" | "wikidata" | "inferred";
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

const dynamicMetadataCache = new Map<string, CompanyMetadata | undefined>();

export function getCompanyMetadata(company?: string): CompanyMetadata | undefined {
  const normalized = normalizeCompanyName(company);
  if (!normalized) return undefined;
  return getCuratedCompanyMetadata(normalized) ?? inferCompanyMetadata(normalized);
}

export async function getDynamicCompanyMetadata(company?: string): Promise<CompanyMetadata | undefined> {
  const normalized = normalizeCompanyName(company);
  if (!normalized) return undefined;

  const curated = getCuratedCompanyMetadata(normalized);
  if (curated) return { ...curated, source: "curated" };

  const wikidata = await getWikidataCompanyMetadata(normalized);
  if (wikidata) return wikidata;

  return inferCompanyMetadata(normalized);
}

function getCuratedCompanyMetadata(normalizedCompany: string) {
  return (
    COMPANY_METADATA[normalizedCompany] ??
    Object.entries(COMPANY_METADATA).find(
      ([name]) => normalizedCompany.includes(name) || name.includes(normalizedCompany),
    )?.[1]
  );
}

function normalizeCompanyName(company?: string) {
  return String(company ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

async function getWikidataCompanyMetadata(normalizedCompany: string): Promise<CompanyMetadata | undefined> {
  if (dynamicMetadataCache.has(normalizedCompany)) {
    return dynamicMetadataCache.get(normalizedCompany);
  }

  try {
    const searchUrl = new URL("https://www.wikidata.org/w/api.php");
    searchUrl.searchParams.set("action", "wbsearchentities");
    searchUrl.searchParams.set("search", normalizedCompany);
    searchUrl.searchParams.set("language", "en");
    searchUrl.searchParams.set("format", "json");
    searchUrl.searchParams.set("limit", "1");
    searchUrl.searchParams.set("origin", "*");

    const searchResponse = await fetch(searchUrl, { next: { revalidate: 60 * 60 * 24 * 14 } });
    if (!searchResponse.ok) throw new Error(`Wikidata search failed: ${searchResponse.status}`);

    const searchJson = (await searchResponse.json()) as { search?: Array<{ id?: string }> };
    const entityId = searchJson.search?.[0]?.id;
    if (!entityId) {
      dynamicMetadataCache.set(normalizedCompany, undefined);
      return undefined;
    }

    const entityResponse = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${entityId}.json`, {
      next: { revalidate: 60 * 60 * 24 * 14 },
    });
    if (!entityResponse.ok) throw new Error(`Wikidata entity failed: ${entityResponse.status}`);

    const entityJson = (await entityResponse.json()) as WikidataEntityResponse;
    const entity = entityJson.entities?.[entityId];
    if (!entity) {
      dynamicMetadataCache.set(normalizedCompany, undefined);
      return undefined;
    }

    const employees = formatWikidataEmployees(entity.claims?.P1128?.[0]?.mainsnak?.datavalue?.value?.amount);
    const labels = await getWikidataLabels(getWikidataClaimEntityIds(entity, ["P31", "P452"]));
    const type = inferCompanyTypeFromLabels(normalizedCompany, labels);
    const metadata: CompanyMetadata = {
      type,
      employees: employees ?? "Employee count unknown",
      rating: estimateRating(type, employees),
      source: "wikidata",
    };

    dynamicMetadataCache.set(normalizedCompany, metadata);
    return metadata;
  } catch {
    dynamicMetadataCache.set(normalizedCompany, undefined);
    return undefined;
  }
}

type WikidataEntityResponse = {
  entities?: Record<
    string,
    {
      claims?: Record<
        string,
        Array<{
          mainsnak?: {
            datavalue?: {
              value?: {
                amount?: string;
                id?: string;
              };
            };
          };
        }>
      >;
    }
  >;
};

function getWikidataClaimEntityIds(entity: NonNullable<WikidataEntityResponse["entities"]>[string], properties: string[]) {
  return Array.from(
    new Set(
      properties.flatMap((property) =>
        (entity.claims?.[property] ?? [])
          .map((claim) => claim.mainsnak?.datavalue?.value?.id)
          .filter((id): id is string => Boolean(id)),
      ),
    ),
  ).slice(0, 12);
}

async function getWikidataLabels(ids: string[]) {
  if (ids.length === 0) return [];

  const url = new URL("https://www.wikidata.org/w/api.php");
  url.searchParams.set("action", "wbgetentities");
  url.searchParams.set("ids", ids.join("|"));
  url.searchParams.set("props", "labels");
  url.searchParams.set("languages", "en");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  const response = await fetch(url, { next: { revalidate: 60 * 60 * 24 * 14 } });
  if (!response.ok) return [];

  const json = (await response.json()) as {
    entities?: Record<string, { labels?: { en?: { value?: string } } }>;
  };

  return Object.values(json.entities ?? {})
    .map((entity) => entity.labels?.en?.value)
    .filter((label): label is string => Boolean(label))
    .map((label) => label.toLowerCase());
}

function formatWikidataEmployees(amount?: string) {
  if (!amount) return undefined;
  const value = Number(amount.replace(/^\+/, ""));
  if (!Number.isFinite(value) || value <= 0) return undefined;
  if (value >= 1000000) return `~${Math.round(value / 100000) / 10}M+`;
  if (value >= 1000) return `~${Math.round(value / 1000).toLocaleString("en-US")},000+`;
  return `~${Math.round(value)}+`;
}

function inferCompanyTypeFromLabels(normalizedCompany: string, labels: string[]) {
  const text = `${normalizedCompany} ${labels.join(" ")}`;
  if (/\b(bank|banking|financial services|investment|securities|fintech|payments)\b/.test(text)) {
    return "Banking Technology";
  }
  if (/\b(consulting|information technology consulting|outsourcing|professional services|service provider)\b/.test(text)) {
    return "Service Based";
  }
  if (/\b(software|saas|cloud computing|technology company|internet company|e-commerce|computer hardware)\b/.test(text)) {
    return "Product";
  }
  return inferCompanyMetadata(normalizedCompany).type;
}

function estimateRating(type: string, employees?: string) {
  if (!employees || employees === "Employee count unknown") return undefined;
  if (/Product|Banking Technology/.test(type)) return 4.2;
  if (/Service Based/.test(type)) return 4.0;
  return 4.1;
}

function inferCompanyMetadata(normalizedCompany: string): CompanyMetadata {
  if (/\b(bank|capital|financial|finance|securities|payments|fintech)\b/.test(normalizedCompany)) {
    return { type: "Banking Technology", employees: "Employee count unknown", source: "inferred" };
  }

  if (
    /\b(consulting|consultants|services|solutions|systems|technologies|technology|infotech|esi|outsourcing)\b/.test(
      normalizedCompany,
    )
  ) {
    return { type: "Service Based", employees: "Employee count unknown", source: "inferred" };
  }

  return { type: "Product / Enterprise", employees: "Employee count unknown", source: "inferred" };
}
