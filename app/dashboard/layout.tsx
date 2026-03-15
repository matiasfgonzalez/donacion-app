import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col p-6 gap-4">
        <span className="text-xl font-bold text-emerald-600 mb-4">
          💚 DonaApp
        </span>
        <Link
          href="/dashboard"
          className="text-gray-700 hover:text-emerald-600 font-medium"
        >
          🏠 Inicio
        </Link>
        <Link
          href="/dashboard/billing"
          className="text-gray-700 hover:text-emerald-600 font-medium"
        >
          💳 Mi Suscripción
        </Link>
        <Link
          href="/dashboard/plan"
          className="text-gray-700 hover:text-emerald-600 font-medium"
        >
          ⚙️ Plan MP
        </Link>
        <div className="mt-auto flex items-center gap-2">
          <UserButton />
          <span className="text-sm text-gray-500">Mi cuenta</span>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
