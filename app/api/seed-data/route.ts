import { NextResponse } from 'next/server';
import { sql, ensureMockTables, rowToUser, rowToProduct, rowToOrder, rowToCategory, rowToReview, rowToCoupon } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  await ensureMockTables();

  const [userRows, productRows, orderRows, categoryRows, reviewRows, couponRows] = await Promise.all([
    sql`SELECT * FROM mock_users ORDER BY id`,
    sql`SELECT * FROM mock_products ORDER BY id`,
    sql`SELECT * FROM mock_orders ORDER BY id`,
    sql`SELECT * FROM mock_categories ORDER BY id`,
    sql`SELECT * FROM mock_reviews ORDER BY id`,
    sql`SELECT * FROM mock_coupons ORDER BY id`,
  ]);

  return NextResponse.json({
    users: userRows.map(r => rowToUser(r as Record<string, unknown>)),
    products: productRows.map(r => rowToProduct(r as Record<string, unknown>)),
    orders: orderRows.map(r => rowToOrder(r as Record<string, unknown>)),
    categories: categoryRows.map(r => rowToCategory(r as Record<string, unknown>)),
    reviews: reviewRows.map(r => rowToReview(r as Record<string, unknown>)),
    coupons: couponRows.map(r => rowToCoupon(r as Record<string, unknown>)),
  });
}
