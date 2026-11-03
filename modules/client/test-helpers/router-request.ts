import { vi } from "vitest";

const NativeRequest = Request;

/** Local UI routes have no loaders/fetches. Node Request rejects jsdom's AbortSignal. */
export const stubRouterRequest = () =>
  vi.stubGlobal(
    "Request",
    class extends NativeRequest {
      constructor(input: RequestInfo | URL, init?: RequestInit) {
        super(input, { ...init, signal: undefined });
      }
    }
  );
