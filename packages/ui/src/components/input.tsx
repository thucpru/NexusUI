import * as React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/** Input component following Figma design tokens */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs text-[#B3B3B3] mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full h-9 px-3 rounded-md text-sm',
            'bg-[#2C2C2C] border text-white placeholder:text-[#808080]',
            'focus:outline-none focus:ring-1 transition-colors duration-150',
            error
              ? 'border-[#F24822] focus:border-[#F24822] focus:ring-[rgba(242,72,34,0.2)]'
              : 'border-[#383838] focus:border-[#0C8CE9] focus:ring-[rgba(12,140,233,0.2)]',
            className,
          ].join(' ')}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-[#F24822]">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
