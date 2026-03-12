import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    console.log('[MP_WEBHOOK]', type, data);

    if (type === 'subscription_preapproval') {
      const subscriptionId = data?.id;
      if (!subscriptionId) return new NextResponse('No ID', { status: 400 });

      // Consultamos el estado actualizado a MP
      const response = await fetch(
        `https://api.mercadopago.com/preapproval/${subscriptionId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          },
        },
      );

      const mpData = await response.json();
      const userId = mpData.external_reference;

      if (!userId) {
        console.error('[MP_WEBHOOK] No external_reference found');
        return new NextResponse('No user reference', { status: 400 });
      }

      await prisma.userSubscription.upsert({
        where: { userId },
        create: {
          userId,
          mercadopagoSubscriptionId: mpData.id,
          mercadopagoPlanId: mpData.preapproval_plan_id,
          status: mpData.status,
          currentPeriodEnd: mpData.next_payment_date
            ? new Date(mpData.next_payment_date)
            : null,
        },
        update: {
          status: mpData.status,
          mercadopagoSubscriptionId: mpData.id,
          currentPeriodEnd: mpData.next_payment_date
            ? new Date(mpData.next_payment_date)
            : null,
        },
      });

      console.log(
        `[MP_WEBHOOK] Suscripción actualizada: userId=${userId}, status=${mpData.status}`,
      );
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('[MP_WEBHOOK_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
