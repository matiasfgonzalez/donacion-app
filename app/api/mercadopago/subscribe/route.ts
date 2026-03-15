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

    // Fetch the plan's init_point (hosted checkout by MercadoPago)
    const planResponse = await fetch(
      `https://api.mercadopago.com/preapproval_plan/${process.env.MP_PLAN_ID}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      },
    );

    const plan = await planResponse.json();

    if (!plan.init_point) {
      console.error('[MP_PLAN_ERROR]', plan);
      return NextResponse.json(
        { error: 'Error al obtener el plan de suscripción' },
        { status: 500 },
      );
    }

    // Save a pending record in DB so the webhook can find userId by payer email
    await prisma.userSubscription.upsert({
      where: { userId },
      create: { userId, payerEmail: email ?? null, status: 'pending' },
      update: { payerEmail: email ?? null, status: 'pending' },
    });

    const checkoutUrl = new URL(plan.init_point);
    if (email) checkoutUrl.searchParams.set('payer_email', email);

    return NextResponse.json({ url: checkoutUrl.toString() });
  } catch (error) {
    console.error('[SUBSCRIBE_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
