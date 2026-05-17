export  interface IHttpResponse<T> {
    data: T | null;
    message: string;
    statusCode: number;
    errors: Record<string, string[]> | null;
}



export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export type RequestInterceptor = (init: RequestInit, url: string) => RequestInit | Promise<RequestInit>;
export type ResponseInterceptor = (response: Response) => void | Promise<void>;

export interface RetryConfig {
    maxAttempts?: number;
    baseDelayMs?: number;
    retryOn?: number[];
}

export interface HttpClientConfig {
    baseUrl?: string;
    headers?: Record<string, string>;
    credentials?: RequestCredentials;
    timeoutMs?: number;
    retry?: RetryConfig;
    requestInterceptors?: RequestInterceptor[];
    responseInterceptors?: ResponseInterceptor[];
}