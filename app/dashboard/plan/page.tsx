'use client';

import { useState, useEffect } from 'react';

interface Plan {
  id: string;
  reason: string;
  status: string;
  init_point: string;
  auto_recurring: {
    frequency: number;
    frequency_type: string;
    transaction_amount: number;
    currency_id: string;
  };
  date_created: string;
}

const FREQUENCY_OPTIONS = [
  { value: 'months', label: 'Mes(es)' },
  { value: 'days', label: 'Día(s)' },
];

export default function PlanPage() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [reason, setReason] = useState('Donación mensual - DonaApp');
  const [amount, setAmount] = useState(100);
  const [currency, setCurrency] = useState('ARS');
  const [frequency, setFrequency] = useState(1);
  const [frequencyType, setFrequencyType] = useState('months');

  const fetchPlan = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/mercadopago/plan');
      const data = await res.json();
      if (data.exists) {
        setPlan(data.plan);
      } else {
        setPlan(null);
      }
    } catch {
      setError('Error al consultar el plan');
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async () => {
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/mercadopago/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason,
          transaction_amount: amount,
          currency_id: currency,
          frequency,
          frequency_type: frequencyType,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setPlan(data.plan);
        setShowForm(false);
      }
    } catch {
      setError('Error al crear el plan');
    } finally {
      setCreating(false);
    }
  };

  const deletePlan = async () => {
    if (
      !confirm(
        '¿Estás seguro de desactivar este plan? Los suscriptores actuales no se verán afectados.',
      )
    )
      return;
    setDeleting(true);
    setError('');
    try {
      const res = await fetch('/api/mercadopago/plan', { method: 'DELETE' });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setPlan(null);
      }
    } catch {
      setError('Error al desactivar el plan');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          ⚙️ Plan de MercadoPago
        </h1>
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        ⚙️ Plan de MercadoPago
      </h1>
      <p className="text-gray-500 mb-8">Administrá el plan de suscripción</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">
          {error}
        </div>
      )}

      {plan ? (
        <div className="bg-white rounded-2xl shadow-md p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-emerald-700">Plan existente</p>
              <p className="text-sm text-gray-500">
                El plan ya está configurado en MercadoPago
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">ID del Plan</p>
              <p className="font-mono text-sm bg-gray-100 rounded px-3 py-2 select-all break-all">
                {plan.id}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Nombre</p>
                <p className="font-medium text-gray-800">{plan.reason}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Estado</p>
                <p className="font-medium text-gray-800">
                  {plan.status === 'active' ? '🟢 Activo' : `🔴 ${plan.status}`}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Monto</p>
                <p className="font-medium text-gray-800">
                  ${plan.auto_recurring?.transaction_amount}{' '}
                  {plan.auto_recurring?.currency_id}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Frecuencia</p>
                <p className="font-medium text-gray-800">
                  Cada {plan.auto_recurring?.frequency}{' '}
                  {plan.auto_recurring?.frequency_type === 'months'
                    ? 'mes(es)'
                    : plan.auto_recurring?.frequency_type}
                </p>
              </div>
            </div>

            {plan.init_point && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Link de checkout</p>
                <a
                  href={plan.init_point}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 underline text-sm break-all"
                >
                  {plan.init_point}
                </a>
              </div>
            )}

            {plan.date_created && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Creado</p>
                <p className="font-medium text-gray-800">
                  {new Date(plan.date_created).toLocaleString('es-AR')}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t">
            <button
              onClick={deletePlan}
              disabled={deleting}
              className="flex-1 px-4 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-semibold hover:bg-red-100 transition disabled:opacity-50"
            >
              {deleting ? 'Desactivando...' : '🗑️ Desactivar plan'}
            </button>
            <button
              onClick={() => {
                setPlan(null);
                setShowForm(true);
              }}
              className="flex-1 px-4 py-3 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl font-semibold hover:bg-emerald-100 transition"
            >
              ➕ Crear nuevo plan
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md p-8">
          {!showForm ? (
            <div className="text-center">
              <div className="text-5xl mb-4">📋</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                No hay plan configurado
              </h2>
              <p className="text-gray-500 mb-6">
                Creá un plan de suscripción en MercadoPago para que los usuarios
                puedan donar.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition"
              >
                ➕ Crear plan de suscripción
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Nuevo plan de suscripción
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre / Razón
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="Donación mensual - DonaApp"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monto
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      min={1}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Moneda
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    >
                      <option value="ARS">ARS</option>
                      <option value="USD">USD</option>
                      <option value="BRL">BRL</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frecuencia
                    </label>
                    <input
                      type="number"
                      value={frequency}
                      onChange={(e) => setFrequency(Number(e.target.value))}
                      min={1}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <select
                      value={frequencyType}
                      onChange={(e) => setFrequencyType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    >
                      {FREQUENCY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowForm(false);
                    fetchPlan();
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={createPlan}
                  disabled={creating || !reason || amount <= 0}
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {creating ? 'Creando...' : '✅ Crear plan'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
