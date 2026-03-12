import { isSubscribed } from '@/lib/subscription';
import Link from 'next/link';

// Menú random de ejemplo (solo para suscriptores)
const PREMIUM_MENU = [
  { icon: '🎯', label: 'Mis Metas', href: '#' },
  { icon: '📈', label: 'Estadísticas', href: '#' },
  { icon: '🏆', label: 'Logros', href: '#' },
  { icon: '💬', label: 'Comunidad', href: '#' },
  { icon: '📚', label: 'Recursos', href: '#' },
  { icon: '🎁', label: 'Beneficios', href: '#' },
];

export default async function DashboardPage() {
  const subscribed = await isSubscribed();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        ¡Bienvenido al panel! 👋
      </h1>
      <p className="text-gray-500 mb-8">
        {subscribed
          ? 'Gracias por tu apoyo. Tenés acceso completo a todas las funciones.'
          : 'Suscribite para desbloquear todas las funciones.'}
      </p>

      {subscribed ? (
        <>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-8 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-emerald-700">
                Suscripción activa
              </p>
              <p className="text-sm text-emerald-600">
                Tenés acceso a todo el contenido premium
              </p>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            🔓 Menú Premium
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PREMIUM_MENU.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col items-center gap-2 text-center"
              >
                <span className="text-3xl">{item.icon}</span>
                <span className="font-medium text-gray-700">{item.label}</span>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl shadow-md p-8 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Contenido bloqueado
          </h2>
          <p className="text-gray-500 mb-6">
            Suscribite para acceder al menú completo y todas las funciones.
          </p>
          <Link
            href="/dashboard/billing"
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition"
          >
            Ver planes →
          </Link>
        </div>
      )}
    </div>
  );
}
