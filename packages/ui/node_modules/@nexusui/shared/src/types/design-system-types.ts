/** A single color token (hex value + optional dark mode variant) */
export interface ColorToken {
  name: string;
  value: string;
  darkValue?: string;
  description?: string;
}

/** A typography token (font family, size, weight, line height) */
export interface TypographyToken {
  name: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing?: number;
  description?: string;
}

/** A spacing / sizing token (numeric value in px) */
export interface SpacingToken {
  name: string;
  value: number;
  description?: string;
}

/** Union of all token types */
export type DesignToken = ColorToken | TypographyToken | SpacingToken;

/** Category grouping for tokens inside a design system */
export interface DesignSystemTokenSet {
  colors: ColorToken[];
  typography: TypographyToken[];
  spacing: SpacingToken[];
}

/** A named design system belonging to a project */
export interface DesignSystem {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  tokens: DesignSystemTokenSet;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}
