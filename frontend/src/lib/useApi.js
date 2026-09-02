/** Data-fetching hooks shared by the dashboard panels. */

import { useCallback, useEffect, useState } from "react";
import { fetchOrFallback } from "./api";

/**
 * Fetch on mount and whenever the request changes, with the offline mirror as a
 * safety net. Previous data stays on screen while a new request is in flight, so
 * charts do not flash empty when a filter changes.
 *
 * Returns { data, loading, error, source, refresh }.
 */
export function useApi(key, path, { args, poll = 0, enabled = true } = {}) {
  const [state, setState] = useState({ data: null, loading: true, error: null, source: null });
  const [nonce, setNonce] = useState(0);
  const argsKey = JSON.stringify(args ?? null);

  useEffect(() => {
    if (!enabled) return undefined;
    let alive = true;

    const run = async () => {
      try {
        const { data, source } = await fetchOrFallback(key, path, { args: JSON.parse(argsKey) });
        if (alive) setState({ data, loading: false, error: null, source });
      } catch (err) {
        if (alive) setState({ data: null, loading: false, error: err.message, source: null });
      }
    };

    run();
    const id = poll ? setInterval(run, poll) : null;

    return () => {
      alive = false;
      if (id) clearInterval(id);
    };
  }, [key, path, argsKey, enabled, poll, nonce]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);
  return { ...state, refresh };
}

/**
 * POST-driven calculator hook — used by the voyage optimiser and the landed
 * cost model, both of which recompute as the operator edits inputs.
 */
export function useCompute(key, path, body, { debounce = 260 } = {}) {
  const [state, setState] = useState({ data: null, loading: true, error: null, source: null });
  const bodyKey = JSON.stringify(body);

  useEffect(() => {
    let alive = true;
    const timer = setTimeout(async () => {
      try {
        const { data, source } = await fetchOrFallback(key, path, {
          method: "POST", body: JSON.parse(bodyKey),
        });
        if (alive) setState({ data, loading: false, error: null, source });
      } catch (err) {
        if (alive) setState({ data: null, loading: false, error: err.message, source: null });
      }
    }, debounce);

    return () => { alive = false; clearTimeout(timer); };
  }, [key, path, bodyKey, debounce]);

  return state;
}

/** Backend liveness probe for the header badge. */
export function useHealth(intervalMs = 20000) {
  const [health, setHealth] = useState({ online: null, detail: "Checking…" });

  useEffect(() => {
    let alive = true;

    const probe = async () => {
      try {
        const { data, source } = await fetchOrFallback("__health", "/api/health");
        if (alive) setHealth({ online: source === "live", detail: data?.database?.detail || "" });
      } catch {
        if (alive) setHealth({ online: false, detail: "Backend unreachable — showing demo data" });
      }
    };

    probe();
    const id = setInterval(probe, intervalMs);
    return () => { alive = false; clearInterval(id); };
  }, [intervalMs]);

  return health;
}
