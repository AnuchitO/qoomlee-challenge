import { ok, err, type Result } from "@/lib/result/types";
import { HttpError } from "./errors";
import { logger } from "@/lib/logger/logger";

export async function getJson<T>(url: string, init?: RequestInit): Promise<Result<T, HttpError>> {
  try {
    const res = await fetch(url, { cache: "no-store", ...init });

    if (!res.ok) {
      const message = `API responded with status ${res.status}`;
      logger.error(`httpClient: GET ${url} - ${message}`, { url, status: res.status });
      return err(HttpError.badStatus(res.status, message));
    }

    const data = (await res.json()) as T;
    return ok(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    logger.error(`httpClient: GET ${url} - network error`, { url, error: e });
    return err(HttpError.networkError(message));
  }
}

export async function postJson<T>(
  url: string,
  body: unknown,
  init?: RequestInit,
): Promise<Result<T, HttpError>> {
  try {
    const res = await fetch(url, {
      ...init,
      method: "POST",
      headers: { "Content-Type": "application/json", ...init?.headers },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const message = `API responded with status ${res.status}`;
      logger.error(`httpClient: POST ${url} - ${message}`, { url, status: res.status });
      return err(HttpError.badStatus(res.status, message));
    }

    const data = (await res.json()) as T;
    return ok(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    logger.error(`httpClient: POST ${url} - network error`, { url, error: e });
    return err(HttpError.networkError(message));
  }
}
