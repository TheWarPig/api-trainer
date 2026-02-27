import type { ValidationSchema } from './types';

export const builtinValidationMap: Record<number, ValidationSchema> = {
  // Level 1: Your First GET Request
  1: [
    { field: 'method', value: 'GET' },
    { field: 'url.pathname', value: '/api/users' },
    { field: 'statusCode', value: 200 },
    { field: 'responseBody.isArray', value: true },
    { field: 'responseBody.arrayMinLength', value: 1 },
  ],

  // Level 2: Path Parameters
  2: [
    { field: 'method', value: 'GET' },
    { field: 'url.pathname', value: '/api/users/1' },
    { field: 'statusCode', value: 200 },
    { field: 'responseBody.property', key: 'id', operator: 'equals', value: 1 },
  ],

  // Level 3: Error Responses (404)
  3: [
    { field: 'method', value: 'GET' },
    { field: 'url.pathname', value: '/api/users/999' },
    { field: 'statusCode', value: 404 },
  ],

  // Level 4: Query Parameters
  4: [
    { field: 'method', value: 'GET' },
    { field: 'url.pathname', value: '/api/users' },
    { field: 'url.queryParam', key: 'name', operator: 'exists' },
    { field: 'statusCode', value: 200 },
    { field: 'responseBody.isArray', value: true },
    { field: 'responseBody.arrayMinLength', value: 1 },
  ],

  // Level 5: Creating Resources (POST)
  5: [
    { field: 'method', value: 'POST' },
    { field: 'url.pathname', value: '/api/users' },
    { field: 'statusCode', value: 201 },
  ],

  // Level 6: Updating Resources (PUT)
  6: [
    { field: 'method', value: 'PUT' },
    { field: 'url.pathname', value: '/api/users/2' },
    { field: 'statusCode', value: 200 },
  ],

  // Level 7: Deleting Resources (DELETE)
  7: [
    { field: 'method', value: 'DELETE' },
    { field: 'url.pathname', value: '/api/users/3' },
    { field: 'statusCode', value: 200 },
  ],

  // Level 8: Authentication Headers
  8: [
    { field: 'method', value: 'GET' },
    { field: 'url.pathname', value: '/api/products' },
    { field: 'requestHeader', key: 'Authorization', operator: 'equals', value: 'Bearer secret-token-123' },
    { field: 'statusCode', value: 200 },
    { field: 'responseBody.isArray', value: true },
    { field: 'responseBody.arrayMinLength', value: 1 },
  ],

  // Level 9: Nested Resources
  9: [
    { field: 'method', value: 'GET' },
    { field: 'url.pathname', value: '/api/users/1/orders' },
    { field: 'statusCode', value: 200 },
    { field: 'responseBody.isArray', value: true },
    { field: 'responseBody.arrayMinLength', value: 1 },
  ],

  // Level 10: Full CRUD Challenge
  10: [
    { field: 'method', value: 'GET' },
    { field: 'url.pathnameRegex', value: '^\\/api\\/products\\/\\d+$' },
    { field: 'requestHeader', key: 'Authorization', operator: 'startsWith', value: 'Bearer ' },
    { field: 'statusCode', value: 200 },
    { field: 'responseBody.property', key: 'name', operator: 'contains', value: 'API Tester Pro' },
    { field: 'responseBody.property', key: 'price', operator: 'equals', value: 19.99 },
  ],

  // Level 11: Partial Update (PATCH)
  11: [
    { field: 'method', value: 'PATCH' },
    { field: 'url.pathname', value: '/api/users/1' },
    { field: 'statusCode', value: 200 },
    { field: 'responseBody.property', key: 'age', operator: 'equals', value: 30 },
  ],

  // Level 12: Bad Request (400)
  12: [
    { field: 'method', value: 'POST' },
    { field: 'url.pathname', value: '/api/users' },
    { field: 'statusCode', value: 400 },
  ],

  // Level 13: Unauthorized (401)
  13: [
    { field: 'method', value: 'GET' },
    { field: 'url.pathname', value: '/api/products' },
    { field: 'requestHeaderAbsent', key: 'Authorization' },
    { field: 'statusCode', value: 401 },
  ],

  // Level 14: Filter by Role
  14: [
    { field: 'method', value: 'GET' },
    { field: 'url.pathname', value: '/api/users' },
    { field: 'url.queryParam', key: 'role', operator: 'equals', value: 'admin' },
    { field: 'statusCode', value: 200 },
    { field: 'responseBody.isArray', value: true },
    { field: 'responseBody.arrayMinLength', value: 1 },
  ],

  // Level 15: Auth + Category Filter
  15: [
    { field: 'method', value: 'GET' },
    { field: 'url.pathname', value: '/api/products' },
    { field: 'url.queryParam', key: 'category', operator: 'equals', value: 'electronics' },
    { field: 'requestHeader', key: 'Authorization', operator: 'startsWith', value: 'Bearer ' },
    { field: 'statusCode', value: 200 },
    { field: 'responseBody.isArray', value: true },
    { field: 'responseBody.arrayMinLength', value: 1 },
  ],

  // Level 16: Boolean Query Filter
  16: [
    { field: 'method', value: 'GET' },
    { field: 'url.pathname', value: '/api/products' },
    { field: 'url.queryParam', key: 'featured', operator: 'equals', value: 'true' },
    { field: 'requestHeader', key: 'Authorization', operator: 'startsWith', value: 'Bearer ' },
    { field: 'statusCode', value: 200 },
    { field: 'responseBody.isArray', value: true },
    { field: 'responseBody.arrayMinLength', value: 1 },
  ],

  // Level 17: Authenticated POST
  17: [
    { field: 'method', value: 'POST' },
    { field: 'url.pathname', value: '/api/products' },
    { field: 'requestHeader', key: 'Authorization', operator: 'startsWith', value: 'Bearer ' },
    { field: 'statusCode', value: 201 },
  ],

  // Level 18: Authenticated DELETE
  18: [
    { field: 'method', value: 'DELETE' },
    { field: 'url.pathname', value: '/api/products/2' },
    { field: 'requestHeader', key: 'Authorization', operator: 'startsWith', value: 'Bearer ' },
    { field: 'statusCode', value: 200 },
  ],

  // Level 19: Admin Data Snapshot
  19: [
    { field: 'method', value: 'GET' },
    { field: 'url.pathname', value: '/api/admin/data' },
    { field: 'statusCode', value: 200 },
    { field: 'responseBody.propertyType', key: 'users', value: 'array' },
    { field: 'responseBody.propertyType', key: 'products', value: 'array' },
    { field: 'responseBody.propertyType', key: 'orders', value: 'array' },
  ],

  // Level 20: The Grand Finale
  20: [
    { field: 'method', value: 'GET' },
    { field: 'url.pathname', value: '/api/users' },
    { field: 'url.queryParam', key: 'role', operator: 'equals', value: 'admin' },
    { field: 'statusCode', value: 200 },
    { field: 'responseBody.isArray', value: true },
    { field: 'responseBody.arrayContains', key: 'name', operator: 'contains', value: 'Alex Devlin' },
  ],
};
