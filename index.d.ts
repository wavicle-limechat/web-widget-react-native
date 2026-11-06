import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';

export interface LimeChatUser {
  name?: string;
  email?: string;
  phone_number?: string;
  identifier?: string;
  identifier_hash?: string;
  custom_attributes?: Record<string, any>;
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
  baseUrl?: string;
  user?: LimeChatUser;
  locale?: string;
  colorScheme?: 'light' | 'dark' | 'auto';
  hideFilePicker?: boolean;
  customAttributes?: Record<string, any>;
  customButton?: React.ReactElement;
  conversationToken?: string;
  onConversationTokenChange?: (token: string) => void;
  onWidgetLoad?: () => void;
  onWidgetClose?: () => void;
  onError?: (error: WidgetError, errorData: WidgetErrorData) => void;
  style?: ViewStyle;
  iconStyle?: ViewStyle;
  unreadCount?: number;
  unreadCountStyle?: ViewStyle;
  unreadCountTextStyle?: TextStyle;
}

export interface LimeChatWidgetHandle {
  open(message?: string | { content?: string; submitted_values?: unknown }): void;
  sendMessage(event: string, data?: Record<string, unknown>): boolean;
}

declare const LimeChatWidget: React.ForwardRefExoticComponent<LimeChatWidgetProps & React.RefAttributes<LimeChatWidgetHandle>>;

export default LimeChatWidget;

// Advanced use cases
export function buildWidgetUrl(params: {
  baseUrl: string;
  websiteToken: string;
  locale?: string;
  colorScheme?: string;
  hideFilePicker?: boolean;
  customAttributes?: Record<string, any>;
  cwConversation?: string;
}): string;

// Essential utilities for advanced use cases
export function generateScripts(params: { user?: LimeChatUser }): string;

// Constants for external configuration
export const POST_MESSAGE_EVENTS: {
  SET_LOCALE: string;
  SET_CUSTOM_ATTRIBUTES: string;
  SET_USER: string;
  OPEN_WITH_MESSAGE: string;
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
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  originalError?: Error;
  context: Record<string, any>;
  timestamp: string;
  toJSON(): WidgetErrorData;
}

export function safeJsonParse<T = any>(jsonString: string, fallback?: T): T | null;
export function reportError(error: Error | WidgetError, onError?: (error: WidgetError, data: WidgetErrorData) => void, context?: Record<string, any>): void;
