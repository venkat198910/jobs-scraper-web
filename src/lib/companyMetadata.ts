export type CompanyMetadata = {
  type: string;
  employees: string;
  rating?: number;
  source?: "curated" | "linkedin" | "wikidata" | "inferred";
};

const COMPANY_METADATA: Record<string, CompanyMetadata> = {
  "zemoso": { type: "Service Based", employees: "~501-1,000", rating: 4.0 },
  "zemoso technologies": { type: "Service Based", employees: "~501-1,000", rating: 4.0 },
  "alexion": { type: "Product / Biopharma", employees: "~1,001-5,000", rating: 3.8 },
  "alexion pharmaceuticals": { type: "Product / Biopharma", employees: "~1,001-5,000", rating: 3.8 },
  "infinx": { type: "Service Based / Healthcare", employees: "~5,001-10,000", rating: 4.3 },
  "infinx healthcare": { type: "Service Based / Healthcare", employees: "~5,001-10,000", rating: 4.3 },
  "dover": { type: "Product / Industrial Manufacturing", employees: "~24,000+", rating: 3.7 },
  "dover corporation": { type: "Product / Industrial Manufacturing", employees: "~24,000+", rating: 3.7 },
  "pfizer": { type: "Product / Biopharma", employees: "~80,000+", rating: 3.7 },
  "pfizer inc": { type: "Product / Biopharma", employees: "~80,000+", rating: 3.7 },
  "crowdstrike": { type: "Product", employees: "~10,000+", rating: 5.0 },
  "okta": { type: "Product", employees: "~6,000+", rating: 5.0 },
  "morgan stanley": { type: "Banking Technology", employees: "~80,000+", rating: 4.9 },
  "sumo logic": { type: "Product (SaaS)", employees: "~800-1,000", rating: 4.9 },
  "eightfold ai": { type: "Product", employees: "~1,000+", rating: 4.8 },
  "cognite": { type: "Product", employees: "~1,000+", rating: 4.8 },
  "emirates nbd": { type: "Banking Technology", employees: "~30,000+", rating: 4.8 },
  "hycu": { type: "Product", employees: "~200-500", rating: 4.7 },
  "bmc software": { type: "Product", employees: "~6,000-7,000", rating: 4.6 },
  "metropolis technologies": { type: "Product", employees: "Employee count unknown", rating: 4.2 },
  "astreya": { type: "Service Based", employees: "Employee count unknown", rating: 4.0 },
  "ig group": { type: "Product / Fintech", employees: "~2,000+", rating: 4.3 },
  "shuru": { type: "Product / Consumer Platform", employees: "~200-500", rating: 4.0 },
  "innova esi": { type: "Service Based", employees: "~5,000+", rating: 4.0 },
  "ust": { type: "Service Based", employees: "~30,000+", rating: 4.0 },
  "ust global": { type: "Service Based", employees: "~30,000+", rating: 4.0 },
  "version 1": { type: "Service Based", employees: "~3,000+", rating: 4.1 },
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

const dynamicMetadataCache = new Map<string, CompanyMetadata>();
const linkedInMetadataCache = new Map<string, CompanyMetadata | null>();

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

  const inferred = inferCompanyMetadata(normalized);
  const [linkedIn, wikidata] = await Promise.all([
    getLinkedInCompanyMetadata(normalized),
    getWikidataCompanyMetadata(normalized),
  ]);
  const publicMetadata = wikidata ? mergeCompanyMetadata(wikidata, inferred) : inferred;

  return linkedIn ? mergeCompanyMetadata(linkedIn, publicMetadata) : publicMetadata;
}

