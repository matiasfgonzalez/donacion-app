import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    console.log('[MP_WEBHOOK] Received:', JSON.stringify(body));

    if (type === 'subscription_preapproval') {
      const subscriptionId = data?.id;
      if (!subscriptionId) {
        console.error('[MP_WEBHOOK] No subscription ID in data');
        return NextResponse.json({ received: true }, { status: 200 });
      }

      // Fetch the subscription details from MercadoPago
      const response = await fetch(
        `https://api.mercadopago.com/preapproval/${subscriptionId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          },
        },
      );

      if (!response.ok) {
        // For test/simulated webhooks, MP sends fake IDs that don't exist
        console.warn(
          `[MP_WEBHOOK] Could not fetch preapproval ${subscriptionId}: ${response.status}`,
        );
        return NextResponse.json({ received: true }, { status: 200 });
      }

      const mpData = await response.json();
      let userId = mpData.external_reference;

      // Fallback: find userId by payer email saved at subscription initiation
      if (!userId && mpData.payer_email) {
        const record = await prisma.userSubscription.findFirst({
          where: { payerEmail: mpData.payer_email },
        });
        userId = record?.userId ?? null;
      }

      if (!userId) {
        console.warn(
          '[MP_WEBHOOK] No external_reference or matching email, skipping',
        );
        return NextResponse.json({ received: true }, { status: 200 });
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
          payerEmail: mpData.payer_email ?? undefined,
        },
      });

      console.log(
        `[MP_WEBHOOK] Subscription updated: userId=${userId}, status=${mpData.status}`,
      );
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[MP_WEBHOOK_ERROR]', error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
