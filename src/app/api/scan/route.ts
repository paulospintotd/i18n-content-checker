import { detectEnglishSentences } from "@/lib/english-detector";
import { LocaleScanResult, ScanRequest, ScanResponse } from "@/lib/types";
import { buildLocalizedUrl } from "@/lib/url-utils";
import * as cheerio from "cheerio";
import { NextRequest, NextResponse } from "next/server";

const FETCH_TIMEOUT_MS = 15_000;

async function fetchPageText(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) i18n-content-checker/1.0",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script, style, and metadata elements
    $("script, style, noscript, svg, meta, link, head").remove();

    // Extract visible text
    return $("body").text().replace(/\s+/g, " ").trim();
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ScanResponse>> {
  const body: ScanRequest = await request.json();
  const { url, locales, excludedTerms } = body;

  if (!url || !locales?.length) {
    return NextResponse.json(
      { results: [] },
      { status: 400 }
    );
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    return NextResponse.json(
      { results: [] },
      { status: 400 }
    );
  }

  const results: LocaleScanResult[] = await Promise.all(
    locales.map(async (locale): Promise<LocaleScanResult> => {
      const localizedUrl = buildLocalizedUrl(url, locale);

      try {
        const pageText = await fetchPageText(localizedUrl);
        const flagged = detectEnglishSentences(pageText, excludedTerms);

        return {
          locale,
          url: localizedUrl,
          status: flagged.length > 0 ? "english_found" : "clean",
          flaggedSentences: flagged.map((f) => ({
            text: f.text,
            englishWords: f.englishWords,
          })),
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        return {
          locale,
          url: localizedUrl,
          status: "error",
          flaggedSentences: [],
          errorMessage: message,
        };
      }
    })
  );

  return NextResponse.json({ results });
}
