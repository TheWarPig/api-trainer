// ── Shared types ──

export type Difficulty = 'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert';

export interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  requiresAuth?: boolean;
  exampleBody?: string;
}

export interface ValidationParams {
  method: string;
  url: string;
  requestHeaders: Record<string, string>;
  requestBody: unknown;
  statusCode: number;
  responseHeaders: Record<string, string>;
  responseBody: unknown;
}

export interface Level {
  id: number;
  title: string;
  difficulty: Difficulty;
  concept: string;
  description: string;
  task: string;
  hints: string[];
  successMessage: string;
  successCriteria: string;
  validate: (params: ValidationParams) => boolean;
  defaultMethod: string;
  defaultUrl: string;
  defaultHeaders?: { key: string; value: string }[];
  defaultBody?: string;
  endpoints: ApiEndpoint[];
  tip?: string;
  multiStep?: { label: string; done: boolean }[];
}

// ── Validation schema types ──

export type ConditionOperator = 'equals' | 'startsWith' | 'contains' | 'regex' | 'exists' | 'greaterThanOrEqual';

export interface ValidationCondition {
  field:
    | 'method'
    | 'url.pathname'
    | 'url.pathnameRegex'
    | 'url.queryParam'
    | 'requestHeader'
    | 'requestHeaderAbsent'
    | 'statusCode'
    | 'responseBody.isArray'
    | 'responseBody.arrayMinLength'
    | 'responseBody.property'
    | 'responseBody.propertyType'
    | 'responseBody.arrayContains';
  key?: string;         // param/header/property name
  operator?: ConditionOperator;
  value?: string | number | boolean;
}

export type ValidationSchema = ValidationCondition[];

export interface SerializableLevel {
  id: number;
  title: string;
  difficulty: Difficulty;
  concept: string;
  description: string;
  task: string;
  hints: string[];
  successMessage: string;
  successCriteria: string;
  validationRules: ValidationSchema;
  defaultMethod: string;
  defaultUrl: string;
  defaultHeaders?: { key: string; value: string }[];
  defaultBody?: string;
  endpoints: ApiEndpoint[];
  tip?: string;
  multiStep?: { label: string; done: boolean }[];
  isBuiltIn: boolean;
  sortOrder: number;
}
