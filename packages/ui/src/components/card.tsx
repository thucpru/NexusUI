import * as React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/** Surface card component — Figma flat style */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={[
        'rounded-lg border border-[#383838] bg-[#2C2C2C] p-5',
        'hover:border-[#4D4D4D] transition-colors duration-150',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  ),
);
Card.displayName = 'Card';

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader = ({ children, className = '', ...props }: CardHeaderProps) => (
  <div className={`mb-4 ${className}`} {...props}>{children}</div>
);

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const CardTitle = ({ children, className = '', ...props }: CardTitleProps) => (
  <h3 className={`text-sm font-semibold text-white ${className}`} {...props}>{children}</h3>
);
