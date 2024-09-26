import { CookieSerializeOptions } from "cookie";
import { isDestroyed, isNew, isTouched } from "./symbol";

export type SessionRecord = Record<string, any>;

export type SessionData<T = SessionRecord> = {
  cookie: Cookie;
} & T;

export type Session<T extends SessionRecord = SessionRecord> = {
  id: string;
  touch(): void;
  commit(): Promise<void>;
  destroy(): Promise<void>;
  [isNew]?: boolean;
  [isTouched]?: boolean;
  [isDestroyed]?: boolean;
} & SessionData<T>;

type Cookie = {
  httpOnly: boolean;
  path: string;
  domain?: string | undefined;
  secure: boolean;
  sameSite?: boolean | "lax" | "strict" | "none";
} & (
  | { maxAge?: undefined; expires?: undefined }
  | {
      maxAge: number;
      expires: Date;
    }
);

/**
 * Cookie types taken from https://github.com/vvo/iron-session
 */

/**
 * {@link https://wicg.github.io/cookie-store/#dictdef-cookielistitem CookieListItem}
 * as specified by W3C.
 */
interface CookieListItem
  extends Pick<
    CookieSerializeOptions,
    "domain" | "path" | "sameSite" | "secure"
  > {
  /** A string with the name of a cookie. */
  name: string;
  /** A string containing the value of the cookie. */
  value: string;
  /** A number of milliseconds or Date interface containing the expires of the cookie. */
  expires?: CookieSerializeOptions["expires"] | number;
}

/**
 * Superset of {@link CookieListItem} extending it with
 * the `httpOnly`, `maxAge` and  properties.
 */
type ResponseCookie = CookieListItem &
  Pick<CookieSerializeOptions, "httpOnly" | "maxAge">;

export interface CookieStore {
  get: (name: string) => { name: string; value: string } | undefined;
  set: {
    (name: string, value: string, cookie?: Partial<ResponseCookie>): void;
    (options: ResponseCookie): void;
  };
}

export interface SessionStore {
  get(sid: string): Promise<SessionData | null | undefined>;
  set(sid: string, sess: SessionData): Promise<void>;
  destroy(sid: string): Promise<void>;
  touch?(sid: string, sess: SessionData): Promise<void>;
}

export interface Options {
  name?: string;
  store?: SessionStore;
  genid?: () => string;
  encode?: (rawSid: string) => string;
  decode?: (encryptedSid: string) => string | null;
  touchAfter?: number;
  cookie?: Partial<
    Pick<
      Cookie,
      "maxAge" | "httpOnly" | "path" | "domain" | "secure" | "sameSite"
    >
  >;
  autoCommit?: boolean;
}
