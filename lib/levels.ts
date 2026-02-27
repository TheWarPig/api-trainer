// Re-export types from the shared types module for backwards compatibility
export type { Difficulty, ApiEndpoint, ValidationParams, Level } from './types';
import type { Difficulty, ApiEndpoint, ValidationParams, Level } from './types';

export const levels: Level[] = [
  // ─── LEVEL 1 ────────────────────────────────────────────────────────────────
  {
    id: 1,
    title: 'Your First GET Request',
    difficulty: 'Beginner',
    concept: 'HTTP GET',
    description:
      'The GET method retrieves data from a server without modifying anything. It\'s the most common HTTP method — browsers use it every time you visit a webpage.',
    task: 'Retrieve the complete list of all users from the server. Send a GET request to the users endpoint and confirm you receive a 200 OK response.',
    hints: [
      'Select GET as the HTTP method (already set by default).',
      'The users endpoint is /api/users.',
      'GET requests do not need a body.',
      'A successful response returns HTTP status 200 with an array of users.',
    ],
    successMessage: '🎉 Excellent! You made your first API request and retrieved all users!',
    successCriteria: 'GET /api/users → 200 OK with a non-empty user array',
    validate: ({ method, url, statusCode, responseBody }) => {
      if (method !== 'GET') return false;
      const path = new URL(url, 'http://x').pathname;
      if (path !== '/api/users') return false;
      if (statusCode !== 200) return false;
      return Array.isArray(responseBody) && responseBody.length > 0;
    },
    defaultMethod: 'GET',
    defaultUrl: '/api/users',
    endpoints: [
      { method: 'GET', path: '/api/users', description: 'Returns an array of all users' },
    ],
    tip: 'In REST APIs, resources are represented by nouns (users, products, orders), not verbs.',
  },

  // ─── LEVEL 2 ────────────────────────────────────────────────────────────────
  {
    id: 2,
    title: 'Path Parameters',
    difficulty: 'Beginner',
    concept: 'Path Parameters',
    description:
      'Path parameters are variable parts of the URL that identify a specific resource. For example, /api/users/1 retrieves the user with ID 1.',
    task: 'Retrieve the profile of the user with ID 1. Use a path parameter to target that specific user.',
    hints: [
      'Add the user\'s ID directly in the URL path: /api/users/1',
      'Still use the GET method.',
      'The response should be a single user object (not an array).',
      'Look for "id": 1 in the response body.',
    ],
    successMessage: '✅ Great job! You used a path parameter to fetch a specific user.',
    successCriteria: 'GET /api/users/1 → 200 OK with user object (id: 1)',
    validate: ({ method, url, statusCode, responseBody }) => {
      if (method !== 'GET') return false;
      const path = new URL(url, 'http://x').pathname;
      if (path !== '/api/users/1') return false;
      if (statusCode !== 200) return false;
      const body = responseBody as Record<string, unknown>;
      return body?.id === 1;
    },
    defaultMethod: 'GET',
    defaultUrl: '/api/users/1',
    endpoints: [
      { method: 'GET', path: '/api/users', description: 'Get all users' },
      { method: 'GET', path: '/api/users/:id', description: 'Get a specific user by ID' },
    ],
    tip: 'The colon notation (:id) in API docs means it\'s a placeholder for a real value.',
  },

  // ─── LEVEL 3 ────────────────────────────────────────────────────────────────
  {
    id: 3,
    title: 'Error Responses (404)',
    difficulty: 'Easy',
    concept: 'HTTP Status Codes',
    description:
      '4xx status codes indicate client errors. 404 Not Found means the requested resource doesn\'t exist. Understanding errors is just as important as understanding success responses.',
    task: 'Try to fetch a user that does not exist — use ID 999. Observe the 404 error response the server returns.',
    hints: [
      'Use GET /api/users/999.',
      'No user with ID 999 exists in the system.',
      'The server will respond with a 404 status code.',
      'Read the error message in the response body.',
    ],
    successMessage: '💡 You successfully triggered and observed a 404 error! This is how APIs communicate "resource not found".',
    successCriteria: 'GET /api/users/999 → 404 Not Found',
    validate: ({ method, url, statusCode }) => {
      if (method !== 'GET') return false;
      const path = new URL(url, 'http://x').pathname;
      if (path !== '/api/users/999') return false;
      return statusCode === 404;
    },
    defaultMethod: 'GET',
    defaultUrl: '/api/users/999',
    endpoints: [
      { method: 'GET', path: '/api/users/:id', description: 'Get a specific user (returns 404 if not found)' },
    ],
    tip: 'Common status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error.',
  },

  // ─── LEVEL 4 ────────────────────────────────────────────────────────────────
  {
    id: 4,
    title: 'Query Parameters',
    difficulty: 'Easy',
    concept: 'Query Strings',
    description:
      'Query parameters are appended to the URL after a ? and are used to filter, sort, or search data. They don\'t identify a resource — they modify how the data is returned.',
    task: 'Search for users named "Alice" using the name query parameter. The API supports ?name=value filtering.',
    hints: [
      'Append ?name=Alice to the URL: /api/users?name=Alice',
      'Or use the Params tab to add key=name, value=Alice.',
      'The response should include only users whose name contains "Alice".',
      'Query params come after the ? in the URL.',
    ],
    successMessage: '🔍 Nice work! You used a query parameter to filter results — this is fundamental for building efficient API queries.',
    successCriteria: 'GET /api/users?name=Alice → 200 OK with filtered results',
    validate: ({ method, url, statusCode, responseBody }) => {
      if (method !== 'GET') return false;
      const parsed = new URL(url, 'http://x');
      if (parsed.pathname !== '/api/users') return false;
      if (!parsed.searchParams.get('name')) return false;
      if (statusCode !== 200) return false;
      return Array.isArray(responseBody) && responseBody.length > 0;
    },
    defaultMethod: 'GET',
    defaultUrl: '/api/users?name=Alice',
    endpoints: [
      { method: 'GET', path: '/api/users?name=:value', description: 'Filter users by name (partial match)' },
      { method: 'GET', path: '/api/users?role=:value', description: 'Filter users by role (admin/user/moderator)' },
    ],
    tip: 'Try ?role=admin or ?role=user to see role-based filtering.',
  },

  // ─── LEVEL 5 ────────────────────────────────────────────────────────────────
  {
    id: 5,
    title: 'Creating Resources (POST)',
    difficulty: 'Medium',
    concept: 'HTTP POST',
    description:
      'POST requests create new resources on the server. You send data in the request body (usually JSON), and the server returns the newly created resource with a 201 Created status.',
    task: 'Create a new user. Send a POST request to /api/users with the required user data in the request body.',
    hints: [
      'Switch the method to POST.',
      'Go to the Body tab and add JSON with: name, email, role, and age.',
      'Set the Content-Type header to application/json.',
      'Required fields: name (string), email (string), role (admin/user/moderator), age (number).',
      'A successful creation returns 201 Created.',
    ],
    successMessage: '🆕 Awesome! You created a new user via POST! The server returned 201 Created with the new user\'s data including an ID.',
    successCriteria: 'POST /api/users with valid JSON body → 201 Created',
    validate: ({ method, url, statusCode }) => {
      if (method !== 'POST') return false;
      const path = new URL(url, 'http://x').pathname;
      if (path !== '/api/users') return false;
      return statusCode === 201;
    },
    defaultMethod: 'POST',
    defaultUrl: '/api/users',
    defaultHeaders: [
      { key: 'Content-Type', value: 'application/json' },
    ],
    defaultBody: JSON.stringify({ name: 'Charlie Brown', email: 'charlie@example.com', role: 'user', age: 29 }, null, 2),
    endpoints: [
      { method: 'POST', path: '/api/users', description: 'Create a new user (returns 201 + created user)', exampleBody: '{"name":"string","email":"string","role":"user|admin|moderator","age":number}' },
    ],
    tip: 'POST is not idempotent — calling it twice creates two separate resources.',
  },

  // ─── LEVEL 6 ────────────────────────────────────────────────────────────────
  {
    id: 6,
    title: 'Updating Resources (PUT)',
    difficulty: 'Medium',
    concept: 'HTTP PUT',
    description:
      'PUT requests update an existing resource. You typically send the full updated object in the body. The server replaces the stored resource with the new data.',
    task: 'Update Bob Smith\'s email address (user ID 2). Send a PUT request to update his email to "bob.updated@example.com".',
    hints: [
      'Switch the method to PUT.',
      'The URL should be /api/users/2 (Bob\'s ID is 2).',
      'Include the email in the JSON body.',
      'Set Content-Type: application/json.',
      'A successful update returns 200 OK with the updated user.',
    ],
    successMessage: '✏️ Perfect! You updated a resource using PUT. Notice the response shows the updated data.',
    successCriteria: 'PUT /api/users/2 with JSON body → 200 OK with updated user',
    validate: ({ method, url, statusCode }) => {
      if (method !== 'PUT') return false;
      const path = new URL(url, 'http://x').pathname;
      if (path !== '/api/users/2') return false;
      return statusCode === 200;
    },
    defaultMethod: 'PUT',
    defaultUrl: '/api/users/2',
    defaultHeaders: [
      { key: 'Content-Type', value: 'application/json' },
    ],
    defaultBody: JSON.stringify({ email: 'bob.updated@example.com' }, null, 2),
    endpoints: [
      { method: 'PUT', path: '/api/users/:id', description: 'Update an existing user (partial or full update)' },
    ],
    tip: 'PATCH is similar to PUT but for partial updates. PUT often replaces the whole resource.',
  },

  // ─── LEVEL 7 ────────────────────────────────────────────────────────────────
  {
    id: 7,
    title: 'Deleting Resources (DELETE)',
    difficulty: 'Medium',
    concept: 'HTTP DELETE',
    description:
      'DELETE requests remove a resource from the server. After a successful delete, trying to GET the same resource should return a 404. DELETE requests typically don\'t have a request body.',
    task: 'Delete user Carol Williams (ID 3) from the system. Then verify the deletion by trying to GET /api/users/3.',
    hints: [
      'Switch the method to DELETE.',
      'Use the URL /api/users/3.',
      'DELETE requests don\'t need a body.',
      'A successful deletion returns 200 OK with a confirmation message.',
      'Bonus: After deleting, switch back to GET /api/users/3 to see the 404.',
    ],
    successMessage: '🗑️ User deleted! DELETE removes resources permanently. A real app would often ask for confirmation first.',
    successCriteria: 'DELETE /api/users/3 → 200 OK',
    validate: ({ method, url, statusCode }) => {
      if (method !== 'DELETE') return false;
      const path = new URL(url, 'http://x').pathname;
      if (path !== '/api/users/3') return false;
      return statusCode === 200;
    },
    defaultMethod: 'DELETE',
    defaultUrl: '/api/users/3',
    endpoints: [
      { method: 'DELETE', path: '/api/users/:id', description: 'Delete a user by ID (returns 200 + confirmation)' },
    ],
    tip: 'DELETE is idempotent — deleting something that\'s already gone returns 404, but the end state is the same.',
  },

  // ─── LEVEL 8 ────────────────────────────────────────────────────────────────
  {
    id: 8,
    title: 'Authentication Headers',
    difficulty: 'Hard',
    concept: 'Bearer Token Auth',
    description:
      'Many APIs require authentication. The most common method is Bearer token authentication — you include a token in the Authorization header. Without it, the server returns 401 Unauthorized.',
    task: 'Access the protected product catalog. The /api/products endpoint requires a Bearer token.\n\nUse this token:\nAuthorization: Bearer secret-token-123\n\nAdd it as a request header to authenticate.',
    hints: [
      'Go to the Headers tab and add a new header.',
      'Key: Authorization',
      'Value: Bearer secret-token-123',
      'Without the correct token, you\'ll get 401 Unauthorized.',
      'With the correct token, you\'ll get 200 OK with the product list.',
    ],
    successMessage: '🔐 You\'re authenticated! Bearer tokens are the backbone of modern API auth (see also: JWT, OAuth).',
    successCriteria: 'GET /api/products with correct Authorization header → 200 OK',
    validate: ({ method, url, requestHeaders, statusCode, responseBody }) => {
      if (method !== 'GET') return false;
      const path = new URL(url, 'http://x').pathname;
      if (path !== '/api/products') return false;
      const authHeader = requestHeaders['authorization'] || requestHeaders['Authorization'] || '';
      if (authHeader !== 'Bearer secret-token-123') return false;
      if (statusCode !== 200) return false;
      return Array.isArray(responseBody) && responseBody.length > 0;
    },
    defaultMethod: 'GET',
    defaultUrl: '/api/products',
    defaultHeaders: [
      { key: 'Authorization', value: 'Bearer secret-token-123' },
    ],
    endpoints: [
      { method: 'GET', path: '/api/products', description: 'List all products (requires auth)', requiresAuth: true },
      { method: 'POST', path: '/api/products', description: 'Create a product (requires auth)', requiresAuth: true },
    ],
    tip: 'Never hardcode tokens in your code. Use environment variables. The token here is for learning only.',
  },

  // ─── LEVEL 9 ────────────────────────────────────────────────────────────────
  {
    id: 9,
    title: 'Nested Resources',
    difficulty: 'Hard',
    concept: 'Resource Hierarchy',
    description:
      'REST APIs often model relationships by nesting resources in the URL. For example, /api/users/1/orders represents "all orders belonging to user 1". This reflects the one-to-many relationship.',
    task: 'Retrieve all orders that belong to user with ID 1. Use the nested resource URL pattern.',
    hints: [
      'The pattern is /api/users/:userId/orders',
      'For user ID 1: /api/users/1/orders',
      'Use GET method.',
      'The response should be an array of orders for that specific user.',
      'Each order will have a userId field matching 1.',
    ],
    successMessage: '🔗 You navigated a nested resource! REST hierarchies make relationships explicit in the URL.',
    successCriteria: 'GET /api/users/1/orders → 200 OK with array of orders',
    validate: ({ method, url, statusCode, responseBody }) => {
      if (method !== 'GET') return false;
      const path = new URL(url, 'http://x').pathname;
      if (path !== '/api/users/1/orders') return false;
      if (statusCode !== 200) return false;
      return Array.isArray(responseBody) && responseBody.length > 0;
    },
    defaultMethod: 'GET',
    defaultUrl: '/api/users/1/orders',
    endpoints: [
      { method: 'GET', path: '/api/users/:id/orders', description: 'Get all orders for a specific user' },
    ],
    tip: 'Nesting more than 2 levels deep (e.g. /a/:id/b/:id/c) is generally discouraged — it becomes hard to read.',
  },

  // ─── LEVEL 10 ───────────────────────────────────────────────────────────────
  {
    id: 10,
    title: 'Full CRUD Challenge',
    difficulty: 'Expert',
    concept: 'CRUD Workflow',
    description:
      'CRUD stands for Create, Read, Update, Delete — the four fundamental operations of any data-driven API. In this final challenge, you must complete the full lifecycle of a product.',
    task: 'Complete the full product lifecycle:\n1. POST to create a new product "API Tester Pro" (price: 29.99, category: "software")\n2. Note the ID from the response\n3. PUT to update its price to 19.99\n4. GET that product to verify the final state\n\nThe level completes when you GET a product with name "API Tester Pro" and price 19.99.',
    hints: [
      'Step 1: POST /api/products with Authorization: Bearer secret-token-123',
      'Step 1 body: {"name":"API Tester Pro","price":29.99,"category":"software","featured":false,"stock":100}',
      'Step 2: Note the "id" field in the 201 response.',
      'Step 3: PUT /api/products/:id with {"price":19.99} (with auth header).',
      'Step 4: GET /api/products/:id (with auth) — if price is 19.99, you win!',
    ],
    successMessage: '🏆 CONGRATULATIONS! You completed the Full CRUD Challenge and finished all 10 levels! You are now an API testing master!',
    successCriteria: 'GET /api/products/:id → 200 OK with name containing "API Tester Pro" and price 19.99',
    validate: ({ method, url, requestHeaders, statusCode, responseBody }) => {
      if (method !== 'GET') return false;
      const path = new URL(url, 'http://x').pathname;
      if (!/^\/api\/products\/\d+$/.test(path)) return false;
      const authHeader = requestHeaders['authorization'] || requestHeaders['Authorization'] || '';
      if (!authHeader.startsWith('Bearer ')) return false;
      if (statusCode !== 200) return false;
      const body = responseBody as Record<string, unknown>;
      return (
        typeof body?.name === 'string' &&
        body.name.includes('API Tester Pro') &&
        body?.price === 19.99
      );
    },
    defaultMethod: 'POST',
    defaultUrl: '/api/products',
    defaultHeaders: [
      { key: 'Content-Type', value: 'application/json' },
      { key: 'Authorization', value: 'Bearer secret-token-123' },
    ],
    defaultBody: JSON.stringify({ name: 'API Tester Pro', price: 29.99, category: 'software', featured: false, stock: 100 }, null, 2),
    endpoints: [
      { method: 'POST', path: '/api/products', description: 'Create a product (auth required)', requiresAuth: true },
      { method: 'PUT', path: '/api/products/:id', description: 'Update a product (auth required)', requiresAuth: true },
      { method: 'GET', path: '/api/products/:id', description: 'Get a product by ID (auth required)', requiresAuth: true },
    ],
    tip: 'This is exactly how QA testers verify CRUD flows in real applications!',
  },

  // ─── LEVEL 11 ───────────────────────────────────────────────────────────────
  {
    id: 11,
    title: 'Partial Update (PATCH)',
    difficulty: 'Medium',
    concept: 'HTTP PATCH',
    description:
      'PATCH updates only the fields you specify, leaving all others unchanged. Unlike PUT — which replaces the whole resource — PATCH is surgical. Ideal when you only need to change one or two fields.',
    task: 'Update only Alice\'s age (user ID 1) to 30. Send a PATCH request with just the age field in the body.',
    hints: [
      'Switch the method to PATCH.',
      'URL: /api/users/1',
      'Body: {"age": 30}',
      'Set Content-Type: application/json.',
      'The response shows the full updated user — only age changed.',
    ],
    successMessage: '✂️ Surgical update! PATCH lets you modify individual fields without overwriting the whole resource.',
    successCriteria: 'PATCH /api/users/1 with {"age":30} → 200 OK with age: 30',
    validate: ({ method, url, statusCode, responseBody }) => {
      if (method !== 'PATCH') return false;
      const path = new URL(url, 'http://x').pathname;
      if (path !== '/api/users/1') return false;
      if (statusCode !== 200) return false;
      const body = responseBody as Record<string, unknown>;
      return body?.age === 30;
    },
    defaultMethod: 'PATCH',
    defaultUrl: '/api/users/1',
    defaultHeaders: [
      { key: 'Content-Type', value: 'application/json' },
    ],
    defaultBody: JSON.stringify({ age: 30 }, null, 2),
    endpoints: [
      { method: 'PATCH', path: '/api/users/:id', description: 'Partially update a user (only specified fields change)' },
    ],
    tip: 'PATCH is more network-efficient than PUT when you only need to change one or two fields.',
  },

  // ─── LEVEL 12 ───────────────────────────────────────────────────────────────
  {
    id: 12,
    title: 'Bad Request (400)',
    difficulty: 'Easy',
    concept: 'HTTP 400',
    description:
      '400 Bad Request means the server couldn\'t process the request due to a client error — usually missing required data, malformed JSON, or incorrect field types.',
    task: 'Intentionally trigger a 400 error. POST to /api/users with a body that\'s missing the required "email" field. The server will reject your request.',
    hints: [
      'Method: POST, URL: /api/users',
      'Send a body with only a "name" field — leave out "email".',
      'Body: {"name": "Test User"}',
      'The server requires both name and email to create a user.',
      'A missing required field causes a 400 Bad Request response.',
    ],
    successMessage: '⚠️ 400 triggered! Studying error responses is just as important as studying success responses.',
    successCriteria: 'POST /api/users with incomplete body → 400 Bad Request',
    validate: ({ method, url, statusCode }) => {
      if (method !== 'POST') return false;
      const path = new URL(url, 'http://x').pathname;
      if (path !== '/api/users') return false;
      return statusCode === 400;
    },
    defaultMethod: 'POST',
    defaultUrl: '/api/users',
    defaultHeaders: [
      { key: 'Content-Type', value: 'application/json' },
    ],
    defaultBody: JSON.stringify({ name: 'Test User' }, null, 2),
    endpoints: [
      { method: 'POST', path: '/api/users', description: 'Create user — requires name and email (returns 400 if missing)' },
    ],
    tip: 'Always read the error body — APIs usually tell you exactly which field is missing or invalid.',
  },

  // ─── LEVEL 13 ───────────────────────────────────────────────────────────────
  {
    id: 13,
    title: 'Unauthorized (401)',
    difficulty: 'Easy',
    concept: 'HTTP 401',
    description:
      '401 Unauthorized means the request lacks valid authentication credentials. The endpoint requires a Bearer token, and without one the server denies access immediately.',
    task: 'Try to access the protected product list at GET /api/products — but DON\'T include any Authorization header. Observe the 401 response.',
    hints: [
      'Method: GET, URL: /api/products',
      'Do NOT add an Authorization header.',
      'Remove any existing auth headers if present.',
      'The server will return 401 Unauthorized.',
      'Read the error message explaining what authentication is needed.',
    ],
    successMessage: '🚫 Access denied — as expected! 401 tells the client to authenticate before retrying.',
    successCriteria: 'GET /api/products without Authorization header → 401',
    validate: ({ method, url, requestHeaders, statusCode }) => {
      if (method !== 'GET') return false;
      const path = new URL(url, 'http://x').pathname;
      if (path !== '/api/products') return false;
      const auth = requestHeaders['authorization'] || requestHeaders['Authorization'] || '';
      if (auth) return false;
      return statusCode === 401;
    },
    defaultMethod: 'GET',
    defaultUrl: '/api/products',
    endpoints: [
      { method: 'GET', path: '/api/products', description: 'List products — returns 401 without valid auth', requiresAuth: true },
    ],
    tip: '401 = unauthenticated (no/wrong credentials). 403 = authenticated but not authorized (no permission).',
  },

  // ─── LEVEL 14 ───────────────────────────────────────────────────────────────
  {
    id: 14,
    title: 'Filter by Role',
    difficulty: 'Easy',
    concept: 'Query Filtering',
    description:
      'APIs support filtering by specific field values. The users endpoint accepts a ?role= parameter to return only users matching that role: admin, user, or moderator.',
    task: 'Retrieve only admin users. Use the role query parameter to filter the user list to admins only.',
    hints: [
      'Method: GET, URL: /api/users?role=admin',
      'Only users with role "admin" will be returned.',
      'Alice is the only admin — expect a single-item array.',
      'Try ?role=moderator or ?role=user to explore other roles.',
    ],
    successMessage: '🎯 Role filter worked! Filtering by field values is a staple of REST API design.',
    successCriteria: 'GET /api/users?role=admin → 200 OK with admin user(s)',
    validate: ({ method, url, statusCode, responseBody }) => {
      if (method !== 'GET') return false;
      const parsed = new URL(url, 'http://x');
      if (parsed.pathname !== '/api/users') return false;
      if (parsed.searchParams.get('role') !== 'admin') return false;
      if (statusCode !== 200) return false;
      return Array.isArray(responseBody) && responseBody.length > 0;
    },
    defaultMethod: 'GET',
    defaultUrl: '/api/users?role=admin',
    endpoints: [
      { method: 'GET', path: '/api/users?role=admin', description: 'Get admin users' },
      { method: 'GET', path: '/api/users?role=user', description: 'Get regular users' },
      { method: 'GET', path: '/api/users?role=moderator', description: 'Get moderators' },
    ],
    tip: 'Combine query params: /api/users?role=admin&name=Alice to narrow results further.',
  },

  // ─── LEVEL 15 ───────────────────────────────────────────────────────────────
  {
    id: 15,
    title: 'Auth + Category Filter',
    difficulty: 'Medium',
    concept: 'Filtered Auth Request',
    description:
      'Real-world API calls often combine multiple requirements: authentication AND query filtering. Here you need a valid Bearer token AND a query parameter — both must be correct.',
    task: 'Fetch only electronics products. You need to:\n1. Include the Authorization header (Bearer token)\n2. Add ?category=electronics to the URL',
    hints: [
      'Method: GET, URL: /api/products?category=electronics',
      'Add header: Authorization: Bearer secret-token-123',
      'Without auth → 401. Without the category filter → all products.',
      'A properly authenticated + filtered request returns only electronics.',
    ],
    successMessage: '🔍 Auth + filtering combined! Most production API calls require both.',
    successCriteria: 'GET /api/products?category=electronics with auth → 200 OK',
    validate: ({ method, url, requestHeaders, statusCode, responseBody }) => {
      if (method !== 'GET') return false;
      const parsed = new URL(url, 'http://x');
      if (parsed.pathname !== '/api/products') return false;
      if (parsed.searchParams.get('category') !== 'electronics') return false;
      const auth = requestHeaders['authorization'] || requestHeaders['Authorization'] || '';
      if (!auth.startsWith('Bearer ')) return false;
      if (statusCode !== 200) return false;
      return Array.isArray(responseBody) && responseBody.length > 0;
    },
    defaultMethod: 'GET',
    defaultUrl: '/api/products?category=electronics',
    defaultHeaders: [
      { key: 'Authorization', value: 'Bearer secret-token-123' },
    ],
    endpoints: [
      { method: 'GET', path: '/api/products?category=:value', description: 'Filter products by category (auth required)', requiresAuth: true },
    ],
    tip: 'Query params filter server-side — only matching items are sent over the network.',
  },

  // ─── LEVEL 16 ───────────────────────────────────────────────────────────────
  {
    id: 16,
    title: 'Boolean Query Filter',
    difficulty: 'Medium',
    concept: 'Boolean Filtering',
    description:
      'Query parameters can carry boolean values as strings ("true"/"false"). APIs use these to filter by flags like featured, active, or published status.',
    task: 'Retrieve only featured products. Use ?featured=true as a query parameter along with the Authorization header.',
    hints: [
      'Method: GET, URL: /api/products?featured=true',
      'Add header: Authorization: Bearer secret-token-123',
      'Boolean query values are sent as strings: "true" or "false".',
      'Wireless Headphones and Ergonomic Mouse are currently featured.',
    ],
    successMessage: '✅ Boolean filter works! The "true"/"false" string pattern is universal in query params.',
    successCriteria: 'GET /api/products?featured=true with auth → 200 OK with featured products',
    validate: ({ method, url, requestHeaders, statusCode, responseBody }) => {
      if (method !== 'GET') return false;
      const parsed = new URL(url, 'http://x');
      if (parsed.pathname !== '/api/products') return false;
      if (parsed.searchParams.get('featured') !== 'true') return false;
      const auth = requestHeaders['authorization'] || requestHeaders['Authorization'] || '';
      if (!auth.startsWith('Bearer ')) return false;
      if (statusCode !== 200) return false;
      return Array.isArray(responseBody) && responseBody.length > 0;
    },
    defaultMethod: 'GET',
    defaultUrl: '/api/products?featured=true',
    defaultHeaders: [
      { key: 'Authorization', value: 'Bearer secret-token-123' },
    ],
    endpoints: [
      { method: 'GET', path: '/api/products?featured=true', description: 'Get featured products (auth required)', requiresAuth: true },
      { method: 'GET', path: '/api/products?featured=false', description: 'Get non-featured products (auth required)', requiresAuth: true },
    ],
    tip: 'Query string values are always strings. The API parses "true" → boolean internally.',
  },

  // ─── LEVEL 17 ───────────────────────────────────────────────────────────────
  {
    id: 17,
    title: 'Authenticated POST',
    difficulty: 'Hard',
    concept: 'Auth + Create',
    description:
      'Creating resources on protected endpoints requires combining a valid Bearer token with a correctly formatted POST body. Both conditions must be satisfied simultaneously.',
    task: 'Create a new product on the protected endpoint. Include both the Authorization header and a valid JSON body with name and price.',
    hints: [
      'Method: POST, URL: /api/products',
      'Add header: Authorization: Bearer secret-token-123',
      'Add header: Content-Type: application/json',
      'Body requires: name (string), price (number).',
      'Optional fields: category, featured (boolean), stock (number).',
      'Success returns 201 Created with the new product including its ID.',
    ],
    successMessage: '🆕 Authenticated creation! Real APIs gate writes behind auth to prevent unauthorized changes.',
    successCriteria: 'POST /api/products with auth + valid body → 201 Created',
    validate: ({ method, url, requestHeaders, statusCode }) => {
      if (method !== 'POST') return false;
      const path = new URL(url, 'http://x').pathname;
      if (path !== '/api/products') return false;
      const auth = requestHeaders['authorization'] || requestHeaders['Authorization'] || '';
      if (!auth.startsWith('Bearer ')) return false;
      return statusCode === 201;
    },
    defaultMethod: 'POST',
    defaultUrl: '/api/products',
    defaultHeaders: [
      { key: 'Authorization', value: 'Bearer secret-token-123' },
      { key: 'Content-Type', value: 'application/json' },
    ],
    defaultBody: JSON.stringify({ name: 'Smart Speaker', price: 79.99, category: 'electronics', featured: false, stock: 25 }, null, 2),
    endpoints: [
      { method: 'POST', path: '/api/products', description: 'Create a product (auth required)', requiresAuth: true, exampleBody: '{"name":"string","price":number,"category":"string","featured":boolean,"stock":number}' },
    ],
    tip: 'When testing auth + creation: verify missing auth gives 401, and missing required fields give 400.',
  },

  // ─── LEVEL 18 ───────────────────────────────────────────────────────────────
  {
    id: 18,
    title: 'Authenticated DELETE',
    difficulty: 'Hard',
    concept: 'Auth + Delete',
    description:
      'Deleting protected resources requires authentication. This prevents unauthenticated users from erasing data. You need the right Bearer token — otherwise the server returns 401.',
    task: 'Delete the "Mechanical Keyboard" product (ID 2) using an authenticated DELETE request. Include your Bearer token.',
    hints: [
      'Method: DELETE, URL: /api/products/2',
      'Add header: Authorization: Bearer secret-token-123',
      'DELETE requests do not need a body.',
      'Without auth → 401 Unauthorized.',
      'Success returns 200 OK with a deletion confirmation message.',
    ],
    successMessage: '🗑️ Authenticated deletion complete! Auth on DELETE prevents unauthorized data loss.',
    successCriteria: 'DELETE /api/products/2 with auth → 200 OK',
    validate: ({ method, url, requestHeaders, statusCode }) => {
      if (method !== 'DELETE') return false;
      const path = new URL(url, 'http://x').pathname;
      if (path !== '/api/products/2') return false;
      const auth = requestHeaders['authorization'] || requestHeaders['Authorization'] || '';
      if (!auth.startsWith('Bearer ')) return false;
      return statusCode === 200;
    },
    defaultMethod: 'DELETE',
    defaultUrl: '/api/products/2',
    defaultHeaders: [
      { key: 'Authorization', value: 'Bearer secret-token-123' },
    ],
    endpoints: [
      { method: 'DELETE', path: '/api/products/:id', description: 'Delete a product (auth required)', requiresAuth: true },
    ],
    tip: 'After deleting, try GET /api/products/2 with auth — you should see a 404 Not Found.',
  },

  // ─── LEVEL 19 ───────────────────────────────────────────────────────────────
  {
    id: 19,
    title: 'Admin Data Snapshot',
    difficulty: 'Hard',
    concept: 'Admin / Debug Endpoints',
    description:
      'Many APIs expose admin or debug endpoints that return a full system snapshot. These are invaluable for QA — you can verify the full state of the database after a series of operations.',
    task: 'Fetch the complete snapshot of all data in the system using the admin endpoint. Inspect the current state of users, products, and orders.',
    hints: [
      'Method: GET, URL: /api/admin/data',
      'No authentication is required for this endpoint.',
      'The response contains three collections: users, products, and orders.',
      'Use this to verify changes made in previous levels.',
      'Great for QA: confirm side-effects of create/update/delete operations.',
    ],
    successMessage: '🔭 Full system snapshot! Admin endpoints give complete visibility into application state.',
    successCriteria: 'GET /api/admin/data → 200 OK with users, products, and orders arrays',
    validate: ({ method, url, statusCode, responseBody }) => {
      if (method !== 'GET') return false;
      const path = new URL(url, 'http://x').pathname;
      if (path !== '/api/admin/data') return false;
      if (statusCode !== 200) return false;
      const body = responseBody as Record<string, unknown>;
      return Array.isArray(body?.users) && Array.isArray(body?.products) && Array.isArray(body?.orders);
    },
    defaultMethod: 'GET',
    defaultUrl: '/api/admin/data',
    endpoints: [
      { method: 'GET', path: '/api/admin/data', description: 'Returns full snapshot: users, products, and orders' },
    ],
    tip: 'In production, always protect admin endpoints behind auth. A public debug route can expose your entire database.',
  },

  // ─── LEVEL 20 ───────────────────────────────────────────────────────────────
  {
    id: 20,
    title: 'The Grand Finale',
    difficulty: 'Expert',
    concept: 'Full API Mastery',
    description:
      'The final challenge combines everything: creating resources, filtering, and verifying results. You\'ll create a new admin user and then confirm they appear in the filtered user list.',
    task: 'Complete the full workflow:\n1. POST /api/users to create "Alex Devlin" with role "admin"\n2. GET /api/users?role=admin to confirm they appear in the admin list\n\nThe level completes when GET /api/users?role=admin returns a response that includes a user named "Alex Devlin".',
    hints: [
      'Step 1: POST /api/users',
      'Step 1 body: {"name":"Alex Devlin","email":"alex@devops.com","role":"admin","age":32}',
      'Step 1: Add header Content-Type: application/json',
      'Step 2: GET /api/users?role=admin',
      'Look for "Alex Devlin" in the returned admin list.',
    ],
    successMessage: '🏆 CONGRATULATIONS! You completed all 20 levels and mastered REST API testing!',
    successCriteria: 'GET /api/users?role=admin → includes a user named "Alex Devlin"',
    validate: ({ method, url, statusCode, responseBody }) => {
      if (method !== 'GET') return false;
      const parsed = new URL(url, 'http://x');
      if (parsed.pathname !== '/api/users') return false;
      if (parsed.searchParams.get('role') !== 'admin') return false;
      if (statusCode !== 200) return false;
      if (!Array.isArray(responseBody)) return false;
      return (responseBody as Record<string, unknown>[]).some(
        u => typeof u.name === 'string' && u.name.includes('Alex Devlin')
      );
    },
    defaultMethod: 'POST',
    defaultUrl: '/api/users',
    defaultHeaders: [
      { key: 'Content-Type', value: 'application/json' },
    ],
    defaultBody: JSON.stringify({ name: 'Alex Devlin', email: 'alex@devops.com', role: 'admin', age: 32 }, null, 2),
    endpoints: [
      { method: 'POST', path: '/api/users', description: 'Create a new user' },
      { method: 'GET', path: '/api/users?role=admin', description: 'Filter users by admin role' },
    ],
    tip: 'You now know: GET, POST, PUT, PATCH, DELETE, query params, path params, auth headers, nested resources, all status codes, and full CRUD workflows. You\'re ready for real API testing!',
  },
];
