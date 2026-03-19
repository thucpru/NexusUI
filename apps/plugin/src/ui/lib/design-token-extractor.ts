/**
 * design-token-extractor.ts
 * Parse raw Figma node data sent from code.ts and convert to DesignSystemTokenSet.
 * Runs in the UI thread — receives plain serialized data, no Figma API access.
 */

import type {
  ColorToken,
  TypographyToken,
  SpacingToken,
  DesignSystemTokenSet,
} from '../../types/figma-plugin-types';

/** Raw paint style data serialized from Figma sandbox */
export interface RawPaintStyle {
  id: string;
  name: string;
  /** Solid paint RGB (0–1 range) */
  r: number;
  g: number;
  b: number;
  a: number;
}

/** Raw text style data serialized from Figma sandbox */
export interface RawTextStyle {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeightPx: number;
  letterSpacing: number;
}

/** Raw spacing values extracted from auto-layout nodes */
export interface RawSpacingValue {
  name: string;
  value: number;
}

export interface RawTokenData {
  paintStyles: RawPaintStyle[];
  textStyles: RawTextStyle[];
  spacingValues: RawSpacingValue[];
}

/** Convert a 0-1 RGB channel to a 0-255 hex pair */
function channelToHex(c: number): string {
  return Math.round(c * 255)
    .toString(16)
    .padStart(2, '0');
}

/** Convert normalized RGBA to CSS hex string */
function rgbaToHex(r: number, g: number, b: number, a: number): string {
  const hex = `#${channelToHex(r)}${channelToHex(g)}${channelToHex(b)}`;
  if (a < 1) {
    return hex + channelToHex(a);
  }
  return hex;
}

/** Extract ColorToken array from raw paint styles */
export function extractColors(paintStyles: RawPaintStyle[]): ColorToken[] {
  return paintStyles.map((ps) => ({
    name: ps.name,
    value: rgbaToHex(ps.r, ps.g, ps.b, ps.a),
  }));
}

/** Extract TypographyToken array from raw text styles */
export function extractTypography(textStyles: RawTextStyle[]): TypographyToken[] {
  return textStyles.map((ts) => {
    const token: TypographyToken = {
      name: ts.name,
      fontFamily: ts.fontFamily,
      fontSize: ts.fontSize,
      fontWeight: ts.fontWeight,
      lineHeight: Math.round(ts.lineHeightPx),
    };
    if (ts.letterSpacing !== 0) {
      token.letterSpacing = ts.letterSpacing;
    }
    return token;
  });
}

/** Extract SpacingToken array from raw spacing values (deduplicated) */
export function extractSpacing(spacingValues: RawSpacingValue[]): SpacingToken[] {
  const seen = new Set<number>();
  return spacingValues
    .filter((sv) => {
      if (sv.value <= 0 || seen.has(sv.value)) return false;
      seen.add(sv.value);
      return true;
    })
    .sort((a, b) => a.value - b.value)
    .map((sv) => ({
      name: sv.name,
      value: sv.value,
    }));
}

/** Parse raw token data into a full DesignSystemTokenSet */
export function parseRawTokens(raw: RawTokenData): DesignSystemTokenSet {
  return {
    colors: extractColors(raw.paintStyles),
    typography: extractTypography(raw.textStyles),
    spacing: extractSpacing(raw.spacingValues),
  };
}
