import PropTypes from "prop-types";
import React, { useState, useEffect, useImperativeHandle, useRef } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import ErrorBoundary from "./components/ErrorBoundary";
import WidgetIcon from "./components/WidgetIcon";
import WidgetModal from "./components/WidgetModal";
import { WIDGET_CONFIG, ERROR_CODES, POST_MESSAGE_EVENTS } from "./constants";
import useWidgetConfig from "./hooks/useWidgetConfig";
import { widgetStyles } from "./styles";
import { createWootPostMessage } from "./utils";
import { validators, reportError, WidgetError } from "./utils/errorUtils";

const EMPTY_OBJECT = {};

const LimeChatWidget = React.forwardRef(({
  websiteToken,
  baseUrl = WIDGET_CONFIG.DEFAULT_BASE_URL,
  user = EMPTY_OBJECT,
  locale = WIDGET_CONFIG.DEFAULT_LOCALE,
  colorScheme = WIDGET_CONFIG.DEFAULT_COLOR_SCHEME,
  hideFilePicker = false,
  customAttributes = EMPTY_OBJECT,
  customButton = null,
  conversationToken,
  onConversationTokenChange,
  onWidgetLoad,
  onWidgetClose,
  onMessage,
  onError,
  style,
  iconStyle,
  unreadCount: unreadCountProp,
  unreadCountStyle,
  unreadCountTextStyle,
}, ref) => {
  const widgetBaseUrl = baseUrl.replace(/\/+$/, '');
  const [showWidget, setShowWidget] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [cwConversation, setCwConversation] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const webViewRef = useRef(null);
  const pendingOpen = useRef(null);
  const pendingAttributes = useRef({});
  const isWidgetReady = useRef(false);
  const hasLoaded = useRef(false);
  const widgetListening = useRef(false);
  const lastValidationMessage = useRef(null);
  const shownUnreadCount = unreadCountProp ?? unreadCount;

  // Validate props on mount and when they change
  useEffect(() => {
    try {
      validators.websiteToken(websiteToken);
      validators.user(user);
      validators.customAttributes(customAttributes);
      lastValidationMessage.current = null;
      setValidationError(null);
    } catch (error) {
      if (lastValidationMessage.current === error.message) return;
      lastValidationMessage.current = error.message;
      setValidationError(error);
      reportError(error, onError, { action: 'propValidation' });
    }
  }, [websiteToken, user, customAttributes, onError]);

  const { widgetConfig, isLoading, error } = useWidgetConfig(
    widgetBaseUrl,
    websiteToken,
    onError
  );

  const handleIconPress = () => {
    try {
      // Don't open widget if there are validation errors
      if (validationError) {
        reportError(validationError, onError, { action: 'iconPress' });
        return;
      }
      pendingOpen.current = null;
      setShowWidget(!showWidget);
    } catch (error) {
      const widgetError = new WidgetError(
        ERROR_CODES.COMPONENT_ERROR,
        `Failed to handle icon press: ${error.message}`,
        error,
        { action: 'iconPress' }
      );
      reportError(widgetError, onError);
    }
  };

  const handleModalClose = () => {
    pendingOpen.current = null;
    setShowWidget(false);
    onWidgetClose?.();
  };

  const flushOpen = () => {
    if (pendingOpen.current === null || !isWidgetReady.current || !webViewRef.current) return;
    webViewRef.current.injectJavaScript(
      createWootPostMessage({ event: POST_MESSAGE_EVENTS.OPEN_WITH_MESSAGE, openMessage: pendingOpen.current })
    );
    pendingOpen.current = null;
  };

  const open = (message = null) => {
    if (validationError) {
      reportError(validationError, onError, { action: 'open' });
      return;
    }
    const hasMessage = typeof message === 'string'
      ? message.length > 0
      : !!message && Object.keys(message).length > 0;
    if (hasMessage) pendingOpen.current = message;
    setShowWidget(true);
    flushOpen();
  };

  const sendMessage = (event, data = {}) => {
    if (!webViewRef.current) return false;
    webViewRef.current.injectJavaScript(createWootPostMessage({ ...data, event }));
    return true;
  };

  const flushAttributes = () => {
    if (!isWidgetReady.current || !webViewRef.current) return;
    if (Object.keys(pendingAttributes.current).length === 0) return;
    webViewRef.current.injectJavaScript(
      createWootPostMessage({
        event: POST_MESSAGE_EVENTS.SET_MESSAGE_ATTRIBUTES,
        attributes: pendingAttributes.current,
      })
    );
    pendingAttributes.current = {};
  };

  const setMessageAttributes = (attributes) => {
    const isPlainObject = !!attributes && typeof attributes === 'object' && !Array.isArray(attributes);
    if (!isPlainObject || Object.keys(attributes).length === 0) return false;
    try {
      JSON.stringify(attributes);
    } catch (e) {
      return false;
    }
    pendingAttributes.current = { ...pendingAttributes.current, ...attributes };
    flushAttributes();
    return true;
  };

  const reload = () => {
    if (!webViewRef.current) return false;
    isWidgetReady.current = false;
    hasLoaded.current = false;
    widgetListening.current = false;
    webViewRef.current.reload();
    return true;
  };

  useImperativeHandle(ref, () => ({ open, sendMessage, setMessageAttributes, reload }));

  // the widget adds its message listener after onload, and android can fire onLoad
  // before that. set-cw-conversation is sent in the same task as the listener, so
  // ready needs both onLoad and that event.
  // returns true the first time the widget is ready on this webview load
  const markReady = () => {
    if (isWidgetReady.current || !hasLoaded.current || !widgetListening.current) return false;
    isWidgetReady.current = true;
    flushAttributes();
    flushOpen();
    return true;
  };

  const handleWidgetLoad = () => {
    hasLoaded.current = true;
    if (markReady()) onWidgetLoad?.();
  };

  const handleUnreadCountUpdate = (count) => {
    setUnreadCount(count || 0);
  };

  const handleCwConversationUpdate = (conversation) => {
    widgetListening.current = true;
    const firstReady = markReady();
    setCwConversation(conversation);
    onConversationTokenChange?.(conversation);
    if (firstReady) onWidgetLoad?.();
  };

  const renderIcon = () => {
    const badge = shownUnreadCount > 0 && (
      <View style={[widgetStyles.unreadCount, unreadCountStyle]}>
        <Text style={[widgetStyles.unreadCountText, unreadCountTextStyle]}>
          {shownUnreadCount > 99 ? '99+' : shownUnreadCount}
        </Text>
      </View>
    );

    // If customButton is provided, render it directly without wrapping in TouchableOpacity
    // This allows the custom button to handle its own onPress events
    if (customButton) {
      return (
        <View style={widgetStyles.iconButton}>
          {badge}

          {React.cloneElement(customButton, {
            onPress: () => {
              // Call the custom button's onPress if it exists
              if (customButton.props.onPress) {
                customButton.props.onPress();
              }
              // Also trigger the widget open/close
              handleIconPress();
            }
          })}
        </View>
      );
    }

    // Default behavior: wrap the default icon in TouchableOpacity
    return (
      <TouchableOpacity
        onPress={handleIconPress}
        style={widgetStyles.iconButton}
        activeOpacity={0.8}
      >
        {badge}

        <WidgetIcon
          widgetConfig={widgetConfig}
          isLoading={isLoading}
          error={error}
          iconStyle={iconStyle}
          onError={onError}
        />
      </TouchableOpacity>
    );
  };

  return (
    <ErrorBoundary onError={onError}>
      <View style={[widgetStyles.container, style]}>
        {renderIcon()}

        <WidgetModal
          isVisible={showWidget}
          onClose={handleModalClose}
          baseUrl={widgetBaseUrl}
          websiteToken={websiteToken}
          locale={locale}
          colorScheme={colorScheme}
          hideFilePicker={hideFilePicker}
          onWebViewUnmount={() => {
            isWidgetReady.current = false;
            hasLoaded.current = false;
            widgetListening.current = false;
          }}
          webViewRef={webViewRef}
          user={user}
          customAttributes={customAttributes}
          cwConversation={conversationToken || cwConversation}
          onWidgetLoad={handleWidgetLoad}
          onWidgetMessage={onMessage}
          onUnreadCountUpdate={handleUnreadCountUpdate}
          onCwConversationUpdate={handleCwConversationUpdate}
          onError={onError}
        />
      </View>
    </ErrorBoundary>
  );
});

LimeChatWidget.displayName = 'LimeChatWidget';

LimeChatWidget.propTypes = {
  websiteToken: PropTypes.string.isRequired,
  baseUrl: PropTypes.string,
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    phone_number: PropTypes.string,
    identifier: PropTypes.string,
    identifier_hash: PropTypes.string,
    custom_attributes: PropTypes.object,
  }),
  locale: PropTypes.string,
  colorScheme: PropTypes.oneOf(["light", "dark", "auto"]),
  hideFilePicker: PropTypes.bool,
  customAttributes: PropTypes.object,
  customButton: PropTypes.element,
  conversationToken: PropTypes.string,
  onConversationTokenChange: PropTypes.func,
  onWidgetLoad: PropTypes.func,
  onWidgetClose: PropTypes.func,
  onMessage: PropTypes.func,
  onError: PropTypes.func,
  style: PropTypes.object,
  iconStyle: PropTypes.object,
  unreadCount: PropTypes.number,
  unreadCountStyle: PropTypes.object,
  unreadCountTextStyle: PropTypes.object,
};

export default LimeChatWidget;
