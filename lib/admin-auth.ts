import crypto from 'crypto';

const ADMIN_PASSWORD = 'idoido10';

function generateToken(): string {
  return crypto.createHash('sha256').update(ADMIN_PASSWORD + '-admin-session').digest('hex');
}

export function verifyToken(token: string): boolean {
  return token === generateToken();
}

export function checkAuth(request: Request): boolean {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace('Bearer ', '');
  return verifyToken(token);
}