function mergeCompanyMetadata(primary: CompanyMetadata, fallback: CompanyMetadata): CompanyMetadata {
  const type = primary.type === "Company type unknown" ? fallback.type : primary.type;
  const employees = primary.employees === "Employee count unknown" ? fallback.employees : primary.employees;

  return {
    type,
    employees,
    rating: primary.rating ?? fallback.rating ?? estimateRating(type, employees),
    source: primary.source ?? fallback.source,
  };
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

async function getLinkedInCompanyMetadata(normalizedCompany: string): Promise<CompanyMetadata | undefined> {
  const cached = linkedInMetadataCache.get(normalizedCompany);
  if (cached !== undefined) return cached ?? undefined;

  const slugs = Array.from(
    new Set([
      normalizedCompany.replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      normalizedCompany
        .replace(/\b(private|pvt|limited|ltd|incorporated|inc|corporation|corp)\b/g, "")
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    ]),
  ).filter(Boolean);

  for (const slug of slugs) {
    try {
      const response = await fetch(`https://www.linkedin.com/company/${slug}`, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; JobTrackerCompanyMetadata/1.0)" },
        next: { revalidate: 60 * 60 * 24 * 14 },
        signal: AbortSignal.timeout(6000),
      });
      if (!response.ok) continue;

      const html = await response.text();
      const companyName = extractLinkedInText(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
      if (!isLikelySameCompany(normalizedCompany, companyName)) continue;

      const industry =
        extractLinkedInText(
          html,
          /data-test-id="about-us__industry"[\s\S]*?<dd[^>]*>([\s\S]*?)<\/dd>/i,
        ) ||
        extractLinkedInText(
          html,
          /<h2[^>]*class="[^"]*top-card-layout__headline[^"]*"[^>]*>([\s\S]*?)<\/h2>/i,
        ) ||
        decodeHtmlEntities(
          html.match(
            /\b(IT Services and IT Consulting|Information Technology (?:&amp;|&) Services|Software Development|Pharmaceutical Manufacturing|Hospitals and Health Care|Financial Services)\b/i,
          )?.[1] ?? "",
        );
      const employeeRange = extractLinkedInText(
        html,
        /data-test-id="about-us__size"[\s\S]*?<dd[^>]*>([\s\S]*?)<\/dd>/i,
      ).replace(/\s+employees?\b/i, "");
      const type = inferCompanyTypeFromLabels(normalizedCompany, [industry]);
      const employees = /^\d[\d,]*\s*(?:-|–|to)\s*\d[\d,]*$/i.test(employeeRange)
        ? `~${employeeRange.replace(/\s*(?:–|to)\s*/i, "-")}`
        : /^\d[\d,]*\+$/.test(employeeRange)
          ? `~${employeeRange}`
          : "Employee count unknown";
      if (type === "Company type unknown" && employees === "Employee count unknown") continue;
      const metadata: CompanyMetadata = {
        type,
        employees,
        rating: estimateRating(type, employees),
        source: "linkedin",
      };
      linkedInMetadataCache.set(normalizedCompany, metadata);
      return metadata;
    } catch {
      // Try the next normalized company slug; transient failures are not cached.
    }
  }

  linkedInMetadataCache.set(normalizedCompany, null);
  return undefined;
}

