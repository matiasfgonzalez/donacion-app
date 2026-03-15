import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const planId = process.env.MP_PLAN_ID;

    if (planId) {
      const response = await fetch(
        `https://api.mercadopago.com/preapproval_plan/${planId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          },
        },
      );

      if (response.ok) {
        const plan = await response.json();
        return NextResponse.json({ exists: true, plan });
      }
    }

    return NextResponse.json({ exists: false, plan: null });
  } catch (error) {
    console.error('[PLAN_GET_ERROR]', error);
    return NextResponse.json(
      { error: 'Error al consultar el plan' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      reason,
      transaction_amount,
      currency_id,
      frequency,
      frequency_type,
    } = body;

    const response = await fetch(
      'https://api.mercadopago.com/preapproval_plan',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason || 'Donación mensual - DonaApp',
          auto_recurring: {
            frequency: frequency || 1,
            frequency_type: frequency_type || 'months',
            transaction_amount: transaction_amount || 100,
            currency_id: currency_id || 'ARS',
          },
          back_url: 'https://donacion-app.vercel.app/dashboard/billing',
          status: 'active',
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('[PLAN_CREATE_ERROR]', data);
      return NextResponse.json(
        { error: 'Error al crear el plan', details: data },
        { status: 500 },
      );
    }

    return NextResponse.json({ plan: data });
  } catch (error) {
    console.error('[PLAN_CREATE_ERROR]', error);
    return NextResponse.json(
      { error: 'Error al crear el plan' },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const planId = process.env.MP_PLAN_ID;
    if (!planId) {
      return NextResponse.json(
        { error: 'No hay plan configurado' },
        { status: 400 },
      );
    }

    // MercadoPago no permite eliminar planes, pero sí desactivarlos
    const response = await fetch(
      `https://api.mercadopago.com/preapproval_plan/${planId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'inactive' }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('[PLAN_DELETE_ERROR]', data);
      return NextResponse.json(
        { error: 'Error al desactivar el plan', details: data },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, plan: data });
  } catch (error) {
    console.error('[PLAN_DELETE_ERROR]', error);
    return NextResponse.json(
      { error: 'Error al desactivar el plan' },
      { status: 500 },
    );
  }
}
