import { ERROR_CODES, ERROR_TYPES, ERROR_SEVERITY } from '../constants';

/**
 * Widget Error class for structured error reporting
 */
export class WidgetError extends Error {
  constructor(code, message, originalError = null, context = {}) {
    super(message);
    this.name = 'WidgetError';
    this.code = code;
    this.type = this.getErrorType(code);
    this.severity = this.getErrorSeverity(code);
    this.originalError = originalError;
    this.context = context;
    this.timestamp = new Date().toISOString();
    
    // Maintain stack trace for debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WidgetError);
    }
  }

  getErrorType(code) {
    if (!code || typeof code !== 'string') {
      return ERROR_TYPES.UNKNOWN;
    }
    
    if (code.includes('1000')) {
      return ERROR_TYPES.CONFIGURATION;
    }
    if (code.includes('1100')) {
      return ERROR_TYPES.WEBVIEW;
    }
    if (code.includes('1200')) {
      return ERROR_TYPES.NETWORK;
    }
    if (code.includes('1300')) {
      return ERROR_TYPES.COMPONENT;
    }
    return ERROR_TYPES.UNKNOWN;
  }

  getErrorSeverity(code) {
    if (!code) {
      return ERROR_SEVERITY.LOW;
    }
    
    // Configuration errors are critical - widget can't function
    if (code === ERROR_CODES.CONFIG_ERROR) return ERROR_SEVERITY.CRITICAL;
    
    // WebView and Network errors are high - major functionality affected
    if (code === ERROR_CODES.WEBVIEW_ERROR || code === ERROR_CODES.NETWORK_ERROR) {
      return ERROR_SEVERITY.HIGH;
    }
    
    // Component errors are medium - some functionality affected
    if (code === ERROR_CODES.COMPONENT_ERROR) return ERROR_SEVERITY.MEDIUM;
    
    // Unknown errors are low by default
    return ERROR_SEVERITY.LOW;
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      type: this.type,
      severity: this.severity,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
      originalError: this.originalError ? {
        name: this.originalError.name,
        message: this.originalError.message,
        stack: this.originalError.stack,
      } : null,
    };
  }
}

/**
 * Safe JSON parser that doesn't throw
 */
export const safeJsonParse = (jsonString, fallback = null) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON:', error.message);
    return fallback;
  }
};

/**
 * Safe async operation wrapper
 */
export const safeAsync = async (operation, fallback = null, errorCode = ERROR_CODES.UNKNOWN_ERROR) => {
  try {
    return await operation();
  } catch (error) {
    console.warn(`Safe async operation failed:`, error);
    throw new WidgetError(
      errorCode,
      `Operation failed: ${error.message}`,
      error,
      { operation: operation.name || 'anonymous' }
    );
  }
};

/**
 * Validate required props
 */
export const validateRequiredProps = (props, requiredProps) => {
  const missing = requiredProps.filter(prop => !props[prop]);
  if (missing.length > 0) {
    throw new WidgetError(
      ERROR_CODES.CONFIG_ERROR,
      `Missing required props: ${missing.join(', ')}`,
      null,
      { missingProps: missing }
    );
  }
};

/**
 * Safe external link opening
 */
export const safeOpenURL = async (url) => {
  try {
    const { Linking } = require('react-native');
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      throw new Error(`Cannot open URL: ${url}`);
    }
  } catch (error) {
    throw new WidgetError(
      ERROR_CODES.COMPONENT_ERROR,
      `Failed to open external link: ${error.message}`,
      error,
      { url }
    );
  }
};

/**
 * Error reporter - calls onError callback with structured error
 */
export const reportError = (error, onError, context = {}) => {
  if (!onError) return;
  
  let structuredError;
  if (error instanceof WidgetError) {
    structuredError = error;
  } else {
    structuredError = new WidgetError(
      ERROR_CODES.UNKNOWN_ERROR,
      error.message || 'Unknown error occurred',
      error,
      context
    );
  }
  
  // Log error for debugging
  // eslint-disable-next-line no-console
  console.error('LimeChat Widget Error:', structuredError.toJSON());
  
  // Call the user's error handler
  try {
    onError(structuredError, structuredError.toJSON());
  } catch (callbackError) {
    // eslint-disable-next-line no-console
    console.error('Error in onError callback:', callbackError);
  }
};

/**
 * Validation helpers
 */
export const validators = {
  websiteToken: (token) => {
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      throw new WidgetError(
        ERROR_CODES.CONFIG_ERROR,
        'Website token is required and must be a non-empty string',
        null,
        { providedToken: token }
      );
    }
  },
  
  user: (user) => {
    if (user && typeof user !== 'object') {
      throw new WidgetError(
        ERROR_CODES.CONFIG_ERROR,
        'User data must be an object',
        null,
        { providedUser: user }
      );
    }
  },
  
  customAttributes: (attributes) => {
    if (attributes && typeof attributes !== 'object') {
      throw new WidgetError(
        ERROR_CODES.CONFIG_ERROR,
        'Custom attributes must be an object',
        null,
        { providedAttributes: attributes }
      );
    }
  },
}; 