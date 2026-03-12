import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
        <span className="text-2xl font-bold text-emerald-600">💚 DonaApp</span>
        <div className="flex gap-4">
          <Link
            href="/sign-in"
            className="px-4 py-2 text-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-50 transition"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Registrarse
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-32 gap-6">
        <h1 className="text-5xl font-extrabold text-gray-800 max-w-2xl leading-tight">
          Hacé la diferencia con tu donación mensual 💚
        </h1>
        <p className="text-xl text-gray-600 max-w-xl">
          Sumate a nuestra comunidad y apoyá causas que importan. Con una
          pequeña contribución mensual podés generar un gran impacto.
        </p>
        <Link
          href="/sign-up"
          className="mt-4 px-8 py-4 bg-emerald-600 text-white text-lg font-semibold rounded-xl hover:bg-emerald-700 transition shadow-lg"
        >
          Quiero donar →
        </Link>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 pb-24 max-w-5xl mx-auto">
        {[
          {
            icon: '🔒',
            title: 'Seguro',
            desc: 'Pagos procesados por Mercado Pago',
          },
          {
            icon: '🔄',
            title: 'Recurrente',
            desc: 'Donación automática cada mes, cancelable cuando quieras',
          },
          {
            icon: '📊',
            title: 'Transparente',
            desc: 'Accedé a tu panel y seguí el impacto de tu donación',
          },
        ].map((f) => (
          <div
            key={f.title}
            className="bg-white rounded-2xl p-6 shadow-md text-center"
          >
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="text-lg font-bold text-gray-800">{f.title}</h3>
            <p className="text-gray-500 mt-1">{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
