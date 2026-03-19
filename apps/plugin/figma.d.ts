/**
 * figma.d.ts — Figma Plugin API type declarations
 * Minimal subset used by NexusUI plugin.
 * Full typings provided by @figma/plugin-typings package.
 */

// The @figma/plugin-typings package provides the complete Figma Plugin API types.
// This file re-exports them and adds any project-specific augmentations.

/// <reference types="@figma/plugin-typings" />

// __html__ is injected by Figma at runtime with the contents of ui.html
declare const __html__: string;
