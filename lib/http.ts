
// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces (for HTTP only)
// ─────────────────────────────────────────────────────────────────────────────

import { Auth } from "./auth";
import { HttpClientConfig, HttpMethod, IHttpResponse, QueryParams, RequestInterceptor, ResponseInterceptor, RetryConfig } from "./types/http.types";


const DEFAULT_RETRY_ON = [429, 502, 503, 504];

function joinUrl(base: string, endpoint: string): string {
    if (!base) return endpoint;
    return `${base.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildQuery(params: QueryParams): string {
    const entries = Object.entries(params).filter(
        ([, v]) => v !== null && v !== undefined
    ) as [string, string | number | boolean][];
    return new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

// ─────────────────────────────────────────────────────────────────────────────
// HttpClient
// ─────────────────────────────────────────────────────────────────────────────

export class HttpError extends Error {
    public readonly statusCode: number;
    public readonly errors: Record<string, string[]> | null;
    public readonly response: IHttpResponse<unknown>;

    constructor(response: IHttpResponse<unknown>) {
        super(response.message);
        this.name = "HttpError";
        this.statusCode = response.statusCode;
        this.errors = response.errors;
        this.response = response;
    }
}

export class HttpClient {
    private readonly config: Required<HttpClientConfig>;

    constructor(config: HttpClientConfig = {}) {
        this.config = {
            baseUrl: config.baseUrl ?? "",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                ...(config.headers ?? {}),
            },
            credentials: config.credentials ?? "same-origin",
            timeoutMs: config.timeoutMs ?? 0,
            retry: {
                maxAttempts: config.retry?.maxAttempts ?? 0,
                baseDelayMs: config.retry?.baseDelayMs ?? 300,
                retryOn: config.retry?.retryOn ?? DEFAULT_RETRY_ON,
            },
            requestInterceptors: config.requestInterceptors ?? [],
            responseInterceptors: config.responseInterceptors ?? [],
        };
    }

    // ── Immutable builder methods ──────────────────────────────────────────

    public withBaseUrl(url: string): HttpClient {
        return this.clone({ baseUrl: url });
    }

    public withCredentials(mode: RequestCredentials = "include"): HttpClient {
        return this.clone({ credentials: mode });
    }

    public withHeaders(headers: Record<string, string>): HttpClient {
        return this.clone({ headers: { ...this.config.headers, ...headers } });
    }

    public withToken(token: string, type = "Bearer"): HttpClient {
        return this.withHeaders({ Authorization: `${type} ${token}` });
    }

    public withTimeout(ms: number): HttpClient {
        return this.clone({ timeoutMs: ms });
    }

    public withRetry(retry: RetryConfig): HttpClient {
        return this.clone({ retry: { ...this.config.retry, ...retry } });
    }

    /**
     * Append a request interceptor. Interceptors run in insertion order.
     * Each interceptor receives the RequestInit and can return a modified copy.
     */
    public addRequestInterceptor(interceptor: RequestInterceptor): HttpClient {
        return this.clone({
            requestInterceptors: [...this.config.requestInterceptors, interceptor],
        });
    }

    /**
     * Append a response interceptor. Runs before JSON parsing.
     * Throw inside the interceptor to convert a response into an error.
     */
    public addResponseInterceptor(interceptor: ResponseInterceptor): HttpClient {
        return this.clone({
            responseInterceptors: [...this.config.responseInterceptors, interceptor],
        });
    }

    // ── HTTP verbs ─────────────────────────────────────────────────────────

    public get<T = unknown>(
        url: string,
        params?: QueryParams,
        signal?: AbortSignal
    ): Promise<IHttpResponse<T>> {
        const finalUrl = params ? `${url}?${buildQuery(params)}` : url;
        return this.request<T>(finalUrl, "GET", undefined, signal);
    }

    public post<T = unknown>(url: string, data?: unknown, signal?: AbortSignal): Promise<IHttpResponse<T>> {
        return this.request<T>(url, "POST", data, signal);
    }

    public put<T = unknown>(url: string, data?: unknown, signal?: AbortSignal): Promise<IHttpResponse<T>> {
        return this.request<T>(url, "PUT", data, signal);
    }

    public patch<T = unknown>(url: string, data?: unknown, signal?: AbortSignal): Promise<IHttpResponse<T>> {
        return this.request<T>(url, "PATCH", data, signal);
    }

    public delete<T = unknown>(url: string, signal?: AbortSignal): Promise<IHttpResponse<T>> {
        return this.request<T>(url, "DELETE", undefined, signal);
    }

    // ── Core request logic ─────────────────────────────────────────────────

    private async request<T>(
        endpoint: string,
        method: HttpMethod,
        data?: unknown,
        callerSignal?: AbortSignal
    ): Promise<IHttpResponse<T>> {
        const { maxAttempts = 0, baseDelayMs = 300, retryOn = DEFAULT_RETRY_ON } = this.config.retry;
        const totalAttempts = Math.max(1, maxAttempts + 1);

        for (let attempt = 0; attempt < totalAttempts; attempt++) {
            if (attempt > 0) {
                await sleep(baseDelayMs * 2 ** (attempt - 1)); // exponential backoff
            }

            const result = await this.attempt<T>(endpoint, method, data, callerSignal);

            const shouldRetry =
                attempt < totalAttempts - 1 &&
                retryOn.includes(result.statusCode);

            if (!shouldRetry) return result;
        }

        // Unreachable, but satisfies TypeScript
        return this.formatResponse<T>(null, "Request failed after retries.", 500, null, false);
    }

    private async attempt<T>(
        endpoint: string,
        method: HttpMethod,
        data?: unknown,
        callerSignal?: AbortSignal
    ): Promise<IHttpResponse<T>> {
        try {
            const url = joinUrl(this.config.baseUrl, endpoint);

            // Build a combined AbortSignal from the caller's signal + optional timeout
            const signal = this.buildSignal(callerSignal);

            let init: RequestInit = {
                method,
                headers: { ...this.config.headers },
                credentials: this.config.credentials,
                signal,
            };

            // Attach body
            if (data !== undefined && method !== "GET") {
                if (data instanceof FormData) {
                    // Let the browser set Content-Type with the multipart boundary
                    delete (init.headers as Record<string, string>)["Content-Type"];
                    init.body = data;
                } else {
                    init.body = JSON.stringify(data);
                }
            }

            // Run request interceptors
            for (const interceptor of this.config.requestInterceptors) {
                init = await interceptor(init, url);
            }

            const response = await fetch(url, init);

            // Run response interceptors (e.g. global 401/419 handling)
            for (const interceptor of this.config.responseInterceptors) {
                await interceptor(response.clone());
            }

            return this.parseResponse<T>(response);

        } catch (error: unknown) {
            console.error(error)
            if (error instanceof DOMException && error.name === "AbortError") {
                return this.formatResponse<T>(null, "Request was cancelled.", 499, null, false);
            }
            const message = error instanceof Error ? error.message : "An unexpected network error occurred.";
            return this.formatResponse<T>(null, message, 0, null, false);
        }
    }

    private async parseResponse<T>(response: Response): Promise<IHttpResponse<T>> {
        // No Content — nothing to parse
        if (response.status === 204) {
            return this.formatResponse<T>(null, "Request successful.", 204, null, true);
        }

        const result: Record<string, unknown> = await response.json().catch(() => ({}));

        if (!response.ok) {
            const message = typeof result.message === "string"
                ? result.message
                : "An error occurred while making the request.";
            const errors = (result.errors as Record<string, string[]>) ?? null;
            return this.formatResponse<T>(null, message, response.status, errors, false);
        }

        const message = typeof result.message === "string" ? result.message : "Request successful.";
        return this.formatResponse<T>(result.data as T, message, response.status, null, true);
    }

    // ── Utilities ──────────────────────────────────────────────────────────

    /**
     * Merge the caller's AbortSignal with an optional internal timeout signal.
     * Returns undefined when neither is needed.
     */
    private buildSignal(callerSignal?: AbortSignal): AbortSignal | undefined {
        const { timeoutMs } = this.config;

        if (!callerSignal && !timeoutMs) return undefined;

        const signals: AbortSignal[] = [];
        if (callerSignal) signals.push(callerSignal);
        if (timeoutMs) signals.push(AbortSignal.timeout(timeoutMs));

        // AbortSignal.any() is available in modern environments
        if (typeof AbortSignal.any === "function") {
            return AbortSignal.any(signals);
        }

        // Fallback: manually chain signals
        const controller = new AbortController();
        for (const sig of signals) {
            if (sig.aborted) { controller.abort(sig.reason); break; }
            sig.addEventListener("abort", () => controller.abort(sig.reason), { once: true });
        }
        return controller.signal;
    }

    private clone(overrides: Partial<HttpClientConfig>): HttpClient {
        return new HttpClient({ ...this.config, ...overrides });
    }

    private formatResponse<T>(
        data: T | null,
        message: string,
        statusCode: number,
        errors: Record<string, string[]> | null = null,
        ok:boolean = false
    ): IHttpResponse<T> {
        return { data, message, statusCode, errors, ok };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Example Setup
// ─────────────────────────────────────────────────────────────────────────────

export const HTTPS = new HttpClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
    timeoutMs: 60_000,
    retry: {
        maxAttempts: 2,
        baseDelayMs: 300,
    },
})
    .addRequestInterceptor((init, url) => {
        const token = Auth.token();
        if (token) {
            init.headers = {
                ...init.headers,
                Authorization: `Bearer ${token}`,
            };
        }
        return init;
    })
    .addResponseInterceptor((response) => {
        
        if (response.status === 401) {
            console.warn("Session expired. Redirecting to login…");
            // window.location.href = "/login";
        }
        if (response.status === 400) {
            console.log("Error occurred in backend")
        }
        if (response.status === 419) {
            console.warn("CSRF token mismatch. Refreshing…");
            // window.location.reload();
        }
        
    });

// ─────────────────────────────────────────────────────────────────────────────
// Usage Examples
// ─────────────────────────────────────────────────────────────────────────────

// 1. Simple GET with typed response
// const { data, statusCode } = await HTTPS.get<User>("/users/1");

// 2. POST with auth token (immutable — HTTPS instance is unchanged)
// const authed = HTTPS.withToken(myJwt);
// await authed.post<CreatePostResponse>("/posts", { title: "Hello" });

// 3. File upload (FormData → Content-Type auto-set by browser)
// const form = new FormData();
// form.append("avatar", file);
// await HTTPS.post("/users/avatar", form);

// 4. Cancellable request
// const controller = new AbortController();
// await HTTPS.get("/slow-endpoint", undefined, controller.signal);
// controller.abort();

// 5. Per-request timeout override
// await HTTPS.withTimeout(5_000).get("/time-sensitive");

// 6. Throw on error (use HttpError for typed catch)
// try {
//     const res = await HTTPS.post("/login", creds);
//     if (!res.data) throw new HttpError(res);
// } catch (e) {
//     if (e instanceof HttpError && e.statusCode === 422) {
//         showValidationErrors(e.errors);
//     }
// }