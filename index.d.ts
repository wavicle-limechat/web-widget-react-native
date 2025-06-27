import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';

export interface LimeChatUser {
  name?: string;
  email?: string;
  phone_number?: string;
  identifier_hash?: string;
}

export interface LimeChatWidgetProps {
  websiteToken: string;
  user?: LimeChatUser;
  locale?: string;
  colorScheme?: 'light' | 'dark' | 'auto';
  customAttributes?: Record<string, any>;
  customIcon?: React.ReactElement;
  onWidgetLoad?: () => void;
  onWidgetClose?: () => void;
  onError?: (error: Error, errorInfo?: any) => void;
  style?: ViewStyle;
  iconStyle?: ViewStyle;
  unreadCountStyle?: ViewStyle;
  unreadCountTextStyle?: TextStyle;
}

export const LimeChatWidget: React.FC<LimeChatWidgetProps>;
export default LimeChatWidget;

// Essential utilities for advanced use cases
export function buildWidgetUrl(params: {
  baseUrl: string;
  websiteToken: string;
  locale?: string;
  colorScheme?: string;
  user?: LimeChatUser;
  customAttributes?: Record<string, any>;
  cwConversation?: string;
}): string;

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
