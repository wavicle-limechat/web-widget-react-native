// Main Widget Component
export { default as LimeChatWidget, default } from './LimeChatWidget';

// Essential utilities for advanced use cases
export { buildWidgetUrl, generateScripts } from './utils';

// Constants for external configuration
export { POST_MESSAGE_EVENTS, WIDGET_CONFIG, ERROR_CODES, ERROR_TYPES, ERROR_SEVERITY } from './constants';

// Error handling utilities
export { WidgetError, safeJsonParse, reportError } from './utils/errorUtils';
