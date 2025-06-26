import React from 'react';
import { ViewStyle } from 'react-native';

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
  onWidgetLoad?: () => void;
  onWidgetClose?: () => void;
  onError?: (error: Error, errorInfo?: any) => void;
  style?: ViewStyle;
  iconStyle?: ViewStyle;
}

export const LimeChatWidget: React.FC<LimeChatWidgetProps>;
export default LimeChatWidget;

export const ErrorBoundary: React.ComponentType<any>;
export const WebViewComponent: React.ComponentType<any>;
export const WidgetIcon: React.ComponentType<any>;
export const WidgetModal: React.ComponentType<any>;

export const useWidgetConfig: (baseUrl: string, websiteToken: string) => any;

export * from './src/utils';
export * from './src/constants';
export * from './src/styles';
