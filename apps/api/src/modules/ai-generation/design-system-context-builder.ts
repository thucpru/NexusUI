/**
 * DesignSystemContextBuilder — converts raw design system tokens from DB
 * into a compact, prompt-friendly text format (~2K tokens budget).
 * Snapshot is also stored in the Generation record for audit reproducibility.
 */
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database-service';

export interface DesignSystemSnapshot {
  colors: Record<string, string>;
  typography: Record<string, unknown>;
  spacing: Record<string, string>;
  components: Record<string, unknown>;
}

@Injectable()
export class DesignSystemContextBuilder {
  constructor(private readonly db: DatabaseService) {}

  /** Fetch design system for a project and snapshot it */
  async buildSnapshot(projectId: string): Promise<DesignSystemSnapshot> {
    const ds = await this.db.client.designSystem.findUnique({
      where: { projectId },
    });

    if (!ds) {
      return { colors: {}, typography: {}, spacing: {}, components: {} };
    }

    return {
      colors: this.toStringRecord(ds.colorTokens),
      typography: (ds.typographyTokens as Record<string, unknown>) ?? {},
      spacing: this.toStringRecord(ds.spacingTokens),
      components: (ds.componentTokens as Record<string, unknown>) ?? {},
    };
  }

  /** Convert snapshot → concise prompt-friendly text block */
  snapshotToPromptText(snapshot: DesignSystemSnapshot): string {
    const lines: string[] = ['## Design System Tokens'];

    if (Object.keys(snapshot.colors).length > 0) {
      lines.push('\n### Colors');
      for (const [key, val] of Object.entries(snapshot.colors)) {
        lines.push(`- ${key}: ${val}`);
      }
    }

    if (Object.keys(snapshot.spacing).length > 0) {
      lines.push('\n### Spacing');
      for (const [key, val] of Object.entries(snapshot.spacing)) {
        lines.push(`- ${key}: ${val}`);
      }
    }

    if (Object.keys(snapshot.typography).length > 0) {
      lines.push('\n### Typography');
      const typo = snapshot.typography;
      for (const [key, val] of Object.entries(typo)) {
        lines.push(`- ${key}: ${JSON.stringify(val)}`);
      }
    }

    if (Object.keys(snapshot.components).length > 0) {
      lines.push('\n### Component Tokens');
      const comps = snapshot.components;
      for (const [key, val] of Object.entries(comps)) {
        lines.push(`- ${key}: ${JSON.stringify(val)}`);
      }
    }

    return lines.join('\n');
  }

  private toStringRecord(raw: unknown): Record<string, string> {
    if (!raw || typeof raw !== 'object') return {};
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      result[k] = String(v);
    }
    return result;
  }
}
