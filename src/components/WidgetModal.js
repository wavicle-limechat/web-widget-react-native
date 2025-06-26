import PropTypes from 'prop-types';
import React from 'react';
import { SafeAreaView, View } from 'react-native';
import Modal from 'react-native-modal';
import { modalStyles } from '../styles';
import WebViewComponent from './WebViewComponent';

const WidgetModal = ({
  isVisible,
  onClose,
  baseUrl,
  websiteToken,
  locale,
  colorScheme,
  user,
  customAttributes,
  onWidgetLoad,
}) => {
  const handleClose = () => {
    onClose?.();
  };

  const handleWidgetClose = () => {
    handleClose();
  };

  return (
    <Modal
      isVisible={isVisible}
      coverScreen
      hasBackdrop={false}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      style={modalStyles.modal}
      animationIn="fadeIn"
      animationOut="fadeOut"
      animationInTiming={200}
      animationOutTiming={200}
    >
      <SafeAreaView style={modalStyles.safeArea}>
        <View style={modalStyles.webviewContainer}>
          <WebViewComponent
            baseUrl={baseUrl}
            websiteToken={websiteToken}
            locale={locale}
            colorScheme={colorScheme}
            user={user}
            customAttributes={customAttributes}
            onWidgetLoad={onWidgetLoad}
            onWidgetClose={handleWidgetClose}
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
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    phone_number: PropTypes.string,
    identifier_hash: PropTypes.string,
  }),
  customAttributes: PropTypes.object,
  onWidgetLoad: PropTypes.func,
};

WidgetModal.defaultProps = {
  locale: 'en',
  colorScheme: 'light',
  user: {},
  customAttributes: {},
  onWidgetLoad: null,
};

export default WidgetModal; 