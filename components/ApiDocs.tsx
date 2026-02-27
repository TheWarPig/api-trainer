'use client';

import { useState } from 'react';

interface Param {
  name: string;
  in: 'path' | 'query' | 'header' | 'body';
  required: boolean;
  type: string;
  description: string;
  example?: string;
}

interface StatusCode {
  code: number;
  description: string;
}

interface Endpoint {
  method: string;
  path: string;
  summary: string;
  description: string;
  requiresAuth: boolean;
  params?: Param[];
  requestBody?: {
    description: string;
    schema: Record<string, { type: string; required?: boolean; description: string; example?: string | number | boolean }>;
    example: string;
  };
  responses: {
    success: { code: number; description: string; example: string };
    errors: StatusCode[];
  };
}

interface Section {
  name: string;
  description: string;
  color: string;
  endpoints: Endpoint[];
}

const METHOD_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  GET:    { bg: 'bg-[#61AFFE]/10', text: 'text-[#61AFFE]', border: 'border-[#61AFFE]/30' },
  POST:   { bg: 'bg-[#49CC90]/10', text: 'text-[#49CC90]', border: 'border-[#49CC90]/30' },
  PUT:    { bg: 'bg-[#FCA130]/10', text: 'text-[#FCA130]', border: 'border-[#FCA130]/30' },
  DELETE: { bg: 'bg-[#F93E3E]/10', text: 'text-[#F93E3E]', border: 'border-[#F93E3E]/30' },
};

const PARAM_IN_STYLE: Record<string, string> = {
  path:   'bg-purple-400/10 text-purple-400 border-purple-400/30',
  query:  'bg-blue-400/10 text-blue-400 border-blue-400/30',
  header: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
  body:   'bg-green-400/10 text-green-400 border-green-400/30',
};

const STATUS_COLOR = (code: number) => {
  if (code < 300) return 'text-emerald-400';
  if (code < 400) return 'text-blue-400';
  if (code < 500) return 'text-yellow-400';
  return 'text-red-400';
};

