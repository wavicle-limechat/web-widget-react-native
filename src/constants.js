export const WOOT_PREFIX = 'limechat-widget:';

export const POST_MESSAGE_EVENTS = {
  SET_LOCALE: 'set-locale',
  SET_CUSTOM_ATTRIBUTES: 'set-custom-attributes',
  SET_USER: 'set-user',
  SET_COLOR_SCHEME: 'set-color-scheme',
  WIDGET_LOADED: 'loaded',
  CLOSE_WIDGET: 'close-widget',
  SET_CW_CONVERSATION: 'set-cw-conversation',
  SET_UNREAD_COUNT: 'set-unread-count',
};

export const COLOR_WHITE = '#fff';
export const BG_COLOR_WHITE = '#FFFFFF';
export const BG_COLOR_DARK = '#25292c';

export const WIDGET_CONFIG = {
  DEFAULT_BASE_URL: 'https://app.limechat.ai',
  DEFAULT_LOCALE: 'en',
  DEFAULT_COLOR_SCHEME: 'light',
  DEFAULT_ICON_SIZE: 60,
  DEFAULT_BORDER_RADIUS: 30,
};

// Error codes for tracking different types of failures
export const ERROR_CODES = {
  // Configuration errors (1000-1099)
  CONFIG_ERROR: 'WIDGET_ERROR_1000',
  
  // WebView errors (1100-1199)  
  WEBVIEW_ERROR: 'WIDGET_ERROR_1100',
  
  // Network errors (1200-1299)
  NETWORK_ERROR: 'WIDGET_ERROR_1200',
  
  // Component errors (1300-1399)
  COMPONENT_ERROR: 'WIDGET_ERROR_1300',
  
  // Unknown/Generic errors (1900-1999)
  UNKNOWN_ERROR: 'WIDGET_ERROR_1900',
};

// Error types for categorization
export const ERROR_TYPES = {
  CONFIGURATION: 'configuration',
  NETWORK: 'network',
  WEBVIEW: 'webview',
  COMPONENT: 'component',
  UNKNOWN: 'unknown',
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',        // Non-critical, widget can continue functioning
  MEDIUM: 'medium',  // Some functionality affected but widget usable
  HIGH: 'high',      // Major functionality broken but widget might recover
  CRITICAL: 'critical', // Widget completely broken, needs immediate attention
}; 