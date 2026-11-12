import PropTypes from "prop-types";
import React, { useState, useEffect, useImperativeHandle, useRef } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import ErrorBoundary from "./components/ErrorBoundary";
import WidgetIcon from "./components/WidgetIcon";
import WidgetModal from "./components/WidgetModal";
import { WIDGET_CONFIG, ERROR_CODES, POST_MESSAGE_EVENTS } from "./constants";
import useWidgetConfig from "./hooks/useWidgetConfig";
import { widgetStyles } from "./styles";
import { createWootPostMessage, withDefaultContent } from "./utils";
import { validators, reportError, WidgetError } from "./utils/errorUtils";
import { userPropType } from "./utils/propTypes";

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
  const [webViewKey, setWebViewKey] = useState(0);
  const webViewRef = useRef(null);
  const pendingOpen = useRef(null);
  const pendingAttributes = useRef({});
  const isWidgetReady = useRef(false);
  const hasLoaded = useRef(false);
  const widgetListening = useRef(false);
  const lastValidationMessage = useRef(null);
  const reloadedAt = useRef(0);
  const heldToken = useRef(null);
  const loadFailed = useRef(false);
  const processRecoveryUsed = useRef(false);
  const lastTokenProp = useRef(conversationToken);
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

  // a host that clears the prop on logout must not fall back to the old live token
  useEffect(() => {
    if (lastTokenProp.current && !conversationToken) setCwConversation(null);
    lastTokenProp.current = conversationToken;
  }, [conversationToken]);

  // held attributes belong to the user who set them. a different user or token must not get them.
  // a token arriving after none (first session) is not a switch.
  const userKey = JSON.stringify([user?.identifier, user?.email, user?.phone_number]);
  const lastUserKey = useRef(userKey);
  const lastHeldToken = useRef(conversationToken);
  useEffect(() => {
    const userChanged = lastUserKey.current !== userKey;
    const tokenChanged = !!lastHeldToken.current && lastHeldToken.current !== conversationToken;
    lastUserKey.current = userKey;
    lastHeldToken.current = conversationToken;
    if (userChanged || tokenChanged) pendingAttributes.current = {};
  }, [userKey, conversationToken]);

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

  // the same path as the widget's own close event and the modal's back press
  const close = () => {
    if (!showWidget) return;
    handleModalClose();
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
    if (hasMessage) pendingOpen.current = withDefaultContent(message);
    setShowWidget(true);
    if (hasMessage && loadFailed.current) {
      reload();
      return;
    }
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
    reloadedAt.current = Date.now();
    heldToken.current = null;
    isWidgetReady.current = false;
    hasLoaded.current = false;
    widgetListening.current = false;
    setWebViewKey((key) => key + 1);
    return true;
  };

  // the web process died: reload once, then report until the page is ready again
  const handleProcessGone = () => {
    isWidgetReady.current = false;
    hasLoaded.current = false;
    widgetListening.current = false;
    heldToken.current = null;
    if (processRecoveryUsed.current) {
      loadFailed.current = true;
      reportError(
        new WidgetError(
          ERROR_CODES.WEBVIEW_ERROR,
          'Widget web process died again before ready',
          null,
          { action: 'webViewProcessGone' }
        ),
        onError,
        { action: 'webViewProcessGone' }
      );
      return;
    }
    processRecoveryUsed.current = true;
    reload();
  };

  useImperativeHandle(ref, () => ({ open, sendMessage, setMessageAttributes, reload, close }));

  // the widget adds its message listener after onload, and android can fire onLoad
  // before that. set-cw-conversation is sent in the same task as the listener, so
  // ready needs both onLoad and that event.
  // returns true the first time the widget is ready on this webview load
  const markReady = () => {
    if (isWidgetReady.current || !hasLoaded.current || !widgetListening.current) return false;
    isWidgetReady.current = true;
    processRecoveryUsed.current = false;
    flushAttributes();
    flushOpen();
    return true;
  };

  const deliverToken = (conversation) => {
    if (typeof conversation !== 'string' || !conversation.trim()) return;
    setCwConversation(conversation);
    onConversationTokenChange?.(conversation);
  };

  // the token goes to the host after held attributes and open, as on android and ios
  const handleWidgetLoad = () => {
    hasLoaded.current = true;
    const firstReady = markReady();
    const token = heldToken.current;
    heldToken.current = null;
    try {
      if (token !== null) deliverToken(token);
    } catch (error) {
      reportError(error, onError, { action: 'conversationToken' });
    } finally {
      if (firstReady) onWidgetLoad?.();
    }
  };

  const handleUnreadCountUpdate = (count) => {
    setUnreadCount(count || 0);
  };

  const handleCwConversationUpdate = (conversation, timestamp) => {
    // the old page can still answer after a reload started
    if (timestamp < reloadedAt.current) return;
    widgetListening.current = true;
    if (!hasLoaded.current) {
      heldToken.current = conversation;
      return;
    }
    const firstReady = markReady();
    try {
      deliverToken(conversation);
    } catch (error) {
      reportError(error, onError, { action: 'conversationToken' });
    } finally {
      if (firstReady) onWidgetLoad?.();
    }
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
            heldToken.current = null;
            loadFailed.current = false;
          }}
          onLoadFailed={() => { loadFailed.current = true; }}
          onProcessGone={handleProcessGone}
          webViewRef={webViewRef}
          webViewKey={webViewKey}
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
  user: userPropType,
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
