import { NextResponse } from 'next/server';

function notFound() {
  return NextResponse.json({ error: 'Not Found' }, { status: 404 });
}

export { notFound as GET, notFound as POST, notFound as PUT, notFound as PATCH, notFound as DELETE };
