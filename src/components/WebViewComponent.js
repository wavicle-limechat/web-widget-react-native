import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { WebView } from 'react-native-webview';
import { POST_MESSAGE_EVENTS, ERROR_CODES } from '../constants';
import { webViewStyles } from '../styles';
import {
  buildWidgetUrl,
  generateScripts,
  getMessage,
  isJsonString,
  shouldOpenExternally,
} from '../utils';
import { WidgetError, safeJsonParse, safeOpenURL, reportError } from '../utils/errorUtils';

const WebViewComponent = ({
  baseUrl,
  websiteToken,
  locale,
  colorScheme,
  hideFilePicker,
  webViewRef,
  user,
  customAttributes,
  cwConversation,
  onWidgetLoad,
  onWebViewUnmount,
  onWidgetClose,
  onUnreadCountUpdate,
  onCwConversationUpdate,
  onError,
}) => {
  const [widgetUrl] = useState(() =>
    buildWidgetUrl({
      baseUrl,
      websiteToken,
      locale,
      colorScheme,
      hideFilePicker,
      customAttributes,
      cwConversation,
    })
  );

  useEffect(() => () => onWebViewUnmount?.(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const injectedJavaScript = generateScripts({ user });

  const onShouldStartLoadWithRequest = (request) => {
    if (shouldOpenExternally(request, baseUrl)) {
      // Use safe URL opening with error handling
      safeOpenURL(request.url).catch(error => {
        reportError(error, onError, {
          action: 'openExternalLink',
          url: request.url
        });
      });
      return false;
    }

    return true;
  };

  const handleMessage = (event) => {
    try {
      const { data } = event.nativeEvent;
      const message = getMessage(data);

      if (isJsonString(message)) {
        // Use safe JSON parsing
        const parsedMessage = safeJsonParse(message);
        if (!parsedMessage) {
          throw new WidgetError(
            ERROR_CODES.WEBVIEW_ERROR,
            'Failed to parse WebView message as JSON',
            null
          );
        }

        const { event: eventType, type, count, cw_conversation } = parsedMessage;

        if (type === POST_MESSAGE_EVENTS.CLOSE_WIDGET) {
          onWidgetClose?.();
        }

        if (eventType === POST_MESSAGE_EVENTS.SET_UNREAD_COUNT) {
          onUnreadCountUpdate?.(count);
        }

        if (eventType === POST_MESSAGE_EVENTS.SET_CW_CONVERSATION) {
          onCwConversationUpdate?.(cw_conversation);
        }
      }
    } catch (error) {
      reportError(error, onError, {
        action: 'handleWebViewMessage'
      });
    }
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    const { url, code, description, domain } = nativeEvent;

    const error = new WidgetError(
      ERROR_CODES.WEBVIEW_ERROR,
      `WebView failed to load: ${nativeEvent.description || 'Unknown error'}`,
      null,
      {
        nativeEvent: { code, description, domain },
        // the query string holds the conversation token and custom attributes
        url: (url || widgetUrl).split('?')[0],
        canGoBack: nativeEvent.canGoBack,
        canGoForward: nativeEvent.canGoForward
      }
    );

    reportError(error, onError, { action: 'webViewLoadError' });
  };

  const handleLoad = () => {
    onWidgetLoad?.();
  };

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: widgetUrl }}
      onMessage={handleMessage}
      onLoad={handleLoad}
      onError={handleError}
      onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
      style={webViewStyles.webview}
      startInLoadingState={true}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      allowsInlineMediaPlayback={true}
      injectedJavaScript={injectedJavaScript}
      scalesPageToFit={false}
      useWebKit={true}
      sharedCookiesEnabled={true}
      scrollEnabled={true}
    />
  );
};

WebViewComponent.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  websiteToken: PropTypes.string.isRequired,
  locale: PropTypes.string,
  colorScheme: PropTypes.oneOf(['light', 'dark', 'auto']),
  hideFilePicker: PropTypes.bool,
  onWebViewUnmount: PropTypes.func,
  webViewRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    phone_number: PropTypes.string,
    identifier: PropTypes.string,
    identifier_hash: PropTypes.string,
  }),
  customAttributes: PropTypes.object,
  cwConversation: PropTypes.string,
  onWidgetLoad: PropTypes.func,
  onWidgetClose: PropTypes.func,
  onUnreadCountUpdate: PropTypes.func,
  onCwConversationUpdate: PropTypes.func,
  onError: PropTypes.func,
};

export default WebViewComponent; 