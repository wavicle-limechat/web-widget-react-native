import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
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
const mockInject = jest.fn();

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
  
  function MockWidgetModal({ isVisible, openMessage, webViewRef }) {
    if (!isVisible) return null;
    if (webViewRef) webViewRef.current = { injectJavaScript: mockInject };
    return React.createElement(
      Text,
      { testID: 'widget-modal' },
      openMessage ? `Modal:${JSON.stringify(openMessage)}` : 'Modal'
    );
  }
  
  MockWidgetModal.propTypes = {
    isVisible: PropTypes.bool,
    openMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    webViewRef: PropTypes.object,
  };
  
  return MockWidgetModal;
});

jest.mock('../hooks/useWidgetConfig', () => {
  return jest.fn(() => ({
    widgetConfig: {},
    isLoading: false,
    error: null,
  }));
});

describe('LimeChatWidget', () => {
  const defaultProps = {
    websiteToken: 'test-token',
  };

  it('passes a trimmed baseUrl to useWidgetConfig', () => {
    const useWidgetConfig = require('../hooks/useWidgetConfig');
    useWidgetConfig.mockClear();
    render(<LimeChatWidget {...defaultProps} baseUrl="https://staging.example.com//" />);

    expect(useWidgetConfig.mock.calls[0][0]).toBe('https://staging.example.com');
  });

  it('uses the default baseUrl when none is given', () => {
    const useWidgetConfig = require('../hooks/useWidgetConfig');
    useWidgetConfig.mockClear();
    render(<LimeChatWidget {...defaultProps} />);

    expect(useWidgetConfig.mock.calls[0][0]).toBe('https://app.limechat.ai');
  });

  it('opens the widget with a message through the ref handle', () => {
    const ref = React.createRef();
    const { getByTestId, queryByTestId } = render(<LimeChatWidget {...defaultProps} ref={ref} />);
    expect(queryByTestId('widget-modal')).toBeNull();

    act(() => ref.current.open('hi'));
    expect(getByTestId('widget-modal').props.children).toBe('Modal:"hi"');
  });

  it('opens without a message and sends open-with-message when already open', () => {
    mockInject.mockClear();
    const ref = React.createRef();
    const { getByTestId } = render(<LimeChatWidget {...defaultProps} ref={ref} />);

    act(() => ref.current.open());
    expect(getByTestId('widget-modal').props.children).toBe('Modal');
    expect(mockInject).not.toHaveBeenCalled();

    act(() => ref.current.open('again'));
    expect(mockInject).toHaveBeenCalledTimes(1);
    expect(mockInject.mock.calls[0][0]).toContain('open-with-message');
    expect(mockInject.mock.calls[0][0]).toContain('"openMessage":"again"');
  });

  it('sendMessage returns false while closed and injects when open', () => {
    mockInject.mockClear();
    const ref = React.createRef();
    render(<LimeChatWidget {...defaultProps} ref={ref} />);

    let result;
    act(() => { result = ref.current.sendMessage('set-label', { label: 'vip' }); });
    expect(result).toBe(false);
    expect(mockInject).not.toHaveBeenCalled();

    act(() => ref.current.open());
    act(() => { result = ref.current.sendMessage('set-label', { label: 'vip' }); });
    expect(result).toBe(true);
    expect(mockInject.mock.calls[0][0]).toContain('"label":"vip"');
    expect(mockInject.mock.calls[0][0]).toContain('"event":"set-label"');
  });

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

  it('renders the unreadCount prop as a badge', () => {
    const { getByText } = render(<LimeChatWidget {...defaultProps} unreadCount={3} />);

    expect(getByText('3')).toBeTruthy();
  });

  it('renders no badge when unreadCount is 0', () => {
    const { queryByText } = render(<LimeChatWidget {...defaultProps} unreadCount={0} />);

    expect(queryByText('0')).toBeNull();
  });
});
