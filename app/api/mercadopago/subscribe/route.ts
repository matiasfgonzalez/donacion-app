import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const existing = await prisma.userSubscription.findUnique({
      where: { userId },
    });

    if (existing?.status === 'authorized') {
      return NextResponse.json(
        { error: 'Ya tenés una suscripción activa' },
        { status: 400 },
      );
    }

    const email = user.emailAddresses[0]?.emailAddress;

    const response = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        preapproval_plan_id: process.env.MP_PLAN_ID,
        payer_email: email,
        back_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
        reason: 'Donación mensual - DonaApp',
        external_reference: userId,
        status: 'pending',
      }),
    });

    const data = await response.json();

    if (!data.init_point) {
      console.error('MP Error:', data);
      return NextResponse.json(
        { error: 'Error al crear suscripción' },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: data.init_point });
  } catch (error) {
    console.error('[SUBSCRIBE_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