const API_SECTIONS: Section[] = [
  {
    name: 'Users',
    description: 'Manage user accounts. All user endpoints are publicly accessible (no authentication required).',
    color: 'text-blue-400',
    endpoints: [
      {
        method: 'GET',
        path: '/api/users',
        summary: 'List all users',
        description: 'Returns an array of all registered users. Supports optional filtering by name or role using query parameters.',
        requiresAuth: false,
        params: [
          { name: 'name', in: 'query', required: false, type: 'string', description: 'Filter users by name (partial, case-insensitive match)', example: 'Alice' },
          { name: 'role', in: 'query', required: false, type: 'string', description: 'Filter users by role. Accepted values: admin, user, moderator', example: 'admin' },
        ],
        responses: {
          success: {
            code: 200,
            description: 'Array of user objects',
            example: JSON.stringify([
              { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', age: 28, createdAt: '2024-01-15T10:00:00Z' },
              { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user', age: 34, createdAt: '2024-02-20T14:30:00Z' },
            ], null, 2),
          },
          errors: [],
        },
      },
      {
        method: 'GET',
        path: '/api/users/:id',
        summary: 'Get a user by ID',
        description: 'Returns a single user object matching the given ID.',
        requiresAuth: false,
        params: [
          { name: 'id', in: 'path', required: true, type: 'integer', description: 'The unique identifier of the user', example: '1' },
        ],
        responses: {
          success: {
            code: 200,
            description: 'A single user object',
            example: JSON.stringify({ id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', age: 28, createdAt: '2024-01-15T10:00:00Z' }, null, 2),
          },
          errors: [
            { code: 404, description: 'User not found — no user exists with the given ID' },
          ],
        },
      },
      {
        method: 'POST',
        path: '/api/users',
        summary: 'Create a new user',
        description: 'Creates a new user and returns the created object including its assigned ID. The server auto-assigns the ID and createdAt timestamp.',
        requiresAuth: false,
        requestBody: {
          description: 'User data to create',
          schema: {
            name:  { type: 'string',  required: true,  description: 'Full name of the user', example: 'Charlie Brown' },
            email: { type: 'string',  required: true,  description: 'Unique email address', example: 'charlie@example.com' },
            role:  { type: 'string',  required: false, description: 'One of: admin, user, moderator. Defaults to "user"', example: 'user' },
            age:   { type: 'integer', required: false, description: 'Age of the user', example: 29 },
          },
          example: JSON.stringify({ name: 'Charlie Brown', email: 'charlie@example.com', role: 'user', age: 29 }, null, 2),
        },
        responses: {
          success: {
            code: 201,
            description: 'The newly created user object',
            example: JSON.stringify({ id: 4, name: 'Charlie Brown', email: 'charlie@example.com', role: 'user', age: 29, createdAt: '2024-04-01T12:00:00Z' }, null, 2),
          },
          errors: [
            { code: 400, description: 'Bad Request — missing required fields (name, email) or invalid JSON body' },
          ],
        },
      },
      {
        method: 'PUT',
        path: '/api/users/:id',
        summary: 'Update a user',
        description: 'Updates an existing user. Send only the fields you want to change — all other fields remain unchanged. Returns the full updated user object.',
        requiresAuth: false,
        params: [
          { name: 'id', in: 'path', required: true, type: 'integer', description: 'The ID of the user to update', example: '2' },
        ],
        requestBody: {
          description: 'Fields to update (all optional — send only what you want to change)',
          schema: {
            name:  { type: 'string',  required: false, description: 'New name' },
            email: { type: 'string',  required: false, description: 'New email address' },
            role:  { type: 'string',  required: false, description: 'New role: admin, user, or moderator' },
            age:   { type: 'integer', required: false, description: 'New age' },
          },
          example: JSON.stringify({ email: 'bob.updated@example.com' }, null, 2),
        },
        responses: {
          success: {
            code: 200,
            description: 'The fully updated user object',
            example: JSON.stringify({ id: 2, name: 'Bob Smith', email: 'bob.updated@example.com', role: 'user', age: 34, createdAt: '2024-02-20T14:30:00Z' }, null, 2),
          },
          errors: [
            { code: 400, description: 'Bad Request — invalid JSON body' },
            { code: 404, description: 'Not Found — user with given ID does not exist' },
          ],
        },
      },
      {
        method: 'DELETE',
        path: '/api/users/:id',
        summary: 'Delete a user',
        description: 'Permanently removes a user from the system. This action cannot be undone (unless you reset the data). Does not require a request body.',
        requiresAuth: false,
        params: [
          { name: 'id', in: 'path', required: true, type: 'integer', description: 'The ID of the user to delete', example: '3' },
        ],
        responses: {
          success: {
            code: 200,
            description: 'Confirmation message with the deleted user ID',
            example: JSON.stringify({ message: 'User 3 deleted successfully.', id: 3 }, null, 2),
          },
          errors: [
            { code: 404, description: 'Not Found — user with given ID does not exist' },
          ],
        },
      },
      {
        method: 'GET',
        path: '/api/users/:id/orders',
        summary: 'Get orders for a user',
        description: 'Returns all orders that belong to a specific user. This is a nested resource endpoint — the user must exist or a 404 is returned.',
        requiresAuth: false,
        params: [
          { name: 'id', in: 'path', required: true, type: 'integer', description: 'The ID of the user whose orders to retrieve', example: '1' },
        ],
        responses: {
          success: {
            code: 200,
            description: 'Array of order objects for the specified user (may be empty array)',
            example: JSON.stringify([
              { id: 1, userId: 1, productId: 1, quantity: 1, status: 'delivered', total: 99.99, createdAt: '2024-02-01T00:00:00Z' },
              { id: 2, userId: 1, productId: 3, quantity: 2, status: 'shipped',   total: 119.98, createdAt: '2024-02-15T00:00:00Z' },
            ], null, 2),
          },
          errors: [
            { code: 404, description: 'Not Found — user with given ID does not exist' },
          ],
        },
      },
    ],
  },
  {
    name: 'Products',
    description: 'Manage the product catalog. All product endpoints require a Bearer token in the Authorization header.',
    color: 'text-orange-400',
    endpoints: [
      {
        method: 'GET',
        path: '/api/products',
        summary: 'List all products',
        description: 'Returns an array of all products in the catalog. Supports optional filtering by category or featured status. Requires authentication.',
        requiresAuth: true,
        params: [
          { name: 'Authorization', in: 'header', required: true, type: 'string', description: 'Bearer token for authentication', example: 'Bearer secret-token-123' },
          { name: 'category', in: 'query', required: false, type: 'string', description: 'Filter by product category', example: 'electronics' },
          { name: 'featured', in: 'query', required: false, type: 'boolean', description: 'Filter by featured status (true or false)', example: 'true' },
        ],
        responses: {
          success: {
            code: 200,
            description: 'Array of product objects',
            example: JSON.stringify([
              { id: 1, name: 'Wireless Headphones', price: 99.99, category: 'electronics', featured: true,  stock: 50,  createdAt: '2024-01-01T00:00:00Z' },
              { id: 2, name: 'Mechanical Keyboard',  price: 149.99, category: 'electronics', featured: false, stock: 30, createdAt: '2024-01-02T00:00:00Z' },
            ], null, 2),
          },
          errors: [
            { code: 401, description: 'Unauthorized — missing or invalid Authorization header' },
          ],
        },
      },
      {
        method: 'GET',
        path: '/api/products/:id',
        summary: 'Get a product by ID',
        description: 'Returns a single product matching the given ID. Requires authentication.',
        requiresAuth: true,
        params: [
          { name: 'Authorization', in: 'header', required: true, type: 'string', description: 'Bearer token', example: 'Bearer secret-token-123' },
          { name: 'id', in: 'path', required: true, type: 'integer', description: 'The unique product ID', example: '1' },
        ],
        responses: {
          success: {
            code: 200,
            description: 'A single product object',
            example: JSON.stringify({ id: 1, name: 'Wireless Headphones', price: 99.99, category: 'electronics', featured: true, stock: 50, createdAt: '2024-01-01T00:00:00Z' }, null, 2),
          },
          errors: [
            { code: 401, description: 'Unauthorized — missing or invalid token' },
            { code: 404, description: 'Not Found — no product with the given ID' },
          ],
        },
      },
      {
        method: 'POST',
        path: '/api/products',
        summary: 'Create a new product',
        description: 'Adds a new product to the catalog. Returns the created product with its assigned ID. Requires authentication.',
        requiresAuth: true,
        params: [
          { name: 'Authorization', in: 'header', required: true, type: 'string', description: 'Bearer token', example: 'Bearer secret-token-123' },
        ],
        requestBody: {
          description: 'Product data',
          schema: {
            name:     { type: 'string',  required: true,  description: 'Product name', example: 'API Tester Pro' },
            price:    { type: 'number',  required: true,  description: 'Price in USD', example: 29.99 },
            category: { type: 'string',  required: false, description: 'Product category. Defaults to "general"', example: 'software' },
            featured: { type: 'boolean', required: false, description: 'Whether the product is featured. Defaults to false', example: false },
            stock:    { type: 'integer', required: false, description: 'Available stock quantity. Defaults to 0', example: 100 },
          },
          example: JSON.stringify({ name: 'API Tester Pro', price: 29.99, category: 'software', featured: false, stock: 100 }, null, 2),
        },
        responses: {
          success: {
            code: 201,
            description: 'The newly created product object',
            example: JSON.stringify({ id: 4, name: 'API Tester Pro', price: 29.99, category: 'software', featured: false, stock: 100, createdAt: '2024-04-01T12:00:00Z' }, null, 2),
          },
          errors: [
            { code: 400, description: 'Bad Request — missing required fields (name, price) or invalid JSON' },
            { code: 401, description: 'Unauthorized — missing or invalid token' },
          ],
        },
      },
      {
        method: 'PUT',
        path: '/api/products/:id',
        summary: 'Update a product',
        description: 'Updates fields on an existing product. Send only the fields you want to change. Returns the full updated object. Requires authentication.',
        requiresAuth: true,
        params: [
          { name: 'Authorization', in: 'header', required: true, type: 'string', description: 'Bearer token', example: 'Bearer secret-token-123' },
          { name: 'id', in: 'path', required: true, type: 'integer', description: 'The ID of the product to update', example: '4' },
        ],
        requestBody: {
          description: 'Fields to update',
          schema: {
            name:     { type: 'string',  required: false, description: 'New product name' },
            price:    { type: 'number',  required: false, description: 'New price' },
            category: { type: 'string',  required: false, description: 'New category' },
            featured: { type: 'boolean', required: false, description: 'Set featured status' },
            stock:    { type: 'integer', required: false, description: 'New stock level' },
          },
          example: JSON.stringify({ price: 19.99, featured: true }, null, 2),
        },
        responses: {
          success: {
            code: 200,
            description: 'The fully updated product object',
            example: JSON.stringify({ id: 4, name: 'API Tester Pro', price: 19.99, category: 'software', featured: true, stock: 100, createdAt: '2024-04-01T12:00:00Z' }, null, 2),
          },
          errors: [
            { code: 400, description: 'Bad Request — invalid JSON body' },
            { code: 401, description: 'Unauthorized — missing or invalid token' },
            { code: 404, description: 'Not Found — no product with the given ID' },
          ],
        },
      },
      {
        method: 'DELETE',
        path: '/api/products/:id',
        summary: 'Delete a product',
        description: 'Permanently removes a product from the catalog. No request body needed. Requires authentication.',
        requiresAuth: true,
        params: [
          { name: 'Authorization', in: 'header', required: true, type: 'string', description: 'Bearer token', example: 'Bearer secret-token-123' },
          { name: 'id', in: 'path', required: true, type: 'integer', description: 'The ID of the product to delete', example: '1' },
        ],
        responses: {
          success: {
            code: 200,
            description: 'Confirmation with deleted product ID',
            example: JSON.stringify({ message: 'Product 1 deleted successfully.', id: 1 }, null, 2),
          },
          errors: [
            { code: 401, description: 'Unauthorized — missing or invalid token' },
            { code: 404, description: 'Not Found — no product with the given ID' },
          ],
        },
      },
    ],
  },
];

/* ── Sub-components ── */

function JsonBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="relative group">
      <pre className="bg-[var(--color-bg-code)] border border-[var(--color-border-tertiary)] rounded-lg p-3 text-[11px] font-mono text-[var(--color-text-secondary)] overflow-x-auto leading-relaxed whitespace-pre">
        {code}
      </pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-[var(--color-text-dimmed)] hover:text-[var(--color-text-secondary)] bg-[var(--color-bg-subtle)] border border-[var(--color-border-input)] px-2 py-0.5 rounded"
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  );
}

function EndpointCard({ ep }: { ep: Endpoint }) {
  const [open, setOpen] = useState(false);
  const ms = METHOD_STYLE[ep.method] ?? METHOD_STYLE.GET;

  return (
    <div className={`border rounded-lg overflow-hidden transition-colors ${open ? 'border-[var(--color-border-hover)]' : 'border-[var(--color-border-secondary)] hover:border-[var(--color-bg-hover)]'}`}>
      {/* Header row — click to expand */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-[var(--color-bg-panel)] hover:bg-[var(--color-bg-subtle)] transition-colors text-left"
      >
        {/* Method badge */}
        <span className={`shrink-0 w-16 text-center text-[11px] font-bold py-0.5 rounded border ${ms.bg} ${ms.text} ${ms.border}`}>
          {ep.method}
        </span>

        {/* Path */}
        <code className="flex-1 text-sm font-mono text-[var(--color-text-secondary)]">{ep.path}</code>

        {/* Summary */}
        <span className="text-xs text-[var(--color-text-dimmed)] hidden md:block">{ep.summary}</span>

        {/* Auth badge */}
        {ep.requiresAuth && (
          <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-accent-auth-bg)] border border-[var(--color-accent-auth-border)] text-[var(--color-accent-auth-text)]">
            🔒 Auth
          </span>
        )}

        {/* Chevron */}
        <svg
          className={`shrink-0 w-4 h-4 text-[var(--color-text-faint)] transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="border-t border-[var(--color-border-secondary)] bg-[var(--color-bg-deep)] p-4 space-y-5">
          {/* Description */}
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{ep.description}</p>

          {/* Parameters */}
          {ep.params && ep.params.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Parameters</h4>
              <div className="border border-[var(--color-border-tertiary)] rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[var(--color-bg-panel)] border-b border-[var(--color-border-tertiary)]">
                      <th className="px-3 py-2 text-left text-[var(--color-text-dimmed)] font-medium">Name</th>
                      <th className="px-3 py-2 text-left text-[var(--color-text-dimmed)] font-medium">In</th>
                      <th className="px-3 py-2 text-left text-[var(--color-text-dimmed)] font-medium">Type</th>
                      <th className="px-3 py-2 text-left text-[var(--color-text-dimmed)] font-medium">Required</th>
                      <th className="px-3 py-2 text-left text-[var(--color-text-dimmed)] font-medium">Description</th>
                      <th className="px-3 py-2 text-left text-[var(--color-text-dimmed)] font-medium">Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ep.params.map((p, i) => (
                      <tr key={i} className="border-b border-[var(--color-bg-subtle)] last:border-0">
                        <td className="px-3 py-2 font-mono text-[var(--color-json-key)] font-semibold">{p.name}</td>
                        <td className="px-3 py-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${PARAM_IN_STYLE[p.in]}`}>
                            {p.in}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono text-[var(--color-json-number)]">{p.type}</td>
                        <td className="px-3 py-2">
                          {p.required
                            ? <span className="text-red-400 font-semibold">yes</span>
                            : <span className="text-[var(--color-text-faint)]">no</span>}
                        </td>
                        <td className="px-3 py-2 text-[var(--color-text-muted)]">{p.description}</td>
                        <td className="px-3 py-2 font-mono text-[var(--color-json-string)]">{p.example ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Request body */}
          {ep.requestBody && (
            <div>
              <h4 className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Request Body</h4>
              <p className="text-[11px] text-[var(--color-text-dimmed)] mb-2">{ep.requestBody.description} · Content-Type: <code className="text-[var(--color-json-string)]">application/json</code></p>

              {/* Schema table */}
              <div className="border border-[var(--color-border-tertiary)] rounded-lg overflow-hidden mb-3">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[var(--color-bg-panel)] border-b border-[var(--color-border-tertiary)]">
                      <th className="px-3 py-2 text-left text-[var(--color-text-dimmed)] font-medium">Field</th>
                      <th className="px-3 py-2 text-left text-[var(--color-text-dimmed)] font-medium">Type</th>
                      <th className="px-3 py-2 text-left text-[var(--color-text-dimmed)] font-medium">Required</th>
                      <th className="px-3 py-2 text-left text-[var(--color-text-dimmed)] font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(ep.requestBody.schema).map(([field, info]) => (
                      <tr key={field} className="border-b border-[var(--color-bg-subtle)] last:border-0">
                        <td className="px-3 py-2 font-mono text-[var(--color-json-key)] font-semibold">{field}</td>
                        <td className="px-3 py-2 font-mono text-[var(--color-json-number)]">{info.type}</td>
                        <td className="px-3 py-2">
                          {info.required
                            ? <span className="text-red-400 font-semibold">yes</span>
                            : <span className="text-[var(--color-text-faint)]">no</span>}
                        </td>
                        <td className="px-3 py-2 text-[var(--color-text-muted)]">{info.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-[11px] text-[var(--color-text-dimmed)] mb-1.5">Example:</p>
              <JsonBlock code={ep.requestBody.example} />
            </div>
          )}

          {/* Responses */}
          <div>
            <h4 className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Responses</h4>

            {/* Success */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold text-emerald-400">{ep.responses.success.code}</span>
                <span className="text-[11px] text-[var(--color-text-dimmed)]">{ep.responses.success.description}</span>
              </div>
              <JsonBlock code={ep.responses.success.example} />
            </div>

            {/* Error responses */}
            {ep.responses.errors.length > 0 && (
              <div className="space-y-1">
                {ep.responses.errors.map((err, i) => (
                  <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-[var(--color-bg-panel)] border border-[var(--color-border-tertiary)]">
                    <span className={`text-[11px] font-bold shrink-0 ${STATUS_COLOR(err.code)}`}>{err.code}</span>
                    <span className="text-[11px] text-[var(--color-text-dimmed)]">{err.description}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main component ── */

interface ApiDocsProps {
  open: boolean;
  onClose: () => void;
}

export default function ApiDocs({ open, onClose }: ApiDocsProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  if (!open) return null;

  const filtered = activeSection
    ? API_SECTIONS.filter(s => s.name === activeSection)
    : API_SECTIONS;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal panel — slides in from right */}
      <div className="fixed top-0 right-0 bottom-0 z-50 flex flex-col bg-[var(--color-bg-deepest)] border-l border-[var(--color-border-primary)] shadow-2xl w-full max-w-3xl">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[var(--color-border-primary)] bg-[var(--color-bg-panel)] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#FF6C37]/20 border border-[#FF6C37]/30 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-[#FF6C37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div>
              <span className="text-sm font-bold text-[var(--color-text-primary)]">API Reference</span>
              <span className="ml-2 text-[10px] text-[var(--color-text-dimmed)]">Mock Server · localhost:3000</span>
            </div>
          </div>

          {/* Section filter pills */}
          <div className="flex items-center gap-1.5 ml-4">
            <button
              onClick={() => setActiveSection(null)}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors ${!activeSection ? 'bg-[#FF6C37] text-white' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] bg-[var(--color-bg-elevated)]'}`}
            >
              All
            </button>
            {API_SECTIONS.map(s => (
              <button
                key={s.name}
                onClick={() => setActiveSection(n => n === s.name ? null : s.name)}
                className={`text-xs px-2.5 py-1 rounded-full transition-colors ${activeSection === s.name ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] bg-[var(--color-bg-subtle)]'}`}
              >
                {s.name}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Close */}
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--color-text-dimmed)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-hover-overlay)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* ── Overview bar ── */}
        <div className="flex items-center gap-6 px-5 py-2.5 bg-[var(--color-bg-deep)] border-b border-[var(--color-border-tertiary)] shrink-0 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--color-text-faint)]">Base URL</span>
            <code className="text-[var(--color-json-key)] font-mono">http://api-trainerx</code>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--color-text-faint)]">Auth</span>
            <code className="text-[var(--color-json-string)] font-mono">Bearer secret-token-123</code>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--color-text-faint)]">Format</span>
            <code className="text-[var(--color-json-number)] font-mono">application/json</code>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            {['GET', 'POST', 'PUT', 'DELETE'].map(m => {
              const s = METHOD_STYLE[m];
              return (
                <span key={m} className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${s.bg} ${s.text} ${s.border}`}>
                  {m}
                </span>
              );
            })}
          </div>
        </div>

        {/* ── Scrollable endpoint list ── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-8">
          {filtered.map(section => (
            <section key={section.name}>
              {/* Section heading */}
              <div className="flex items-center gap-2 mb-3">
                <h3 className={`text-base font-bold ${section.color}`}>{section.name}</h3>
                <span className="text-xs text-[var(--color-text-faint)] bg-[var(--color-bg-subtle)] border border-[var(--color-border-secondary)] px-2 py-0.5 rounded-full">
                  {section.endpoints.length} endpoints
                </span>
                {section.endpoints[0]?.requiresAuth && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-accent-auth-bg)] border border-[var(--color-accent-auth-border)] text-[var(--color-accent-auth-text)]">
                    🔒 Requires Auth
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--color-text-dimmed)] mb-3">{section.description}</p>

              <div className="space-y-2">
                {section.endpoints.map((ep, i) => (
                  <EndpointCard key={i} ep={ep} />
                ))}
              </div>
            </section>
          ))}

          {/* Footer note */}
          <div className="pt-2 pb-4 text-[11px] text-[var(--color-text-faint)] text-center border-t border-[var(--color-bg-subtle)]">
            This is a mock server for learning purposes. Data resets on server restart or via the Reset button.
          </div>
        </div>
      </div>
    </>
  );
}
