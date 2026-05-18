/**
 * Cache — a Laravel-inspired cache utility for Next.js / TypeScript.
 *
 * Supports three drivers:
 *   • "memory"       — in-process Map (server & client, resets on page load)
 *   • "localStorage" — browser localStorage (client only, survives reloads)
 *   • "cookie"       — document.cookie (client only, sent to server on requests)
 *
 * Usage mirrors Laravel's Cache facade:
 *
 *   Cache.put("key", value, 60);          // store for 60 seconds
 *   Cache.get("key");                     // retrieve (null if missing/expired)
 *   Cache.get("key", "default");          // retrieve with fallback
 *   Cache.remember("key", 60, fn);        // get or compute + store
 *   Cache.rememberForever("key", fn);     // get or compute + store forever
 *   Cache.has("key");                     // boolean existence check
 *   Cache.forget("key");                  // delete a key
 *   Cache.flush();                        // wipe everything
 *   Cache.pull("key");                    // get then delete
 *   Cache.increment("key", 1);            // atomic increment
 *   Cache.decrement("key", 1);            // atomic decrement
 *   Cache.tags(["users"]).put(…)          // tag-based grouping
 *   Cache.tags(["users"]).flush()         // flush all keys in a tag
 *   Cache.driver("localStorage").get(…)  // use a specific driver for one call
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type CacheDriver = "memory" | "localStorage" | "cookie";

interface CacheEntry<T = unknown> {
  value: T;
  /** Unix timestamp (ms) when this entry expires, or null for forever */
  expiresAt: number | null;
  /** Tags this entry belongs to */
  tags: string[];
}

// ─── Storage drivers ──────────────────────────────────────────────────────────

interface IStore {
  get(key: string): string | null;
  set(key: string, value: string, ttlSeconds?: number): void;
  delete(key: string): void;
  keys(): string[];
  clear(): void;
}

// In-process memory store (Map)
class MemoryStore implements IStore {
  private store = new Map<string, string>();

  get(key: string) {
    return this.store.get(key) ?? null;
  }
  set(key: string, value: string) {
    this.store.set(key, value);
  }
  delete(key: string) {
    this.store.delete(key);
  }
  keys() {
    return [...this.store.keys()];
  }
  clear() {
    this.store.clear();
  }
}

// Browser localStorage store
class LocalStorageStore implements IStore {
  private prefix = "__cache__:";

  private isAvailable() {
    return typeof window !== "undefined" && typeof localStorage !== "undefined";
  }

  get(key: string) {
    if (!this.isAvailable()) return null;
    return localStorage.getItem(this.prefix + key);
  }
  set(key: string, value: string) {
    if (!this.isAvailable()) return;
    localStorage.setItem(this.prefix + key, value);
  }
  delete(key: string) {
    if (!this.isAvailable()) return;
    localStorage.removeItem(this.prefix + key);
  }
  keys() {
    if (!this.isAvailable()) return [];
    const out: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(this.prefix)) out.push(k.slice(this.prefix.length));
    }
    return out;
  }
  clear() {
    if (!this.isAvailable()) return;
    this.keys().forEach((k) => localStorage.removeItem(this.prefix + k));
  }
}

// document.cookie store (client only)
class CookieStore implements IStore {
  private prefix = "__cache__:";

  private isAvailable() {
    return typeof document !== "undefined";
  }

  get(key: string) {
    if (!this.isAvailable()) return null;
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${encodeURIComponent(this.prefix + key)}=([^;]*)`)
    );
    return match ? decodeURIComponent(match[1]) : null;
  }

  set(key: string, value: string, ttlSeconds = 0) {
    if (!this.isAvailable()) return;
    const expires =
      ttlSeconds > 0
        ? `; expires=${new Date(Date.now() + ttlSeconds * 1000).toUTCString()}`
        : "";
    document.cookie = `${encodeURIComponent(this.prefix + key)}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax`;
  }

  delete(key: string) {
    if (!this.isAvailable()) return;
    document.cookie = `${encodeURIComponent(this.prefix + key)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }

  keys() {
    if (!this.isAvailable()) return [];
    return document.cookie
      .split("; ")
      .map((c) => c.split("=")[0])
      .filter((k) => decodeURIComponent(k).startsWith(this.prefix))
      .map((k) => decodeURIComponent(k).slice(this.prefix.length));
  }

  clear() {
    this.keys().forEach((k) => this.delete(k));
  }
}

// ─── Tag-scoped cache builder ─────────────────────────────────────────────────

export class TaggedCache {
  constructor(
    private readonly tags: string[],
    private readonly repository: CacheRepository
  ) {}

