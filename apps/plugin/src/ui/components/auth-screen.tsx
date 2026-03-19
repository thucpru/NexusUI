/**
 * auth-screen.tsx
 * First-time API token entry screen.
 */

import { h } from 'preact';
import { useState } from 'preact/hooks';

interface Props {
  onSave: (token: string) => Promise<void>;
  error?: string | null;
}

export function AuthScreen({ onSave, error }: Props) {
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) {
      setLocalError('Please enter your API token.');
      return;
    }
    setSaving(true);
    setLocalError(null);
    try {
      await onSave(trimmed);
    } catch {
      setLocalError('Failed to save token. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const displayError = localError ?? error;

  return (
    <div class="auth-screen">
      <div class="auth-screen__icon">🔑</div>
      <h2 class="auth-screen__title">Connect NexusUI</h2>
      <p class="auth-screen__desc">
        Enter your NexusUI API token to get started. Find it in your account settings at
        nexusui.dev.
      </p>
      <form class="auth-screen__form" onSubmit={handleSubmit}>
        <input
          type="password"
          class="input"
          placeholder="nexus_..."
          value={input}
          onInput={(e) => setInput((e.target as HTMLInputElement).value)}
          disabled={saving}
          autoComplete="off"
        />
        {displayError && <p class="auth-screen__error">{displayError}</p>}
        <button type="submit" class="btn btn--primary" disabled={saving || !input.trim()}>
          {saving ? 'Connecting…' : 'Connect'}
        </button>
      </form>
    </div>
  );
}
