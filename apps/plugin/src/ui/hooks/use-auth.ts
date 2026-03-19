/**
 * use-auth.ts
 * API token management — read/write from Figma clientStorage via code.ts bridge.
 */

import { useState, useEffect, useCallback } from 'preact/hooks';
import { sendToCode } from '../lib/figma-api-bridge';
import type { AuthResultPayload } from '../../types/figma-plugin-types';

export interface UseAuthReturn {
  token: string | null;
  isLoading: boolean;
  saveToken: (token: string) => Promise<void>;
  clearToken: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from clientStorage on mount
  useEffect(() => {
    sendToCode<undefined, AuthResultPayload>('AUTH_GET')
      .then((result) => {
        setToken(result.token);
      })
      .catch(() => {
        setToken(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const saveToken = useCallback(async (newToken: string) => {
    await sendToCode('AUTH_SET', { token: newToken });
    setToken(newToken);
  }, []);

  const clearToken = useCallback(async () => {
    await sendToCode('AUTH_SET', { token: '' });
    setToken(null);
  }, []);

  return { token, isLoading, saveToken, clearToken };
}
