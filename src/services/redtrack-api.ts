import { getEnv } from "../config/env.ts";
import { log } from "../utils/logger.ts";

const BASE_URL = "https://api.redtrack.io";

interface FetchOptions {
  method?: string;
  body?: unknown;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export async function fetchWithRetry(
  url: string,
  init: RequestInit = {},
  opts: { maxRetries?: number; retryDelay?: number; timeout?: number } = {},
): Promise<Response> {
  const maxRetries = opts.maxRetries ?? 2;
  const retryDelay = opts.retryDelay ?? 1000;
  const timeout = opts.timeout ?? 30_000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if ((res.status === 429 || res.status >= 500) && attempt < maxRetries) {
        const delay = retryDelay * 2 ** attempt;
        log.warn(`HTTP ${res.status} on attempt ${attempt + 1}, retrying in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      return res;
    } catch (err) {
      clearTimeout(timer);
      if (attempt < maxRetries) {
        const delay = retryDelay * 2 ** attempt;
        log.warn(`Request error on attempt ${attempt + 1}, retrying in ${delay}ms:`, err);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error("fetchWithRetry: exhausted retries");
}

function buildUrl(
  path: string,
  params: Record<string, string | number | boolean | undefined>,
): string {
  const env = getEnv();
  const url = new URL(path, BASE_URL);
  url.searchParams.set("api_key", env.REDTRACK_API_KEY);
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== "") {
      url.searchParams.set(key, String(val));
    }
  }
  return url.toString();
}

async function request<T>(
  method: string,
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
  body?: unknown,
  opts?: FetchOptions,
): Promise<T> {
  const url = buildUrl(path, params);
  const init: RequestInit = { method };
  if (body !== undefined) {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(body);
  }
  const res = await fetchWithRetry(url, init, opts);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

// ── Campaigns ──────────────────────────────────────────────────────

export interface CampaignListParams {
  title?: string;
  ids?: string;
  sources?: string;
  status?: string;
  tags?: string;
  page?: number;
  per?: number;
  time_interval?: string;
  date_from?: string;
  date_to?: string;
  timezone?: string;
  total_stat?: boolean;
}

export function getCampaigns(params: CampaignListParams = {}) {
  return request<unknown>("GET", "/campaigns", params);
}

export function getCampaignsV2(params: CampaignListParams = {}) {
  return request<unknown>("GET", "/campaigns/v2", params);
}

export function getCampaignById(id: string) {
  return request<unknown>("GET", `/campaigns/${id}`);
}

export function updateCampaignStatus(ids: string, status: number) {
  return request<unknown>("PATCH", "/campaigns/status", { ids, status });
}

// ── Logs: Clicks ───────────────────────────────────────────────────

export interface ClickLogParams {
  date_from: string;
  date_to: string;
  time_interval?: string;
  clickid?: string;
  country_code?: string;
  campaign_id?: string;
  source_id?: string;
  offer_id?: string;
  network_id?: string;
  fingerprint?: string;
  page?: number;
  per?: number;
}

export function getClicks(params: ClickLogParams) {
  return request<unknown>("GET", "/tracks", params);
}

// ── Logs: Conversions ──────────────────────────────────────────────

export interface ConversionLogParams {
  date_from: string;
  date_to: string;
  time_interval?: string;
  clickid?: string;
  country_code?: string;
  type?: string;
  type_role?: string;
  campaign_id?: string;
  source_id?: string;
  offer_id?: string;
  network_id?: string;
  fingerprint?: string;
  page?: number;
  per?: number;
}

export function getConversions(params: ConversionLogParams) {
  return request<unknown>("GET", "/conversions", params);
}

// ── Reports ────────────────────────────────────────────────────────

export interface ReportParams {
  group: string;
  date_from: string;
  date_to: string;
  tracks_view?: string;
  timezone?: string;
  time_interval?: string;
  campaign_id?: string;
  source_id?: string;
  offer_id?: string;
  landing_id?: string;
  network_id?: string;
  sub1?: string;
  sub2?: string;
  sub3?: string;
  sub4?: string;
  sub5?: string;
  page?: number;
  per?: number;
}

export function getReport(params: ReportParams) {
  return request<unknown>("GET", "/report", params);
}

// ── Offers ─────────────────────────────────────────────────────────

export interface OfferListParams {
  title?: string;
  ids?: string;
  network_id?: string;
  status?: string;
  page?: number;
  per?: number;
}

export function getOffers(params: OfferListParams = {}) {
  return request<unknown>("GET", "/offers", params);
}

export function getOfferById(id: string) {
  return request<unknown>("GET", `/offers/${id}`);
}

// ── Sources ────────────────────────────────────────────────────────

export function getSources() {
  return request<unknown>("GET", "/sources");
}

export function getSourceById(id: string) {
  return request<unknown>("GET", `/sources/${id}`);
}

// ── Networks ───────────────────────────────────────────────────────

export function getNetworks() {
  return request<unknown>("GET", "/networks");
}

// ── Landings ───────────────────────────────────────────────────────

export function getLandings() {
  return request<unknown>("GET", "/landings");
}

// ── Settings ───────────────────────────────────────────────────────

export function getSettings() {
  return request<unknown>("GET", "/me/settings");
}

// ── Update costs ───────────────────────────────────────────────────

export interface UpdateCostsParams {
  date_from: string;
  date_to: string;
  campaign_id?: string;
  source_id?: string;
}

export function updateCosts(params: UpdateCostsParams) {
  return request<unknown>("POST", "/tracks/cost", params);
}
