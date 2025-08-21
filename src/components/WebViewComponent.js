import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { WebView } from 'react-native-webview';
import { POST_MESSAGE_EVENTS, ERROR_CODES } from '../constants';
import { webViewStyles } from '../styles';
import {
  buildWidgetUrl,
  generateScripts,
  getMessage,
  isJsonString
} from '../utils';
import { WidgetError, safeJsonParse, safeOpenURL, reportError } from '../utils/errorUtils';

const WebViewComponent = ({
  baseUrl,
  websiteToken,
  locale,
  colorScheme,
  user,
  customAttributes,
  cwConversation,
  onWidgetLoad,
  onWidgetClose,
  onUnreadCountUpdate,
  onCwConversationUpdate,
  onError,
}) => {
  const [currentUrl, setCurrentUrl] = useState(null);

  const widgetUrl = buildWidgetUrl({
    baseUrl,
    websiteToken,
    locale,
    colorScheme,
    user,
    customAttributes,
    cwConversation,
  });

  const injectedJavaScript = generateScripts({
    user,
    locale,
    customAttributes,
    colorScheme,
  });

  const onShouldStartLoadWithRequest = (request) => {
    const isMessageView = currentUrl && currentUrl.includes('#/messages');
    const isAttachmentUrl = !widgetUrl.includes(request.url);
    // Open the attachments only in the external browser
    const shouldRedirectToBrowser = isMessageView && isAttachmentUrl;

    if (shouldRedirectToBrowser) {
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

  const handleWebViewNavigationStateChange = (newNavState) => {
    setCurrentUrl(newNavState.url);
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
            null,
            { rawMessage: message }
          );
        }

        const { event: eventType, type, count, cw_conversation } = parsedMessage;

        if (eventType === POST_MESSAGE_EVENTS.WIDGET_LOADED) {
          onWidgetLoad?.();
        }

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
        action: 'handleWebViewMessage',
        eventData: event.nativeEvent.data
      });
    }
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;

    const error = new WidgetError(
      ERROR_CODES.WEBVIEW_ERROR,
      `WebView failed to load: ${nativeEvent.description || 'Unknown error'}`,
      null,
      {
        nativeEvent,
        url: nativeEvent.url || widgetUrl,
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
      source={{ uri: widgetUrl }}
      onMessage={handleMessage}
      onLoad={handleLoad}
      onError={handleError}
      onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
      onNavigationStateChange={handleWebViewNavigationStateChange}
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
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    phone_number: PropTypes.string,
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

WebViewComponent.defaultProps = {
  locale: 'en',
  colorScheme: 'light',
  user: {},
  customAttributes: {},
  cwConversation: null,
  onWidgetLoad: null,
  onWidgetClose: null,
  onUnreadCountUpdate: null,
  onCwConversationUpdate: null,
  onError: null,
};

export default WebViewComponent; 