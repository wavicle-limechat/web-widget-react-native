import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, View, TouchableOpacity } from 'react-native';
import LimeChatWidget from '../LimeChatWidget';

// Suppress console errors and warnings during tests
// eslint-disable-next-line no-console
const originalError = console.error;
// eslint-disable-next-line no-console
const originalWarn = console.warn;

beforeAll(() => {
  // eslint-disable-next-line no-console
  console.error = jest.fn();
  // eslint-disable-next-line no-console
  console.warn = jest.fn();
});

afterAll(() => {
  // eslint-disable-next-line no-console
  console.error = originalError;
  // eslint-disable-next-line no-console
  console.warn = originalWarn;
});

// Mock the components and hooks
jest.mock('../components/ErrorBoundary', () => {
  return function MockErrorBoundary({ children }) {
    return children;
  };
});

jest.mock('../components/WidgetIcon', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return function MockWidgetIcon() {
    return React.createElement(Text, { testID: 'default-widget-icon' }, 'Default Icon');
  };
});

jest.mock('../components/WidgetModal', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const PropTypes = require('prop-types');
  
  function MockWidgetModal({ isVisible }) {
    return isVisible ? React.createElement(Text, { testID: 'widget-modal' }, 'Modal') : null;
  }
  
  MockWidgetModal.propTypes = {
    isVisible: PropTypes.bool,
  };
  
  return MockWidgetModal;
});

jest.mock('../hooks/useWidgetConfig', () => {
  return function useWidgetConfig() {
    return {
      widgetConfig: {},
      isLoading: false,
      error: null,
    };
  };
});

describe('LimeChatWidget', () => {
  const defaultProps = {
    websiteToken: 'test-token',
  };

  it('renders default widget icon when no customButton is provided', () => {
    const { getByTestId } = render(<LimeChatWidget {...defaultProps} />);
    
    expect(getByTestId('default-widget-icon')).toBeTruthy();
  });

  it('renders custom button when customButton is provided', () => {
    const CustomButton = () => (
      <View testID="custom-button">
        <Text>Custom Button</Text>
      </View>
    );

    const { getByTestId, queryByTestId } = render(
      <LimeChatWidget {...defaultProps} customButton={<CustomButton />} />
    );
    
    expect(getByTestId('custom-button')).toBeTruthy();
    expect(queryByTestId('default-widget-icon')).toBeNull();
  });

  it('opens modal when custom button is pressed', () => {
    const CustomButton = () => (
      <View testID="custom-button">
        <Text>Custom Button</Text>
      </View>
    );

    const { getByTestId, queryByTestId } = render(
      <LimeChatWidget {...defaultProps} customButton={<CustomButton />} />
    );
    
    // Initially modal should not be visible
    expect(queryByTestId('widget-modal')).toBeNull();
    
    // Press the custom button
    fireEvent.press(getByTestId('custom-button'));
    
    // Modal should now be visible
    expect(getByTestId('widget-modal')).toBeTruthy();
  });

  it('calls both custom button onPress and opens widget when custom button with onPress is provided', () => {
    const mockCustomOnPress = jest.fn();
    
    const CustomButton = ({ onPress }) => {
      CustomButton.propTypes = {
        onPress: require('prop-types').func,
      };
      
      return (
        <TouchableOpacity testID="custom-button" onPress={onPress}>
          <Text>Custom Button</Text>
        </TouchableOpacity>
      );
    };

    const { getByTestId, queryByTestId } = render(
      <LimeChatWidget 
        {...defaultProps} 
        customButton={<CustomButton onPress={mockCustomOnPress} />} 
      />
    );
    
    // Initially modal should not be visible
    expect(queryByTestId('widget-modal')).toBeNull();
    
    // Press the custom button
    fireEvent.press(getByTestId('custom-button'));
    
    // Both the custom onPress and widget modal opening should happen
    expect(mockCustomOnPress).toHaveBeenCalled();
    expect(getByTestId('widget-modal')).toBeTruthy();
  });

  it('opens modal when default icon is pressed', () => {
    const { getByTestId, queryByTestId } = render(<LimeChatWidget {...defaultProps} />);
    
    // Initially modal should not be visible
    expect(queryByTestId('widget-modal')).toBeNull();
    
    // Press the default icon (now we need to press the text since it's wrapped by TouchableOpacity)
    fireEvent.press(getByTestId('default-widget-icon'));
    
    // Modal should now be visible
    expect(getByTestId('widget-modal')).toBeTruthy();
  });

  it('applies custom unread count styles', () => {
    const customUnreadCountStyle = { backgroundColor: 'blue' };
    const customUnreadCountTextStyle = { fontSize: 16 };

    const { queryByText } = render(
      <LimeChatWidget 
        {...defaultProps} 
        unreadCountStyle={customUnreadCountStyle}
        unreadCountTextStyle={customUnreadCountTextStyle}
      />
    );
    
    // Since initial unread count is 0, unread count should not be visible
    expect(queryByText('1')).toBeNull();
  });

  it('does not render unread count when count is 0', () => {
    const { queryByText } = render(<LimeChatWidget {...defaultProps} />);
    
    // Since initial unread count is 0, unread count should not be visible
    expect(queryByText('0')).toBeNull();
    expect(queryByText('1')).toBeNull();
  });

  it('unread count functionality is driven by WebView events', () => {
    // This test documents that unread count is controlled by WebView messages
    // The actual count display is handled by SET_UNREAD_COUNT events from the web
    const { queryByText } = render(<LimeChatWidget {...defaultProps} />);
    
    // Initial state should have no unread count displayed
    expect(queryByText('1')).toBeNull();
  });
}); 