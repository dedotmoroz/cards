import { useCallback, useEffect, useState } from 'react';
import { cardsApi } from '@/shared/api/cardsApi';
import { API_BASE_URL } from '@/shared/config/api';

interface UseGoogleSheetsConnectionOptions {
  enabled?: boolean;
}

export const useGoogleSheetsConnection = (options: UseGoogleSheetsConnectionOptions = {}) => {
  const { enabled = true } = options;
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setConnected(false);
      setLoading(false);
      setError(null);
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await cardsApi.getGoogleSheetsStatus();
      setConnected(Boolean(result.connected));
      return Boolean(result.connected);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get Google Sheets status';
      setConnected(false);
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const connect = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    params.delete('google_sheets');
    params.delete('google_sheets_error');
    const query = params.toString();
    const returnTo = `${window.location.pathname}${query ? `?${query}` : ''}`;
    window.location.href = `${API_BASE_URL}/auth/google/sheets?return_to=${encodeURIComponent(returnTo)}`;
  }, []);

  const markDisconnected = useCallback(() => {
    setConnected(false);
  }, []);

  const disconnect = useCallback(async () => {
    setError(null);
    try {
      await cardsApi.disconnectGoogleSheets();
      setConnected(false);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to disconnect Google Sheets';
      setError(message);
      return false;
    }
  }, []);

  return {
    connected,
    loading,
    error,
    refetch,
    connect,
    disconnect,
    markDisconnected,
  };
};
