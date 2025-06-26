import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { widgetStyles } from '../styles';

const WidgetIcon = ({ 
  widgetConfig, 
  isLoading, 
  error, 
  iconStyle 
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
        onError={() => setImageError(true)}
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
};

WidgetIcon.defaultProps = {
  widgetConfig: {},
  isLoading: false,
  error: null,
  iconStyle: {},
};

export default WidgetIcon; 