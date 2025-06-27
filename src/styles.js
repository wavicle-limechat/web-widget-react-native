import { StyleSheet } from 'react-native';
import { WIDGET_CONFIG } from './constants';

export const widgetStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 999,
  },
  iconButton: {
    backgroundColor: 'transparent',
    position: 'relative',
  },
  unreadCount: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  unreadCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  widgetIcon: {
    width: WIDGET_CONFIG.DEFAULT_ICON_SIZE,
    height: WIDGET_CONFIG.DEFAULT_ICON_SIZE,
    borderRadius: WIDGET_CONFIG.DEFAULT_BORDER_RADIUS,
  },
  defaultIcon: {
    width: WIDGET_CONFIG.DEFAULT_ICON_SIZE,
    height: WIDGET_CONFIG.DEFAULT_ICON_SIZE,
    borderRadius: WIDGET_CONFIG.DEFAULT_BORDER_RADIUS,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
    color: 'white',
  },
  loadingText: {
    fontSize: 16,
    color: 'white',
  },
  errorContainer: {
    backgroundColor: '#ff4444',
    borderRadius: 8,
    padding: 12,
    maxWidth: 200,
  },
  errorText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorDetails: {
    color: '#ffcccc',
    fontSize: 10,
    marginTop: 4,
  },
});

export const modalStyles = StyleSheet.create({
  modal: {
    margin: 0,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export const webViewStyles = StyleSheet.create({
  webview: {
    flex: 1,
  },
});