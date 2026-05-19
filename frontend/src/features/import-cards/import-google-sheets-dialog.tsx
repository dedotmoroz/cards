import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Backdrop,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { DialogUI } from '@/shared/ui/dialog-ui';
import { ButtonUI } from '@/shared/ui/button-ui';
import { cardsApi } from '@/shared/api/cardsApi';
import { ButtonBlack } from '@/shared/ui';
import { GOOGLE_API_KEY, GOOGLE_CLIENT_ID } from '@/shared/config/api';

type Phase = 'closed' | 'picking' | 'form';

interface ImportGoogleSheetsDialogProps {
  open: boolean;
  folderId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ImportGoogleSheetsDialog: React.FC<ImportGoogleSheetsDialogProps> = ({
  open,
  folderId,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>('closed');
  /** Увеличивается при каждом новом открытии диалога (flow с Picker). */
  const [importSessionId, setImportSessionId] = useState(0);
  const [pickerAttemptId, setPickerAttemptId] = useState(0);
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [sheetTitles, setSheetTitles] = useState<string[]>([]);
  const [loadingSheetTitles, setLoadingSheetTitles] = useState(false);
  const [pickerLoading, setPickerLoading] = useState(false);
  /** Только пока грузятся скрифты/token; перед setVisible(false) чтобы не перекрывать окно Google. */
  const [showPickingBackdrop, setShowPickingBackdrop] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const pickerTokenClientRef = useRef<google.accounts.oauth2.TokenClient | null>(null);
  const pickerScriptPromiseRef = useRef<Promise<void> | null>(null);
  const gisScriptPromiseRef = useRef<Promise<void> | null>(null);
  const lastPickerLaunchSigRef = useRef('');
  /** GIS access_token used for Picker (drive.file) — same token must reach backend for sheet-titles/import. */
  const pickerGsAccessTokenRef = useRef('');

  const loadScript = (src: string) =>
    new Promise<void>((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.body.appendChild(script);
    });

  useLayoutEffect(() => {
    if (!open) {
      setPhase('closed');
      setPickerAttemptId(0);
      lastPickerLaunchSigRef.current = '';
      pickerGsAccessTokenRef.current = '';
      return;
    }

    setImportSessionId((id) => id + 1);
    setSelectedSpreadsheet(null);
    setSheetTitles([]);
    setSelectedSheet('');
    setError(null);
    setShowPickingBackdrop(true);
    setPhase('picking');
  }, [open]);

  useEffect(() => {
    if (!selectedSpreadsheet) {
      setSheetTitles([]);
      setSelectedSheet('');
      return;
    }
    const pickerToken = pickerGsAccessTokenRef.current.trim();
    if (!pickerToken) {
      setSheetTitles([]);
      setSelectedSheet('');
      setError(t('googleSheets.pickerTokenRequired'));
      return;
    }
    let cancelled = false;
    setSheetTitles([]);
    setLoadingSheetTitles(true);
    cardsApi
      .getGoogleSpreadsheetSheetTitles(selectedSpreadsheet.id, {
        pickerAccessToken: pickerToken,
      })
      .then((res) => {
        if (cancelled) return;
        const titles = res.titles;
        setSheetTitles(titles);
        setSelectedSheet(titles[0] ?? '');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setSheetTitles([]);
        setSelectedSheet('');
        const ax = err as { response?: { data?: { message?: string } }; message?: string };
        setError(
          ax.response?.data?.message ||
            ax.message ||
            t('googleSheets.sheetTabsLoadError'),
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingSheetTitles(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selectedSpreadsheet, t]);

  const ensurePickerReady = useCallback(async () => {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_API_KEY) {
      throw new Error(t('googleSheets.pickerMissingConfig'));
    }
    if (!pickerScriptPromiseRef.current) {
      pickerScriptPromiseRef.current = loadScript('https://apis.google.com/js/api.js').then(
        () =>
          new Promise<void>((resolve) => {
            const gapiClient = (
              window as Window & { gapi?: { load: (apiName: string, callback: () => void) => void } }
            ).gapi;
            if (!gapiClient) {
              throw new Error(t('googleSheets.pickerLoadError'));
            }
            gapiClient.load('picker', () => resolve());
          }),
      );
    }
    if (!gisScriptPromiseRef.current) {
      gisScriptPromiseRef.current = loadScript('https://accounts.google.com/gsi/client');
    }
    await Promise.all([pickerScriptPromiseRef.current, gisScriptPromiseRef.current]);
  }, [t]);

  const openPickerOverlay = useCallback(
    (accessToken: string) => {
      const view = new google.picker.DocsView(google.picker.ViewId.SPREADSHEETS)
        .setIncludeFolders(false)
        .setSelectFolderEnabled(false)
        .setMode(google.picker.DocsViewMode.LIST);
      const picker = new google.picker.PickerBuilder()
        .setDeveloperKey(GOOGLE_API_KEY)
        .setOAuthToken(accessToken)
        .addView(view)
        .setCallback((data: google.picker.ResponseObject) => {
          if (data.action === google.picker.Action.CANCEL) {
            setPickerLoading(false);
            onClose();
            return;
          }
          if (data.action !== google.picker.Action.PICKED) {
            return;
          }
          const doc = data.docs?.[0];
          if (!doc?.id) {
            setPickerLoading(false);
            return;
          }
          setSelectedSpreadsheet({
            id: doc.id,
            name: doc.name || t('googleSheets.unknownSpreadsheetName'),
          });
          setError(null);
          setPhase('form');
          setPickerLoading(false);
        })
        .build();
      flushSync(() => {
        setShowPickingBackdrop(false);
        setPickerLoading(false);
      });
      picker.setVisible(true);
    },
    [onClose, t],
  );

  const runPickerFlow = useCallback(async () => {
    try {
      setPickerLoading(true);
      setError(null);
      await ensurePickerReady();
      const googleClient = (window as Window & { google?: typeof google }).google;
      if (!googleClient?.accounts?.oauth2) {
        throw new Error(t('googleSheets.pickerLoadError'));
      }
      if (!pickerTokenClientRef.current) {
        pickerTokenClientRef.current = googleClient.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/drive.file',
          callback: () => {},
        });
      }
      pickerTokenClientRef.current.callback = (response) => {
        if (response.error || !response.access_token) {
          setError(t('googleSheets.pickerAuthError'));
          setPhase('form');
          setPickerLoading(false);
          return;
        }
        pickerGsAccessTokenRef.current = response.access_token;
        openPickerOverlay(response.access_token);
      };
      pickerTokenClientRef.current.requestAccessToken({ prompt: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('googleSheets.pickerLoadError'));
      setPhase('form');
      setPickerLoading(false);
    }
  }, [ensurePickerReady, openPickerOverlay, t]);

  useEffect(() => {
    if (!open || phase !== 'picking') {
      return;
    }
    const sig = `${importSessionId}:${pickerAttemptId}`;
    if (lastPickerLaunchSigRef.current === sig) {
      return;
    }
    lastPickerLaunchSigRef.current = sig;
    void runPickerFlow();
  }, [open, phase, pickerAttemptId, importSessionId, runPickerFlow]);

  const handlePickAnotherSpreadsheet = () => {
    setSelectedSpreadsheet(null);
    setSheetTitles([]);
    setSelectedSheet('');
    setError(null);
    setShowPickingBackdrop(true);
    setPickerAttemptId((id) => id + 1);
    setPhase('picking');
  };

  const handleImport = async () => {
    if (!selectedSpreadsheet) {
      setError(t('googleSheets.pickSpreadsheet'));
      return;
    }
    const pickerToken = pickerGsAccessTokenRef.current.trim();
    if (!pickerToken) {
      setError(t('googleSheets.pickerTokenRequired'));
      return;
    }

    try {
      setError(null);
      setIsImporting(true);
      const result = await cardsApi.importFromGoogleSheets(folderId, {
        spreadsheetId: selectedSpreadsheet.id,
        sheetName: selectedSheet.trim(),
        pickerAccessToken: pickerToken,
      });
      if (result.successCount > 0) {
        onSuccess();
        onClose();
      }
      if (result.errorCount > 0 && result.errors?.length) {
        setError(result.errors.slice(0, 3).join('; '));
      }
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } }; message?: string };
      setError(ax.response?.data?.message || ax.message || t('errors.generic'));
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const canImport =
    Boolean(selectedSpreadsheet) &&
    selectedSheet.trim().length > 0 &&
    !loadingSheetTitles;

  const sheetFieldDisabled = !selectedSpreadsheet || loadingSheetTitles;

  const isPickerTokenError = (message: string | null) =>
    Boolean(
      message &&
        (message.includes('Google Picker') ||
          message === t('googleSheets.pickerTokenRequired')),
    );

  if (!open) {
    return null;
  }

  if (phase === 'picking' && showPickingBackdrop) {
    return (
      <Backdrop
        open
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          color: '#fff',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress color="inherit" />
        <Typography variant="body2">{t('googleSheets.pickerLoading')}</Typography>
      </Backdrop>
    );
  }

  if (phase === 'picking' && !showPickingBackdrop) {
    return null;
  }

  return (
    <DialogUI
      open={open && phase === 'form'}
      onClose={handleClose}
      title={t('googleSheets.importTitle')}
      maxWidth="sm"
      fullWidth
      content={
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('googleSheets.importDescription')}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ flex: '1 1 auto' }}>
              {selectedSpreadsheet
                ? selectedSpreadsheet.name
                : t('googleSheets.noSpreadsheetSelected')}
            </Typography>
            {selectedSpreadsheet ? (
              <ButtonUI onClick={handlePickAnotherSpreadsheet} disabled={pickerLoading} size="small">
                {t('googleSheets.pickAnotherSpreadsheet')}
              </ButtonUI>
            ) : (
              <ButtonUI onClick={handlePickAnotherSpreadsheet} disabled={pickerLoading} size="small">
                {t('googleSheets.pickSpreadsheetButton')}
              </ButtonUI>
            )}
          </Box>
          {sheetTitles.length > 0 ? (
            <FormControl fullWidth sx={{ mb: 2 }} disabled={sheetFieldDisabled}>
              <InputLabel id="gs-sheet-tab-label">{t('googleSheets.sheetTabLabel')}</InputLabel>
              <Select
                labelId="gs-sheet-tab-label"
                label={t('googleSheets.sheetTabLabel')}
                value={selectedSheet}
                onChange={(e) => setSelectedSheet(e.target.value)}
              >
                {sheetTitles.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <TextField
              fullWidth
              label={t('googleSheets.sheetName')}
              value={selectedSheet}
              onChange={(e) => setSelectedSheet(e.target.value)}
              variant="outlined"
              disabled={sheetFieldDisabled}
              placeholder={
                loadingSheetTitles && selectedSpreadsheet
                  ? t('googleSheets.loadingSheetTabs')
                  : undefined
              }
              InputProps={{
                endAdornment:
                  loadingSheetTitles && selectedSpreadsheet ? (
                    <CircularProgress color="inherit" size={20} sx={{ mr: 1 }} />
                  ) : undefined,
              }}
              sx={{ mb: 2 }}
            />
          )}
          {error ? (
            <Alert
              severity="error"
              sx={{ mt: 2 }}
              action={
                isPickerTokenError(error) || !selectedSpreadsheet ? (
                  <ButtonUI
                    color="inherit"
                    size="small"
                    onClick={handlePickAnotherSpreadsheet}
                    disabled={pickerLoading}
                  >
                    {t('googleSheets.pickSpreadsheetButton')}
                  </ButtonUI>
                ) : undefined
              }
            >
              {error}
            </Alert>
          ) : null}
        </>
      }
      actions={
        <>
          <ButtonUI onClick={handleClose}>{t('auth.cancel')}</ButtonUI>
          <ButtonBlack
            onClick={handleImport}
            disabled={isImporting || !canImport}
            startIcon={
              isImporting ? (
                <CircularProgress size={16} thickness={5} sx={{ color: 'inherit' }} />
              ) : undefined
            }
          >
            {isImporting ? t('import.importing') : t('import.import')}
          </ButtonBlack>
        </>
      }
    />
  );
};
