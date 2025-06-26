import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { POST_MESSAGE_EVENTS } from '../constants';
import { webViewStyles } from '../styles';
import {
    buildWidgetUrl,
    generateScripts,
    getMessage,
    isJsonString
} from '../utils';

const WebViewComponent = ({
  baseUrl,
  websiteToken,
  locale,
  colorScheme,
  user,
  customAttributes,
  onWidgetLoad,
  onWidgetClose,
}) => {
  const [currentUrl, setCurrentUrl] = useState(null);

  const widgetUrl = buildWidgetUrl({
    baseUrl,
    websiteToken,
    locale,
    colorScheme,
    user,
    customAttributes,
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
      Linking.openURL(request.url);
      return false;
    }

    return true;
  };

  const handleWebViewNavigationStateChange = (newNavState) => {
    setCurrentUrl(newNavState.url);
  };

  const handleMessage = (event) => {
    const { data } = event.nativeEvent;
    const message = getMessage(data);
    
    if (isJsonString(message)) {
      const parsedMessage = JSON.parse(message);
      const { event: eventType, type } = parsedMessage;
      
      if (eventType === POST_MESSAGE_EVENTS.WIDGET_LOADED) {
        onWidgetLoad?.();
      }
      
      if (type === POST_MESSAGE_EVENTS.CLOSE_WIDGET) {
        onWidgetClose?.();
      }
    }
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error: ', nativeEvent);
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
  onWidgetLoad: PropTypes.func,
  onWidgetClose: PropTypes.func,
};

WebViewComponent.defaultProps = {
  locale: 'en',
  colorScheme: 'light',
  user: {},
  customAttributes: {},
  onWidgetLoad: null,
  onWidgetClose: null,
};

export default WebViewComponent; 