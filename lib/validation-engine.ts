import type { ValidationSchema, ValidationParams, ValidationCondition } from './types';

function getHeader(headers: Record<string, string>, name: string): string | undefined {
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === lower) return v;
  }
  return undefined;
}

function evaluateCondition(cond: ValidationCondition, params: ValidationParams): boolean {
  const { method, url, requestHeaders, statusCode, responseBody } = params;
  const parsed = new URL(url, 'http://x');

  switch (cond.field) {
    case 'method':
      return method === cond.value;

    case 'url.pathname':
      return parsed.pathname === cond.value;

    case 'url.pathnameRegex':
      return new RegExp(cond.value as string).test(parsed.pathname);

    case 'url.queryParam': {
      const paramVal = parsed.searchParams.get(cond.key!);
      if (cond.operator === 'exists') return paramVal !== null;
      return paramVal === String(cond.value);
    }

    case 'requestHeader': {
      const hVal = getHeader(requestHeaders, cond.key!);
      if (hVal === undefined) return false;
      const target = String(cond.value);
      switch (cond.operator) {
        case 'equals':     return hVal === target;
        case 'startsWith': return hVal.startsWith(target);
        case 'contains':   return hVal.includes(target);
        default:           return hVal === target;
      }
    }

    case 'requestHeaderAbsent': {
      const hVal = getHeader(requestHeaders, cond.key!);
      return hVal === undefined || hVal === '';
    }

    case 'statusCode':
      return statusCode === Number(cond.value);

    case 'responseBody.isArray':
      return cond.value ? Array.isArray(responseBody) : !Array.isArray(responseBody);

    case 'responseBody.arrayMinLength':
      return Array.isArray(responseBody) && responseBody.length >= Number(cond.value);

    case 'responseBody.property': {
      const body = responseBody as Record<string, unknown>;
      if (!body || typeof body !== 'object') return false;
      const propVal = body[cond.key!];
      if (cond.operator === 'exists') return propVal !== undefined;
      if (cond.operator === 'contains') return typeof propVal === 'string' && propVal.includes(String(cond.value));
      // equals — handle type coercion
      if (typeof cond.value === 'number') return propVal === cond.value;
      if (typeof cond.value === 'boolean') return propVal === cond.value;
      return String(propVal) === String(cond.value);
    }

    case 'responseBody.propertyType': {
      const body = responseBody as Record<string, unknown>;
      if (!body || typeof body !== 'object') return false;
      const propVal = body[cond.key!];
      const expectedType = String(cond.value);
      if (expectedType === 'array') return Array.isArray(propVal);
      return typeof propVal === expectedType;
    }

    case 'responseBody.arrayContains': {
      if (!Array.isArray(responseBody)) return false;
      return (responseBody as Record<string, unknown>[]).some(item => {
        if (!item || typeof item !== 'object') return false;
        const propVal = item[cond.key!];
        if (cond.operator === 'contains' && typeof propVal === 'string') {
          return propVal.includes(String(cond.value));
        }
        if (typeof cond.value === 'number') return propVal === cond.value;
        return String(propVal) === String(cond.value);
      });
    }

    default:
      return false;
  }
}

export function createValidator(schema: ValidationSchema): (params: ValidationParams) => boolean {
  return (params: ValidationParams) => {
    return schema.every(cond => evaluateCondition(cond, params));
  };
}
