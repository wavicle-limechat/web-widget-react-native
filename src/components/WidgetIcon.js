import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { checkNetworkConnectivity } from '../utils';
import { OFFLINE_MESSAGES } from '../constants';
import { widgetStyles } from '../styles';

const WidgetIcon = ({ 
  widgetConfig, 
  isLoading, 
  error, 
  onPress, 
  iconStyle 
}) => {
  const [imageError, setImageError] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [fallbackIconError, setFallbackIconError] = useState(false);

  // Set timeout for loading state
  React.useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 10000); // 10 seconds timeout

      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [isLoading]);

  const handlePress = async () => {
    try {
      const isOnline = await checkNetworkConnectivity();
      
      if (!isOnline) {
        Alert.alert(
          OFFLINE_MESSAGES.TITLE,
          OFFLINE_MESSAGES.MESSAGE,
          [{ text: OFFLINE_MESSAGES.BUTTON_TEXT }]
        );
        return;
      }
      
      onPress();
    } catch (networkError) {
      console.warn('Network check failed:', networkError);
      // If network check fails, still allow opening (maybe network check is faulty)
      onPress();
    }
  };

  const renderIcon = () => {
    const iconSource = widgetConfig?.widgetIconMobile || widgetConfig?.widgetIconDesktop;
    
    if (isLoading && !loadingTimeout) {
      return (
        <View style={[widgetStyles.defaultIcon, iconStyle]}>
          <Text style={widgetStyles.loadingText}>...</Text>
        </View>
      );
    }

    // Show fallback LC icon if there's an error, loading timeout, or no icon source
    if (error || !iconSource || imageError || loadingTimeout) {
      if (fallbackIconError) {
        // If even the bundled PNG fails, show emoji fallback
        return (
          <View style={[widgetStyles.defaultIcon, iconStyle]}>
            <Text style={widgetStyles.iconText}>💬</Text>
          </View>
        );
      }
      
      // Try to load the bundled LC-Icon.png first
      return (
        <Image 
          source={require('../assets/LC-Icon.png')} 
          style={[widgetStyles.widgetIcon, iconStyle]}
          onError={() => {
            console.warn('Failed to load bundled LC-Icon.png');
            setFallbackIconError(true);
          }}
        />
      );
    }

    // Try to render the configured icon (standard image formats only)
    const isImageUrl = iconSource.match(/\.(jpeg|jpg|gif|png|svg)$/i);

    if (isImageUrl) {
      return (
        <Image 
          source={{ uri: iconSource }} 
          style={[widgetStyles.widgetIcon, iconStyle]}
          onError={() => {
            console.warn('Failed to load widget icon');
            setImageError(true);
          }}
          onLoad={() => setImageError(false)}
        />
      );
    }

    // Fallback for unknown format - trigger the fallback icon
    setImageError(true);
    return (
      <View style={[widgetStyles.defaultIcon, iconStyle]}>
        <Text style={widgetStyles.iconText}>💬</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      style={widgetStyles.iconButton}
      activeOpacity={0.8}
      accessible={true}
      accessibilityLabel="Open LimeChat widget"
      accessibilityHint="Double tap to open the chat widget"
      accessibilityRole="button"
    >
      {renderIcon()}
    </TouchableOpacity>
  );
};

WidgetIcon.propTypes = {
  widgetConfig: PropTypes.object,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  onPress: PropTypes.func.isRequired,
  iconStyle: PropTypes.object,
};

WidgetIcon.defaultProps = {
  widgetConfig: {},
  isLoading: false,
  error: null,
  iconStyle: {},
};

export default WidgetIcon; 