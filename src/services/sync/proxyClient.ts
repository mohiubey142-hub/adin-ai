// src/services/sync/proxyClient.ts
// ============================================
// The ONLY way the browser talks to the cloud: our own backend proxy (/api/sync).
// The Apps Script URL and its shared secret are server-side env vars now —
// nothing secret is bundled into the frontend any more.
// Contact / feedback forms can use postToSyncProxy() too.
// ============================================

import { SYNC_CONFIG } from './config';

const KEEPALIVE_MAX_BYTES = 60000;
const JSON_CONTENT_TYPE = 'application/json';

export interface ProxyCallOptions {
  keepalive?: boolean;
}

export interface ProxyHttpResult {
  httpOk: boolean;
  status: number;
  json: any;
}

export async function postToSyncProxy(
  action: string,
  payload: Record<string, any>,
  options: ProxyCallOptions = {},
): Promise<ProxyHttpResult> {
  const body = JSON.stringify({ action, payload, clientTimestamp: Date.now() });

  const res = await fetch(SYNC_CONFIG.proxyPath, {
    method: 'POST',
    headers: { 'Content-Type': JSON_CONTENT_TYPE },
    body,
    keepalive: options.keepalive === true && body.length < KEEPALIVE_MAX_BYTES,
  });

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  return { httpOk: res.ok, status: res.status, json };
}
