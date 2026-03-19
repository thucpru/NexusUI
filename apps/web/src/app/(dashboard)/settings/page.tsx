'use client';

import { UserProfile } from '@clerk/nextjs';

/** General settings page with Clerk profile management */
export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[1.25rem] font-bold text-white">Settings</h1>
        <p className="text-sm text-[#808080] mt-0.5">Manage your profile and account preferences</p>
      </div>

      <UserProfile
        appearance={{
          variables: {
            colorBackground: '#2C2C2C',
            colorInputBackground: '#383838',
            colorInputText: '#FFFFFF',
            colorText: '#FFFFFF',
            colorTextSecondary: '#B3B3B3',
            colorPrimary: '#0C8CE9',
            borderRadius: '8px',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
          elements: {
            card: 'border border-[#383838]',
          },
        }}
      />
    </div>
  );
}
