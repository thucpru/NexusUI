import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1E1E1E] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded bg-[#0C8CE9] flex items-center justify-center">
              <span className="text-white text-sm font-bold">N</span>
            </div>
            <span className="text-white font-semibold">NexusUI</span>
          </div>
          <p className="text-sm text-[#808080]">Sign in to your account</p>
        </div>
        <SignIn
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
          }}
        />
      </div>
    </div>
  );
}
