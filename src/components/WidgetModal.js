import PropTypes from 'prop-types';
import React from 'react';
import { SafeAreaView, View } from 'react-native';
import Modal from 'react-native-modal';
import { modalStyles } from '../styles';
import { userPropType } from '../utils/propTypes';
import WebViewComponent from './WebViewComponent';

const WidgetModal = ({
  isVisible,
  onClose,
  baseUrl,
  websiteToken,
  locale,
  colorScheme,
  hideFilePicker,
  onWebViewUnmount,
  webViewRef,
  webViewKey,
  user,
  customAttributes,
  cwConversation,
  onWidgetLoad,
  onLoadFailed,
  onWidgetMessage,
  onUnreadCountUpdate,
  onCwConversationUpdate,
  onError,
}) => {
  return (
    <Modal
      isVisible={isVisible}
      coverScreen
      hasBackdrop={false}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={modalStyles.modal}
      animationIn="fadeIn"
      animationOut="fadeOut"
      animationInTiming={200}
      animationOutTiming={200}
    >
      <SafeAreaView style={modalStyles.safeArea}>
        <View style={modalStyles.webviewContainer}>
          <WebViewComponent
            key={webViewKey}
            baseUrl={baseUrl}
            websiteToken={websiteToken}
            locale={locale}
            colorScheme={colorScheme}
            hideFilePicker={hideFilePicker}
            onWebViewUnmount={onWebViewUnmount}
            webViewRef={webViewRef}
            user={user}
            customAttributes={customAttributes}
            cwConversation={cwConversation}
            onWidgetLoad={onWidgetLoad}
            onLoadFailed={onLoadFailed}
            onWidgetClose={onClose}
            onWidgetMessage={onWidgetMessage}
            onUnreadCountUpdate={onUnreadCountUpdate}
            onCwConversationUpdate={onCwConversationUpdate}
            onError={onError}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

WidgetModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  baseUrl: PropTypes.string.isRequired,
  websiteToken: PropTypes.string.isRequired,
  locale: PropTypes.string,
  colorScheme: PropTypes.oneOf(['light', 'dark', 'auto']),
  hideFilePicker: PropTypes.bool,
  onWebViewUnmount: PropTypes.func,
  webViewRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  webViewKey: PropTypes.number,
  user: userPropType,
  customAttributes: PropTypes.object,
  cwConversation: PropTypes.string,
  onWidgetLoad: PropTypes.func,
  onLoadFailed: PropTypes.func,
  onWidgetMessage: PropTypes.func,
  onUnreadCountUpdate: PropTypes.func,
  onCwConversationUpdate: PropTypes.func,
  onError: PropTypes.func,
};

export default WidgetModal; 