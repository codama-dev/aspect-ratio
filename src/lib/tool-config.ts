/**
 * TOOL CONFIGURATION
 *
 * Update these values for each new tool.
 * This is the single source of truth for tool-specific settings.
 */

export const TOOL_CONFIG = {
  /** Display name of the tool (e.g. "JSON Formatter") */
  name: 'Aspect Ratio Calculator',

  /** Short tagline (e.g. "Format and validate JSON instantly") */
  tagline: 'Calculate aspect ratios and resize dimensions proportionally',

  /** Full URL of the deployed tool */
  url: 'https://free-aspect-ratio.codama.dev/',

  /** localStorage key prefix to avoid collisions between tools */
  storagePrefix: 'codama-aspect-ratio',
} as const
