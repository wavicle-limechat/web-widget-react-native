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
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
    color: '#007bff',
  },
  loadingText: {
    fontSize: 16,
    color: 'white',
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
  headerView: {
    flex: 0,
  },
  mainView: {
    flex: 1,
  },
});

export const webViewStyles = StyleSheet.create({
  webview: {
    flex: 1,
  },
});

export const errorBoundaryStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 999,
  },
  errorContainer: {
    backgroundColor: '#ff4444',
    borderRadius: 8,
    padding: 12,
    maxWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  errorMessage: {
    color: 'white',
    fontSize: 12,
    lineHeight: 16,
  },
  errorDetails: {
    color: '#ffcccc',
    fontSize: 10,
    marginTop: 4,
    fontFamily: 'monospace',
  },
}); 