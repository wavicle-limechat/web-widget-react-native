// Main Widget Component
export { default as LimeChatWidget, default } from './LimeChatWidget';

// Essential utilities for advanced use cases
import { buildWidgetUrl } from './utils';

export { buildWidgetUrl, generateScripts } from './utils';

/** @deprecated Use buildWidgetUrl instead. Will be removed in the next major release. */
export const createWidgetUrl = buildWidgetUrl;

// Constants for external configuration
export { POST_MESSAGE_EVENTS, WIDGET_CONFIG, ERROR_CODES, ERROR_TYPES, ERROR_SEVERITY } from './constants';

// Error handling utilities
export { WidgetError, safeJsonParse, reportError } from './utils/errorUtils';
