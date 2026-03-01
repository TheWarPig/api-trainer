import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

const SECRET_TOKEN = 'Bearer secret-token-123';

function checkAuth(request: NextRequest) {
  const auth = request.headers.get('authorization') || request.headers.get('Authorization') || '';
  return auth === SECRET_TOKEN;
}

type Params = { params: { id: string } };

export async function GET(request: NextRequest, { params }: Params) {
  const productId = parseInt(params.id, 10);
  const { searchParams } = new URL(request.url);
  const minRating = searchParams.get('min_rating');

  let reviews = db.reviews.filter(r => r.productId === productId);

  if (minRating) {
    const minR = parseInt(minRating, 10);
    reviews = reviews.filter(r => r.rating >= minR);
  }

  return NextResponse.json(reviews);
}

export async function POST(request: NextRequest, { params }: Params) {
  if (!checkAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized. Include Authorization: Bearer secret-token-123 header.' },
      { status: 401 }
    );
  }

  const productId = parseInt(params.id, 10);
  const product = db.products.find(p => p.id === productId);

  if (!product) {
    return NextResponse.json({ error: `Product with id ${productId} not found.` }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { rating, comment, userId } = body as { rating?: number; comment?: string; userId?: number };

  if (rating === undefined || !comment) {
    return NextResponse.json({ error: 'Missing required fields: rating, comment' }, { status: 400 });
  }

  const ratingNum = Number(rating);
  if (ratingNum < 1 || ratingNum > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5.' }, { status: 400 });
  }

  const newReview = {
    id: db.nextReviewId++,
    productId,
    userId: typeof userId === 'number' ? userId : 1,
    rating: ratingNum,
    comment: String(comment),
    createdAt: new Date().toISOString(),
  };

  db.reviews.push(newReview);

  return NextResponse.json(newReview, { status: 201 });
}
