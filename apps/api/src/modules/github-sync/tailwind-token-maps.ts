/**
 * tailwind-token-maps.ts — Tailwind CSS class → design token value mappings.
 * Used by CodeParserService to extract design tokens from component class names.
 */

/** Tailwind color class → hex (subset for MVP) */
export const TAILWIND_COLOR_MAP: Record<string, string> = {
  'text-white': '#ffffff',
  'text-black': '#000000',
  'bg-white': '#ffffff',
  'bg-black': '#000000',
  'text-blue-500': '#3b82f6',
  'bg-blue-500': '#3b82f6',
  'text-gray-500': '#6b7280',
  'bg-gray-100': '#f3f4f6',
  'bg-gray-50': '#f9fafb',
  'text-red-500': '#ef4444',
  'bg-red-500': '#ef4444',
  'text-green-500': '#22c55e',
  'bg-green-500': '#22c55e',
};

/** Tailwind spacing class → px value */
export const TAILWIND_SPACING_MAP: Record<string, string> = {
  'p-1': '4px', 'p-2': '8px', 'p-3': '12px', 'p-4': '16px',
  'p-6': '24px', 'p-8': '32px', 'p-12': '48px',
  'px-4': '16px', 'py-4': '16px', 'gap-2': '8px', 'gap-4': '16px',
  'm-2': '8px', 'm-4': '16px', 'mt-4': '16px', 'mb-4': '16px',
};
