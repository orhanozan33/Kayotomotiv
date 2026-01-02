import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/config/typeorm';
import { getPool } from '@/lib/config/database';
import { authenticate } from '@/lib/middleware/auth';
import { handleError } from '@/lib/middleware/errorHandler';
import { requireAdmin } from '@/lib/middleware/auth';

const isProduction = process.env.NODE_ENV === 'production';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const resolvedParams = await Promise.resolve(params);
    const result = await getPool().query(`
      SELECT 
        cwa.*,
        cwp.name as package_name,
        cwp.base_price as package_price,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', cwa_addons.id,
              'name', cwa_addons.name,
              'price', cwa_addons.price
            )
          )
          FROM car_wash_addons cwa_addons
          WHERE cwa_addons.id = ANY(
            SELECT json_array_elements_text(COALESCE(cwa.addon_ids, '[]'::jsonb)::json)::uuid
          )
        ), '[]'::json) as addons
      FROM car_wash_appointments cwa
      LEFT JOIN car_wash_packages cwp ON cwa.package_id = cwp.id
      WHERE cwa.id = $1
    `, [resolvedParams.id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const row = result.rows[0];
    const addons = Array.isArray(row.addons) ? row.addons : [];
    const addonsTotal = addons.reduce((sum: number, addon: any) => sum + parseFloat(addon.price || 0), 0);
    const totalPrice = parseFloat(row.package_price || 0) + addonsTotal;

    const appointment = {
      ...row,
      addons: addons.map((a: any) => ({ addon_name: a.name, price: a.price })),
      total_price: totalPrice,
    };

    return NextResponse.json({ appointment });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await initializeDatabase();
    const authResult = await authenticate(request);
    if (authResult.error) return authResult.error;

    const adminError = requireAdmin(authResult.user);
    if (adminError) return adminError;

    const resolvedParams = await Promise.resolve(params);
    const result = await getPool().query(
      `DELETE FROM car_wash_appointments 
       WHERE id = $1
       RETURNING *`,
      [resolvedParams.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Appointment deleted successfully' });
  } catch (error: any) {
    return handleError(error, isProduction);
  }
}

