import { useEffect, useState } from 'react';
import { fetchWidgetConfig } from '../utils';
import { WidgetError } from '../utils/errorUtils';

const useWidgetConfig = (baseUrl, websiteToken, onError) => {
  const [widgetConfig, setWidgetConfig] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadConfig = async () => {
    if (!websiteToken) {
      const errorMsg = 'Website token is required';
      setError(errorMsg);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const config = await fetchWidgetConfig(baseUrl, websiteToken);
      setWidgetConfig(config);
      setError(null); // Clear any previous errors
    } catch (err) {
      // Handle both WidgetError and regular errors
      if (err instanceof WidgetError) {
        setError(err);
        // Report to parent component
        if (onError) {
          onError(err, err.toJSON());
        }
      } else {
        const widgetError = new WidgetError(
          'WIDGET_ERROR_1900', // Unknown error
          err.message || 'Failed to load widget config',
          err,
          { baseUrl, websiteToken }
        );
        setError(widgetError);
        if (onError) {
          onError(widgetError, widgetError.toJSON());
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, [baseUrl, websiteToken]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    widgetConfig,
    isLoading,
    error,
    refetch: loadConfig,
  };
};

export default useWidgetConfig; 