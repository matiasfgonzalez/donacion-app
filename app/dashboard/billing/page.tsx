import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getUserSubscription } from '@/lib/subscription';
import { SubscribeButton } from '@/components/subscribe-button';

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ preapproval_id?: string }>;
}) {
  const { preapproval_id } = await searchParams;

  // If MP redirected back with a preapproval_id, sync the subscription immediately
  if (preapproval_id) {
    const { userId } = await auth();
    if (userId) {
      try {
        const mpRes = await fetch(
          `https://api.mercadopago.com/preapproval/${preapproval_id}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
            },
          },
        );
        if (mpRes.ok) {
          const mpData = await mpRes.json();
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
              mercadopagoSubscriptionId: mpData.id,
              mercadopagoPlanId: mpData.preapproval_plan_id,
              status: mpData.status,
              currentPeriodEnd: mpData.next_payment_date
                ? new Date(mpData.next_payment_date)
                : null,
            },
          });
        }
      } catch (e) {
        console.error('[BILLING_SYNC_ERROR]', e);
      }
    }
  }

  const subscription = await getUserSubscription();
  const isActive = subscription?.status === 'authorized';

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        💳 Mi Suscripción
      </h1>
      <p className="text-gray-500 mb-8">Gestioná tu donación mensual</p>

      <div className="bg-white rounded-2xl shadow-md p-8">
        {/* Estado actual */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b">
          <div>
            <p className="text-sm text-gray-500">Estado</p>
            <p
              className={`text-lg font-semibold ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}
            >
              {isActive ? '✅ Activa' : '❌ Sin suscripción'}
            </p>
          </div>
          {subscription?.currentPeriodEnd && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Próximo cobro</p>
              <p className="text-lg font-semibold text-gray-700">
                {new Date(subscription.currentPeriodEnd).toLocaleDateString(
                  'es-AR',
                )}
              </p>
            </div>
          )}
        </div>

        {/* Plan */}
        <div className="bg-emerald-50 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Plan Donador 💚
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Donación mensual recurrente
              </p>
              <ul className="mt-3 space-y-1 text-sm text-gray-600">
                <li>✓ Acceso al panel completo</li>
                <li>✓ Menú premium desbloqueado</li>
                <li>✓ Cancelable en cualquier momento</li>
              </ul>
            </div>
            <div className="text-right">
              <p className="text-3xl font-extrabold text-emerald-600">$X</p>
              <p className="text-sm text-gray-400">/mes</p>
            </div>
          </div>
        </div>

        {/* Botón de acción */}
        <SubscribeButton isSubscribed={isActive} />
      </div>
    </div>
  );
}
