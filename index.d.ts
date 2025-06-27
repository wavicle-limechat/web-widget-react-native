import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';

export interface LimeChatUser {
  name?: string;
  email?: string;
  phone_number?: string;
  identifier_hash?: string;
}

export interface WidgetError {
  code: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  timestamp: string;
  originalError?: Error;
  toJSON(): WidgetErrorData;
}

export interface WidgetErrorData {
  code: string;
  message: string;
  severity: string;
  timestamp: string;
  context?: Record<string, any>;
}

export interface LimeChatWidgetProps {
  websiteToken: string;
  user?: LimeChatUser;
  locale?: string;
  colorScheme?: 'light' | 'dark' | 'auto';
  customAttributes?: Record<string, any>;
  customButton?: React.ReactElement;
  onWidgetLoad?: () => void;
  onWidgetClose?: () => void;
  onError?: (error: WidgetError, errorData: WidgetErrorData) => void;
  style?: ViewStyle;
  iconStyle?: ViewStyle;
  unreadCountStyle?: ViewStyle;
  unreadCountTextStyle?: TextStyle;
}

declare const LimeChatWidget: React.FC<LimeChatWidgetProps>;

export default LimeChatWidget;

// Advanced use cases
export function buildWidgetUrl(params: {
  baseUrl: string;
  websiteToken: string;
  locale?: string;
  colorScheme?: string;
  user?: LimeChatUser;
  customAttributes?: Record<string, any>;
  cwConversation?: string;
}): string;

export function createWidgetUrl(params: {
  baseUrl: string;
  websiteToken: string;
  locale?: string;
  colorScheme?: string;
  user?: LimeChatUser;
  customAttributes?: Record<string, any>;
  cwConversation?: string;
}): string;

// Essential utilities for advanced use cases
export function generateScripts(params: {
  colorScheme?: string;
  user?: LimeChatUser;
  locale?: string;
  customAttributes?: Record<string, any>;
}): string;

// Constants for external configuration
export const POST_MESSAGE_EVENTS: {
  SET_LOCALE: string;
  SET_CUSTOM_ATTRIBUTES: string;
  SET_USER: string;
  SET_COLOR_SCHEME: string;
  WIDGET_LOADED: string;
  CLOSE_WIDGET: string;
  SET_CW_CONVERSATION: string;
  SET_UNREAD_COUNT: string;
};

export const WIDGET_CONFIG: {
  DEFAULT_BASE_URL: string;
  DEFAULT_LOCALE: string;
  DEFAULT_COLOR_SCHEME: string;
  DEFAULT_ICON_SIZE: number;
  DEFAULT_BORDER_RADIUS: number;
};

// Error codes and types
export const ERROR_CODES: {
  CONFIG_ERROR: string;
  WEBVIEW_ERROR: string;
  NETWORK_ERROR: string;
  COMPONENT_ERROR: string;
  UNKNOWN_ERROR: string;
};

export const ERROR_TYPES: {
  CONFIGURATION: string;
  NETWORK: string;
  WEBVIEW: string;
  COMPONENT: string;
  UNKNOWN: string;
};

export const ERROR_SEVERITY: {
  LOW: string;
  MEDIUM: string;
  HIGH: string;
  CRITICAL: string;
};

// Error handling utilities
export class WidgetError extends Error {
  constructor(code: string, message: string, originalError?: Error, context?: Record<string, any>);
  code: string;
  type: string;
  severity: string;
  originalError?: Error;
  context: Record<string, any>;
  timestamp: string;
  toJSON(): WidgetErrorData;
}

export function safeJsonParse<T = any>(jsonString: string, fallback?: T): T | null;
export function reportError(error: Error | WidgetError, onError?: (error: WidgetError, data: WidgetErrorData) => void, context?: Record<string, any>): void;
