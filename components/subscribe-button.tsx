'use client';

import { useState } from 'react';

interface Props {
  isSubscribed: boolean;
}

export const SubscribeButton = ({ isSubscribed }: Props) => {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mercadopago/subscribe', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <p className="text-center text-sm text-gray-500">
        Para cancelar tu suscripción, hacelo directamente desde{' '}
        <a
          href="https://www.mercadopago.com.ar/subscriptions"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-600 underline"
        >
          Mercado Pago
        </a>
        .
      </p>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition disabled:opacity-50"
    >
      {loading ? 'Redirigiendo a Mercado Pago...' : '💚 Suscribirme ahora'}
    </button>
  );
};
