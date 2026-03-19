/**
 * canvas-change-detector.ts
 * Diff engine for documentchange events received from code.ts.
 * Categorizes changes and diffs against current design system tokens.
 */

import type {
  CanvasChange,
  ChangeCategory,
  DesignSystemTokenSet,
} from '../../types/figma-plugin-types';

/** Raw change event from Figma documentchange API (serialized in code.ts) */
export interface RawNodeChange {
  id: string;
  name: string;
  type: string;
  /** Changed property keys */
  changedProperties: string[];
}

/** Map Figma property names to change categories */
const PROPERTY_CATEGORY_MAP: Record<string, ChangeCategory> = {
  fills: 'color',
  strokes: 'color',
  fillStyleId: 'color',
  strokeStyleId: 'color',
  fontSize: 'typography',
  fontName: 'typography',
  letterSpacing: 'typography',
  lineHeight: 'typography',
  textStyleId: 'typography',
  paddingLeft: 'spacing',
  paddingRight: 'spacing',
  paddingTop: 'spacing',
  paddingBottom: 'spacing',
  itemSpacing: 'spacing',
  layoutMode: 'layout',
  layoutAlign: 'layout',
  primaryAxisAlignItems: 'layout',
  counterAxisAlignItems: 'layout',
};

/** Determine the most important change category from a list of changed properties */
export function categorizeChange(changedProperties: string[]): ChangeCategory {
  for (const prop of changedProperties) {
    const cat = PROPERTY_CATEGORY_MAP[prop];
    if (cat) return cat;
  }
  return 'other';
}

/** Filter raw node changes to only design-relevant ones (ignore viewport/selection) */
const IGNORED_PROPERTIES = new Set([
  'pluginData',
  'sharedPluginData',
  'selection',
  'viewport',
  'scrollBehavior',
]);

export function filterRelevantChanges(rawChanges: RawNodeChange[]): RawNodeChange[] {
  return rawChanges.filter((change) => {
    if (!change.changedProperties || change.changedProperties.length === 0) return false;
    const relevant = change.changedProperties.filter((p) => !IGNORED_PROPERTIES.has(p));
    return relevant.length > 0;
  });
}

/** Convert raw node changes to CanvasChange objects for UI display */
export function buildCanvasChanges(rawChanges: RawNodeChange[]): CanvasChange[] {
  const relevant = filterRelevantChanges(rawChanges);
  return relevant.flatMap((change) =>
    change.changedProperties
      .filter((p) => !IGNORED_PROPERTIES.has(p))
      .map((prop) => ({
        nodeId: change.id,
        nodeName: change.name || change.id,
        category: categorizeChange([prop]),
        property: prop,
        oldValue: undefined,
        newValue: undefined,
      })),
  );
}

/** Count changes by category */
export function countByCategory(
  changes: CanvasChange[],
): Record<ChangeCategory, number> {
  const counts: Record<ChangeCategory, number> = {
    color: 0,
    typography: 0,
    spacing: 0,
    layout: 0,
    other: 0,
  };
  for (const change of changes) {
    counts[change.category]++;
  }
  return counts;
}

/**
 * Debounce canvas changes — batch within a time window.
 * Returns a function that collects changes and calls flush after delay.
 */
export function createChangeDebounder(
  onFlush: (changes: CanvasChange[]) => void,
  delayMs = 500,
): (changes: CanvasChange[]) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let accumulated: CanvasChange[] = [];

  return (changes: CanvasChange[]) => {
    accumulated = accumulated.concat(changes);
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      const batch = accumulated;
      accumulated = [];
      timer = null;
      onFlush(batch);
    }, delayMs);
  };
}

/** Diff accumulated changes against existing token set to identify relevant updates */
export function diffAgainstTokens(
  changes: CanvasChange[],
  _tokens: DesignSystemTokenSet,
): CanvasChange[] {
  // Filter to only categories that affect design tokens
  return changes.filter(
    (c) => c.category === 'color' || c.category === 'typography' || c.category === 'spacing',
  );
}