function extractLinkedInText(html: string, pattern: RegExp) {
  return decodeHtmlEntities(html.match(pattern)?.[1] ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function isLikelySameCompany(normalizedCompany: string, publicName: string) {
  const comparable = (value: string) =>
    value
      .toLowerCase()
      .replace(/\b(technologies|technology|software|pharmaceuticals|healthcare|private|pvt|limited|ltd|inc)\b/g, "")
      .replace(/[^a-z0-9]/g, "");
  const expected = comparable(normalizedCompany);
  const actual = comparable(publicName);
  return expected.length >= 3 && actual.length >= 3 && (expected.includes(actual) || actual.includes(expected));
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
    searchUrl.searchParams.set("limit", "5");
    searchUrl.searchParams.set("origin", "*");

    const searchResponse = await fetch(searchUrl, { next: { revalidate: 60 * 60 * 24 * 14 } });
    if (!searchResponse.ok) throw new Error(`Wikidata search failed: ${searchResponse.status}`);

    const searchJson = (await searchResponse.json()) as {
      search?: Array<{ id?: string; description?: string; label?: string }>;
    };
    const candidates = (searchJson.search ?? []).filter((candidate) => Boolean(candidate.id));
    if (candidates.length === 0) {
      return undefined;
    }

    const metadataCandidates = (
      await Promise.all(
        candidates.map(async (candidate): Promise<WikidataMetadataCandidate | undefined> => {
          const entityId = candidate.id;
          if (!entityId) return undefined;

          const entityResponse = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${entityId}.json`, {
            next: { revalidate: 60 * 60 * 24 * 14 },
          });
          if (!entityResponse.ok) return undefined;

          const entityJson = (await entityResponse.json()) as WikidataEntityResponse;
          const entity = entityJson.entities?.[entityId];
          if (!entity) return undefined;

          const employees = formatWikidataEmployees(entity.claims?.P1128?.[0]?.mainsnak?.datavalue?.value?.amount);
          const labels = await getWikidataLabels(getWikidataClaimEntityIds(entity, ["P31", "P452"]));
          const description = `${candidate.label ?? ""} ${candidate.description ?? ""}`.toLowerCase();
          const type = inferCompanyTypeFromLabels(normalizedCompany, [...labels, description]);
          const isCompanyLike =
            labels.some((label) => /\b(company|business|enterprise|corporation|organization|manufacturer)\b/.test(label)) ||
            /\b(company|corporation|manufacturer|technology|software|bank|financial|enterprise|multinational)\b/.test(
              description,
            );

          return {
            metadata: {
              type,
              employees: employees ?? "Employee count unknown",
              rating: estimateRating(type, employees),
              source: "wikidata" as const,
            },
            score:
              (employees ? 8 : 0) +
              (isCompanyLike ? 5 : 0) +
              (/Product|Service Based|Banking Technology/.test(type) ? 2 : 0),
          };
        }),
      )
    )
      .filter((candidate): candidate is WikidataMetadataCandidate => Boolean(candidate))
      .sort((a, b) => b.score - a.score);

    const metadata = metadataCandidates[0]?.metadata;
    if (!metadata) {
      return undefined;
    }

    dynamicMetadataCache.set(normalizedCompany, metadata);
    return metadata;
  } catch {
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

type WikidataMetadataCandidate = {
  metadata: CompanyMetadata;
  score: number;
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
  if (
    /\b(consulting|information technology(?:\s*&\s*|\s+and\s+)?services|information technology consulting|outsourcing|professional services|service provider|it services|managed services|digital transformation|systems integrator)\b/.test(
      text,
    )
  ) {
    return "Service Based";
  }
  if (/\b(software company|software|saas|cloud computing|internet company|e-commerce|computer hardware|product company)\b/.test(text)) {
    return "Product";
  }
  if (/\b(pharmaceutical|biopharma|biotechnology|medical device|drug manufacturer)\b/.test(text)) {
    return "Product / Biopharma";
  }
  if (/\b(healthcare services|health care services|revenue cycle|medical billing|outsourced operations)\b/.test(text)) {
    return "Service Based / Healthcare";
  }
  return inferCompanyMetadata(normalizedCompany).type;
}

function estimateRating(type: string, employees?: string): number {
  if (!employees || employees === "Employee count unknown") {
    if (/Product|Banking Technology/.test(type)) return 4.1;
    if (/Service Based/.test(type)) return 4.0;
    return 4.0;
  }
  if (/Product|Banking Technology/.test(type)) return 4.2;
  if (/Service Based/.test(type)) return 4.0;
  return 4.1;
}

function inferCompanyMetadata(normalizedCompany: string): CompanyMetadata {
  if (/\b(bank|capital|financial|finance|securities|payments|fintech)\b/.test(normalizedCompany)) {
    return { type: "Banking Technology", employees: "Employee count unknown", rating: 4.1, source: "inferred" };
  }

  if (
    /\b(consulting|consultants|services|solutions|systems integrator|infotech|esi|outsourcing|managed services|professional services)\b/.test(
      normalizedCompany,
    )
  ) {
    return { type: "Service Based", employees: "Employee count unknown", rating: 4.0, source: "inferred" };
  }

  if (/\b(pharma|pharmaceutical|biopharma|biotech|therapeutics|medical devices?)\b/.test(normalizedCompany)) {
    return {
      type: "Product / Biopharma",
      employees: "Employee count unknown",
      rating: 4.1,
      source: "inferred",
    };
  }

  return { type: "Company type unknown", employees: "Employee count unknown", rating: 4.0, source: "inferred" };
}
