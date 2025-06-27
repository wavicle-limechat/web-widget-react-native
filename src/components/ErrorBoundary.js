import PropTypes from 'prop-types';
import React from 'react';
import { Text, View } from 'react-native';
import { widgetStyles } from '../styles';
import { ERROR_CODES } from '../constants';
import { WidgetError, reportError } from '../utils/errorUtils';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('LimeChat Widget Error Boundary caught an error:', error);
    
    // Create structured error for component crashes
    const widgetError = new WidgetError(
      ERROR_CODES.COMPONENT_ERROR,
      `Component crashed: ${error.message}`,
      error,
      { 
        componentStack: errorInfo.componentStack,
        errorBoundary: true 
      }
    );
    
    // Call the onError prop if provided
    if (this.props.onError) {
      reportError(widgetError, this.props.onError, { source: 'ErrorBoundary' });
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      const fallbackComponent = this.props.fallback;
      
      if (fallbackComponent) {
        return fallbackComponent(this.state.error);
      }

      // Default fallback UI
      return (
        <View style={widgetStyles.errorContainer}>
          <Text style={widgetStyles.errorText}>
            Something went wrong with the LimeChat widget.
          </Text>
          {process.env.NODE_ENV === 'development' && (
            <Text style={widgetStyles.errorDetails}>
              {this.state.error?.message}
            </Text>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onError: PropTypes.func,
  fallback: PropTypes.func,
};

ErrorBoundary.defaultProps = {
  onError: null,
  fallback: null,
};

export default ErrorBoundary; 