export type RequestType = "light" | "moderate" | "heavy";

export interface TypeMetrics {
  count: number;
  success: number;
  failed: number;
  totalTime: number;
}

export interface SimMetrics {
  total: number;
  success: number;
  failed: number;
  types: Record<RequestType, TypeMetrics>;
}

export interface TimelinePoint {
  t: number;
  label: string;
  rps: number;
  avgResponse: number;
  successRate: number;
  errorRate: number;
}

export interface ServerPoint {
  t: number;
  label: string;
  cpu: number;
  ram: number;
}

export interface SimSettings {
  rps: number;
  variation: number;
  durationSec: number;
  apiBase: string;
}

export const DEFAULT_SETTINGS: SimSettings = {
  rps: 20,
  variation: 0.1,
  durationSec: 30,
  apiBase: "http://localhost:5000/api/analytics",
};

export const ENDPOINTS: Record<RequestType, string[]> = {
  light: ["/light/overview", "/light/revenue"],
  moderate: ["/moderate/revenue-by-state", "/moderate/top-products"],
  heavy: ["/heavy/deep-insights"],
};

export function emptyMetrics(): SimMetrics {
  return {
    total: 0,
    success: 0,
    failed: 0,
    types: {
      light: { count: 0, success: 0, failed: 0, totalTime: 0 },
      moderate: { count: 0, success: 0, failed: 0, totalTime: 0 },
      heavy: { count: 0, success: 0, failed: 0, totalTime: 0 },
    },
  };
}

export function pickEndpoint(variation: number): { type: RequestType; endpoint: string } {
  const lightWeight = 0.6 - variation * 0.3;
  const moderateWeight = 0.3;
  const rand = Math.random();
  if (rand < lightWeight) {
    const ep = ENDPOINTS.light[Math.floor(Math.random() * ENDPOINTS.light.length)];
    return { type: "light", endpoint: ep };
  } else if (rand < lightWeight + moderateWeight) {
    const ep = ENDPOINTS.moderate[Math.floor(Math.random() * ENDPOINTS.moderate.length)];
    return { type: "moderate", endpoint: ep };
  } else {
    return { type: "heavy", endpoint: ENDPOINTS.heavy[0] };
  }
}
