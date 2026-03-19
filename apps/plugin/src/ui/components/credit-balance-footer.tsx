/**
 * credit-balance-footer.tsx
 * Sticky footer displaying credit balance with real-time WebSocket updates.
 */

import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { fetchBalance } from '../lib/api-client';
import { useWebSocket } from '../hooks/use-websocket';
import type { WsEvent, BalanceUpdateEvent } from '../../types/figma-plugin-types';

interface Props {
  token: string | null;
}

function formatCredits(n: number): string {
  return n.toLocaleString();
}

function getBalanceColor(balance: number): string {
  if (balance <= 0) return 'var(--color-error)';
  if (balance < 100) return 'var(--color-warning)';
  return 'var(--color-accent)';
}

export function CreditBalanceFooter({ token }: Props) {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initial balance fetch
  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    fetchBalance(token)
      .then((data) => setBalance(data.balance))
      .catch(() => setBalance(null))
      .finally(() => setIsLoading(false));
  }, [token]);

  // Real-time updates via WebSocket
  const handleWsEvent = (event: WsEvent) => {
    if (event.event === 'balance.update') {
      const data = event.data as BalanceUpdateEvent;
      setBalance(data.balance);
    }
  };

  useWebSocket(token, handleWsEvent);

  if (!token) return null;

  return (
    <footer class="credit-footer">
      <span class="credit-footer__label">Credits</span>
      {isLoading ? (
        <span class="credit-footer__value credit-footer__value--loading">—</span>
      ) : balance !== null ? (
        <span
          class="credit-footer__value"
          style={{ color: getBalanceColor(balance) }}
          title={`${balance} credits remaining`}
        >
          {formatCredits(balance)}
        </span>
      ) : (
        <span class="credit-footer__value credit-footer__value--error">Error</span>
      )}
    </footer>
  );
}
