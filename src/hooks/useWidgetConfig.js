import { useEffect, useState } from 'react';
import { ERROR_MESSAGES } from '../constants';
import { fetchWidgetConfig } from '../utils';

const useWidgetConfig = (baseUrl, websiteToken) => {
  const [widgetConfig, setWidgetConfig] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!websiteToken) {
      setError('Website token is required');
      setIsLoading(false);
      return;
    }

    const loadConfig = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const config = await fetchWidgetConfig(baseUrl, websiteToken);
        setWidgetConfig(config);
      } catch (err) {
        console.error('Error loading widget config:', err);
        setError(err.message || ERROR_MESSAGES.FETCH_CONFIG_FAILED);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [baseUrl, websiteToken]);

  const refetch = () => {
    if (websiteToken) {
      const loadConfig = async () => {
        try {
          setIsLoading(true);
          setError(null);
          
          const config = await fetchWidgetConfig(baseUrl, websiteToken);
          setWidgetConfig(config);
        } catch (err) {
          console.error('Error refetching widget config:', err);
          setError(err.message || ERROR_MESSAGES.FETCH_CONFIG_FAILED);
        } finally {
          setIsLoading(false);
        }
      };

      loadConfig();
    }
  };

  return {
    widgetConfig,
    isLoading,
    error,
    refetch,
  };
};

export default useWidgetConfig; 