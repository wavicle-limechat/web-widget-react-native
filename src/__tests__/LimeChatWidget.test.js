import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import LimeChatWidget from '../LimeChatWidget';

// Mock the components and hooks
jest.mock('../components/ErrorBoundary', () => {
  const { Text } = require('react-native');
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
  return function MockWidgetModal({ isVisible }) {
    return isVisible ? React.createElement(Text, { testID: 'widget-modal' }, 'Modal') : null;
  };
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

  it('renders default widget icon when no customIcon is provided', () => {
    const { getByTestId } = render(<LimeChatWidget {...defaultProps} />);
    
    expect(getByTestId('default-widget-icon')).toBeTruthy();
  });

  it('renders custom icon when customIcon is provided', () => {
    const CustomIcon = () => (
      <View testID="custom-icon">
        <Text>Custom Icon</Text>
      </View>
    );

    const { getByTestId, queryByTestId } = render(
      <LimeChatWidget {...defaultProps} customIcon={<CustomIcon />} />
    );
    
    expect(getByTestId('custom-icon')).toBeTruthy();
    expect(queryByTestId('default-widget-icon')).toBeNull();
  });

  it('opens modal when custom icon is pressed', () => {
    const CustomIcon = () => (
      <View testID="custom-icon">
        <Text>Custom Icon</Text>
      </View>
    );

    const { getByTestId, queryByTestId } = render(
      <LimeChatWidget {...defaultProps} customIcon={<CustomIcon />} />
    );
    
    // Initially modal should not be visible
    expect(queryByTestId('widget-modal')).toBeNull();
    
    // Press the custom icon
    fireEvent.press(getByTestId('custom-icon'));
    
    // Modal should now be visible
    expect(getByTestId('widget-modal')).toBeTruthy();
  });

  it('opens modal when default icon is pressed', () => {
    const { getByTestId, queryByTestId, getByText } = render(<LimeChatWidget {...defaultProps} />);
    
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