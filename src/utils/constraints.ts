export const ErrorCode = {
  AUTH_EMAIL_ALREADY_EXISTS: "AUTH_EMAIL_ALREADY_EXISTS",
  AUTH_INVALID_TOKEN: "AUTH_INVALID_TOKEN",
  AUTH_USER_NOT_FOUND: "AUTH_USER_NOT_FOUND",
  AUTH_NOT_FOUND: "AUTH_NOT_FOUND",
  AUTH_TOO_MANY_ATTEMPTS: "AUTH_TOO_MANY_ATTEMPTS",
  AUTH_UNAUTHORIZED_ACCESS: "AUTH_UNAUTHORIZED_ACCESS",
  AUTH_TOKEN_NOT_FOUND: "AUTH_TOKEN_NOT_FOUND",
  AUTH_INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",

  ACTION_NOT_ALLOWED: "ACTION_NOT_ALLOWED",
  ACCESS_FORBIDDEN: "ACCESS_FORBIDDEN",
  ACCESS_UNAUTHORIZED: "ACCESS_UNAUTHORIZED",
  BAD_REQUEST: "BAD_REQUEST",
  EMAIL_ALREADY_REGISTERED: "EMAIL_ALREADY_REGISTERED",
  TAXID_ALREADY_REGISTERED: "TAXID_ALREADY_REGISTERED",
  ACCOUNT_NOT_CONFIRMED: "ACCOUNT_NOT_CONFIRMED",

  VALIDATION_ERROR: "VALIDATION_ERROR",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",

  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  VERIFICATION_ERROR: "VERIFICATION_ERROR",

  MAX_LIMIT_ACHIEVED: "MAX_LIMIT_ACHIEVED",
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  // Client error responses
  REDIRECT: 301,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  // Server error responses
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export const QUEUE_NAMES = {
  EMAIL_QUEUE: "email-queue",
} as const;

export const ExitCode = {
  FAILURE: 1,
  SUCCESS: 0,
} as const;

export const RESOURCES = {
  notifications: ["send", "read", "cancel", "schedule", "template"],
  webhooks: ["create", "read", "update", "delete", "manage", "logs"],
  subscribers: ["read", "create", "update", "delete", "segment", "export"],
  analytics: ["read", "export", "advanced"],
  project: ["read", "update", "delete", "admin"],
};

export type ExitCodeType = keyof typeof ExitCode;
export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
export type ErrorCodeType = keyof typeof ErrorCode;
export type QueueNamesType = keyof typeof QUEUE_NAMES;
