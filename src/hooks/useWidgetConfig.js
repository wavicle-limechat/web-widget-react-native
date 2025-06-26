import { useEffect, useState } from 'react';
import { fetchWidgetConfig } from '../utils';

const useWidgetConfig = (baseUrl, websiteToken) => {
  const [widgetConfig, setWidgetConfig] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadConfig = async () => {
    if (!websiteToken) {
      setError('Website token is required');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const config = await fetchWidgetConfig(baseUrl, websiteToken);
      setWidgetConfig(config);
    } catch (err) {
      console.error('Error loading widget config:', err);
      setError(err.message || 'Failed to load widget config');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, [baseUrl, websiteToken]);

  return {
    widgetConfig,
    isLoading,
    error,
    refetch: loadConfig,
  };
};

export default useWidgetConfig; 