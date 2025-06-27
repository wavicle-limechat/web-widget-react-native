import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { widgetStyles } from '../styles';
import { ERROR_CODES } from '../constants';
import { WidgetError, reportError } from '../utils/errorUtils';

const WidgetIcon = ({ 
  widgetConfig, 
  isLoading, 
  error, 
  iconStyle,
  onError
}) => {
  const [imageError, setImageError] = useState(false);

  const renderIcon = () => {
    const iconSource = widgetConfig?.widgetIconMobile || widgetConfig?.widgetIconDesktop;
    
    if (isLoading) {
      return (
        <View style={[widgetStyles.defaultIcon, iconStyle]}>
          <Text style={widgetStyles.loadingText}>...</Text>
        </View>
      );
    }

    // Show fallback icon if there's an error or no icon source
    if (error || !iconSource || imageError) {
      // Report missing icon as info (only once when no icon is configured)
      if (!iconSource && !imageError && widgetConfig && Object.keys(widgetConfig).length > 0) {
        const infoError = new WidgetError(
          ERROR_CODES.COMPONENT_ERROR,
          'No custom widget icon configured, using default LimeChat icon',
          null,
          { 
            hasConfig: !!widgetConfig,
            configKeys: Object.keys(widgetConfig || {}),
            action: 'usingFallbackIcon'
          }
        );
        // This is informational, so we'll log it but not treat as severe
        console.info('LimeChat Widget: Using default icon -', infoError.message);
        if (onError) {
          // Override severity to be informational
          infoError.severity = 'info';
          onError(infoError, infoError.toJSON());
        }
      }

      return (
        <Image 
          source={require('../assets/LC-Icon.png')} 
          style={[widgetStyles.widgetIcon, iconStyle]}
        />
      );
    }

    // Render the configured icon
    return (
      <Image 
        source={{ uri: iconSource }} 
        style={[widgetStyles.widgetIcon, iconStyle]}
        onError={(errorEvent) => {
          setImageError(true);
          const error = new WidgetError(
            ERROR_CODES.COMPONENT_ERROR,
            `Failed to load custom widget icon from URL: ${iconSource}. Using default icon instead.`,
            null,
            { iconSource, errorEvent, action: 'iconLoadFailed' }
          );
          reportError(error, onError, { action: 'iconLoadFailed' });
        }}
      />
    );
  };

  return renderIcon();
};

WidgetIcon.propTypes = {
  widgetConfig: PropTypes.object,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  iconStyle: PropTypes.object,
  onError: PropTypes.func,
};

WidgetIcon.defaultProps = {
  widgetConfig: {},
  isLoading: false,
  error: null,
  iconStyle: {},
  onError: null,
};

export default WidgetIcon; 