  put<T>(key: string, value: T, ttlSeconds?: number): void {
    this.repository.putTagged(key, value, this.tags, ttlSeconds);
  }

  get<T>(key: string, defaultValue?: T): T | null {
    return this.repository.get<T>(key, defaultValue);
  }

  has(key: string): boolean {
    return this.repository.has(key);
  }

  forget(key: string): void {
    this.repository.forget(key);
  }

  /** Remove every key that belongs to ALL of this tag set */
  flush(): void {
    this.repository.flushTags(this.tags);
  }

  async remember<T>(
    key: string,
    ttlSeconds: number,
    callback: () => T | Promise<T>
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;
    const value = await callback();
    this.put(key, value, ttlSeconds);
    return value;
  }

  async rememberForever<T>(
    key: string,
    callback: () => T | Promise<T>
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;
    const value = await callback();
    this.put(key, value);
    return value;
  }
}

// ─── Core repository ──────────────────────────────────────────────────────────

export class CacheRepository {
  private store: IStore;

  constructor(driver: CacheDriver = "memory") {
    this.store = CacheRepository.makeStore(driver);
  }

  private static makeStore(driver: CacheDriver): IStore {
    if (driver === "localStorage") return new LocalStorageStore();
    if (driver === "cookie") return new CookieStore();
    return new MemoryStore();
  }

  // ── Internal serialisation ────────────────────────────────────────────────

  private serialize<T>(entry: CacheEntry<T>): string {
    return JSON.stringify(entry);
  }

  private deserialize<T>(raw: string): CacheEntry<T> | null {
    try {
      return JSON.parse(raw) as CacheEntry<T>;
    } catch {
      return null;
    }
  }

  private read<T>(key: string): CacheEntry<T> | null {
    const raw = this.store.get(key);
    if (!raw) return null;
    const entry = this.deserialize<T>(raw);
    if (!entry) return null;
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry;
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Store a value. `ttlSeconds` omitted or 0 = store forever.
   */
  put<T>(key: string, value: T, ttlSeconds?: number): void {
    this.putTagged(key, value, [], ttlSeconds);
  }

  /** @internal used by TaggedCache */
  putTagged<T>(
    key: string,
    value: T,
    tags: string[],
    ttlSeconds?: number
  ): void {
    const expiresAt =
      ttlSeconds && ttlSeconds > 0
        ? Date.now() + ttlSeconds * 1000
        : null;
    const entry: CacheEntry<T> = { value, expiresAt, tags };
    this.store.set(key, this.serialize(entry), ttlSeconds);
  }

  /**
   * Retrieve a value, or `defaultValue` (null) if missing / expired.
   */
  get<T>(key: string, defaultValue: T | null = null): T | null {
    return this.read<T>(key)?.value ?? defaultValue;
  }

  /**
   * Check if a non-expired entry exists.
   */
  has(key: string): boolean {
    return this.read(key) !== null;
  }

  /**
   * Remove a single key.
   */
  forget(key: string): void {
    this.store.delete(key);
  }

  /**
   * Retrieve a value then immediately remove it.
   */
  pull<T>(key: string, defaultValue: T | null = null): T | null {
    const value = this.get<T>(key, defaultValue);
    this.forget(key);
    return value;
  }

  /**
   * Remove all cache entries (for this driver).
   */
  flush(): void {
    this.store.clear();
  }

  /**
   * Atomically increment a numeric cache entry.
   * Creates the key with value `amount` if it doesn't exist.
   */
  increment(key: string, amount = 1): number {
    const current = this.get<number>(key) ?? 0;
    const next = current + amount;
    const entry = this.read<number>(key);
    const remaining = entry?.expiresAt
      ? Math.max(0, Math.ceil((entry.expiresAt - Date.now()) / 1000))
      : undefined;
    this.put(key, next, remaining);
    return next;
  }

  /**
   * Atomically decrement a numeric cache entry.
   */
  decrement(key: string, amount = 1): number {
    return this.increment(key, -amount);
  }

  /**
   * Store the value forever (no expiry).
   */
  forever<T>(key: string, value: T): void {
    this.put(key, value);
  }

  /**
   * Get or compute + store. Callback is only called on a cache miss.
   */
  async remember<T>(
    key: string,
    ttlSeconds: number,
    callback: () => T | Promise<T>
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;
    const value = await callback();
    this.put(key, value, ttlSeconds);
    return value;
  }

  /**
   * Get or compute + store forever.
   */
  async rememberForever<T>(
    key: string,
    callback: () => T | Promise<T>
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;
    const value = await callback();
    this.forever(key, value);
    return value;
  }

  /**
   * Add a value only if the key does not already exist.
   * Returns true if stored, false if already present.
   */
  add<T>(key: string, value: T, ttlSeconds?: number): boolean {
    if (this.has(key)) return false;
    this.put(key, value, ttlSeconds);
    return true;
  }

  /**
   * Return all non-expired keys (expensive on large caches).
   */
  keys(): string[] {
    return this.store.keys().filter((k) => this.has(k));
  }

  /**
   * Flush all entries whose tag list contains ALL of the given tags.
   * @internal used by TaggedCache
   */
  flushTags(tags: string[]): void {
    this.store.keys().forEach((key) => {
      const raw = this.store.get(key);
      if (!raw) return;
      const entry = this.deserialize(raw);
      if (!entry) return;
      const hasAll = tags.every((t) => entry.tags.includes(t));
      if (hasAll) this.store.delete(key);
    });
  }

  /**
   * Switch to a different driver for a single chain.
   *
   * @example
   *   Cache.driver("localStorage").put("theme", "dark", 3600);
   */
  driver(d: CacheDriver): CacheRepository {
    return new CacheRepository(d);
  }

  /**
   * Return a TaggedCache scoped to the given tags.
   *
   * @example
   *   Cache.tags(["users", "profile"]).put("user:1", userData, 300);
   *   Cache.tags(["users"]).flush(); // removes all keys tagged "users"
   */
  tags(tags: string[]): TaggedCache {
    return new TaggedCache(tags, this);
  }
}

// ─── Singleton facade ─────────────────────────────────────────────────────────

/**
 * Drop-in singleton — mirrors Laravel's Cache facade.
 *
 * Default driver is "memory" (works on both server and client).
 * Override via Cache.setDefaultDriver() once at app bootstrap.
 */
class CacheFacade {
  private _default: CacheDriver = "memory";
  private _repos = new Map<CacheDriver, CacheRepository>();

