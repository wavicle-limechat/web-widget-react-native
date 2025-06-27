import PropTypes from "prop-types";
import React, { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import ErrorBoundary from "./components/ErrorBoundary";
import WidgetIcon from "./components/WidgetIcon";
import WidgetModal from "./components/WidgetModal";
import { WIDGET_CONFIG } from "./constants";
import useWidgetConfig from "./hooks/useWidgetConfig";
import { widgetStyles } from "./styles";

// Internal baseUrl - not exposed to clients
const INTERNAL_BASE_URL = WIDGET_CONFIG.DEFAULT_BASE_URL;

const LimeChatWidget = ({
  websiteToken,
  user = {},
  locale = WIDGET_CONFIG.DEFAULT_LOCALE,
  colorScheme = WIDGET_CONFIG.DEFAULT_COLOR_SCHEME,
  customAttributes = {},
  customIcon = null,
  onWidgetLoad,
  onWidgetClose,
  onError,
  style,
  iconStyle,
  unreadCountStyle,
  unreadCountTextStyle,
}) => {
  const [showWidget, setShowWidget] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [cwConversation, setCwConversation] = useState(null);
  const { widgetConfig, isLoading, error } = useWidgetConfig(
    INTERNAL_BASE_URL,
    websiteToken
  );

  const handleIconPress = () => {
    setShowWidget(!showWidget);
  };

  const handleModalClose = () => {
    setShowWidget(false);
    onWidgetClose?.();
  };

  const handleWidgetLoad = () => {
    console.log("Widget loaded successfully");
    onWidgetLoad?.();
  };

  const handleError = (error, errorInfo) => {
    console.error("LimeChat Widget Error:", error);
    onError?.(error, errorInfo);
  };

  const handleUnreadCountUpdate = (count) => {
    setUnreadCount(count || 0);
  };

  const handleCwConversationUpdate = (conversation) => {
    setCwConversation(conversation);
  };

  const renderIcon = () => {
    return (
      <TouchableOpacity
        onPress={handleIconPress}
        style={widgetStyles.iconButton}
        activeOpacity={0.8}
      >
        {unreadCount > 0 && (
          <View style={[widgetStyles.unreadCount, unreadCountStyle]}>
            <Text style={[widgetStyles.unreadCountText, unreadCountTextStyle]}>
              {unreadCount}
            </Text>
          </View>
        )}

        {customIcon ? (
          customIcon
        ) : (
          <WidgetIcon
            widgetConfig={widgetConfig}
            isLoading={isLoading}
            error={error}
            iconStyle={iconStyle}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ErrorBoundary onError={handleError}>
      <View style={[widgetStyles.container, style]}>
        {renderIcon()}

        <WidgetModal
          isVisible={showWidget}
          onClose={handleModalClose}
          baseUrl={INTERNAL_BASE_URL}
          websiteToken={websiteToken}
          locale={locale}
          colorScheme={colorScheme}
          user={user}
          customAttributes={customAttributes}
          cwConversation={cwConversation}
          onWidgetLoad={handleWidgetLoad}
          onUnreadCountUpdate={handleUnreadCountUpdate}
          onCwConversationUpdate={handleCwConversationUpdate}
          onError={onError}
        />
      </View>
    </ErrorBoundary>
  );
};

LimeChatWidget.propTypes = {
  websiteToken: PropTypes.string.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    phone_number: PropTypes.string,
    identifier_hash: PropTypes.string,
  }),
  locale: PropTypes.string,
  colorScheme: PropTypes.oneOf(["light", "dark", "auto"]),
  customAttributes: PropTypes.object,
  customIcon: PropTypes.element,
  onWidgetLoad: PropTypes.func,
  onWidgetClose: PropTypes.func,
  onError: PropTypes.func,
  style: PropTypes.object,
  iconStyle: PropTypes.object,
  unreadCountStyle: PropTypes.object,
  unreadCountTextStyle: PropTypes.object,
};

LimeChatWidget.defaultProps = {
  user: {},
  locale: WIDGET_CONFIG.DEFAULT_LOCALE,
  colorScheme: WIDGET_CONFIG.DEFAULT_COLOR_SCHEME,
  customAttributes: {},
  customIcon: null,
  onWidgetLoad: null,
  onWidgetClose: null,
  onError: null,
  style: {},
  iconStyle: {},
  unreadCountStyle: {},
  unreadCountTextStyle: {},
};

export default LimeChatWidget;
