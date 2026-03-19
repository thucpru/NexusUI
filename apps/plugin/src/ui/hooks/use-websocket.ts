/**
 * use-websocket.ts
 * WebSocket connection hook for real-time updates (balance, sync status).
 */

import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import type { WsEvent } from '../../types/figma-plugin-types';

const WS_BASE = 'wss://api.nexusui.dev';

export type WsStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface UseWebSocketReturn {
  status: WsStatus;
  send: (event: string, data: unknown) => void;
}

type EventHandler = (data: unknown) => void;

/**
 * Connect to NexusUI WebSocket with auth token.
 * Calls onEvent for each received message.
 * Auto-reconnects on disconnect (up to maxRetries).
 */
export function useWebSocket(
  token: string | null,
  onEvent: (event: WsEvent) => void,
  maxRetries = 3,
): UseWebSocketReturn {
  const [status, setStatus] = useState<WsStatus>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    if (!token) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus('connecting');
    const ws = new WebSocket(`${WS_BASE}?token=${encodeURIComponent(token)}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      retriesRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as WsEvent;
        onEventRef.current(parsed);
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => {
      setStatus('disconnected');
      wsRef.current = null;
      if (retriesRef.current < maxRetries && token) {
        retriesRef.current++;
        const delay = Math.min(1000 * 2 ** retriesRef.current, 30000);
        setTimeout(connect, delay);
      }
    };

    ws.onerror = () => {
      setStatus('error');
    };
  }, [token, maxRetries]);

  useEffect(() => {
    if (!token) {
      wsRef.current?.close();
      setStatus('disconnected');
      return;
    }
    connect();
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [token, connect]);

  const send = useCallback((event: string, data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event, data }));
    }
  }, []);

  return { status, send };
}