  private repo(d?: CacheDriver): CacheRepository {
    const key = d ?? this._default;
    if (!this._repos.has(key)) {
      this._repos.set(key, new CacheRepository(key));
    }
    return this._repos.get(key)!;
  }

  setDefaultDriver(d: CacheDriver): this {
    this._default = d;
    return this;
  }

  driver(d: CacheDriver): CacheRepository {
    return this.repo(d);
  }

  tags(tags: string[]): TaggedCache {
    return this.repo().tags(tags);
  }

  put<T>(key: string, value: T, ttlSeconds?: number): void {
    this.repo().put(key, value, ttlSeconds);
  }

  forever<T>(key: string, value: T): void {
    this.repo().forever(key, value);
  }

  get<T>(key: string, defaultValue?: T): T | null {
    return this.repo().get(key, defaultValue ?? null);
  }

  has(key: string): boolean {
    return this.repo().has(key);
  }

  forget(key: string): void {
    this.repo().forget(key);
  }

  pull<T>(key: string, defaultValue?: T): T | null {
    return this.repo().pull(key, defaultValue ?? null);
  }

  flush(): void {
    this.repo().flush();
  }

  increment(key: string, amount = 1): number {
    return this.repo().increment(key, amount);
  }

  decrement(key: string, amount = 1): number {
    return this.repo().decrement(key, amount);
  }

  add<T>(key: string, value: T, ttlSeconds?: number): boolean {
    return this.repo().add(key, value, ttlSeconds);
  }

  keys(): string[] {
    return this.repo().keys();
  }

  remember<T>(
    key: string,
    ttlSeconds: number,
    callback: () => T | Promise<T>
  ): Promise<T> {
    return this.repo().remember(key, ttlSeconds, callback);
  }

  rememberForever<T>(
    key: string,
    callback: () => T | Promise<T>
  ): Promise<T> {
    return this.repo().rememberForever(key, callback);
  }
}

export const Cache = new CacheFacade();