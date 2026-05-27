import React, { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Backdrop,
  Box,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import { DialogUI } from '@/shared/ui/dialog-ui';
import { ButtonUI } from '@/shared/ui/button-ui';
import { cardsApi } from '@/shared/api/cardsApi';
import { ButtonBlack } from '@/shared/ui';
import { GOOGLE_API_KEY, GOOGLE_CLIENT_ID } from '@/shared/config/api';

type ExportMode = 'new' | 'existing';
type WriteMode = 'overwrite' | 'append';
type Phase = 'closed' | 'picking' | 'form';

interface ExportGoogleSheetsDialogProps {
  open: boolean;
  folderId: string;
  folderName: string;
  onClose: () => void;
}

export const ExportGoogleSheetsDialog: React.FC<ExportGoogleSheetsDialogProps> = ({
  open,
  folderId,
  folderName,
  onClose,
}) => {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>('closed');
  const [pickerAttemptId, setPickerAttemptId] = useState(0);
  const [exportMode, setExportMode] = useState<ExportMode>('new');
  const [writeMode, setWriteMode] = useState<WriteMode>('overwrite');
  const [overwriteConfirmed, setOverwriteConfirmed] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [sheetTitles, setSheetTitles] = useState<string[]>([]);
  const [loadingSheetTitles, setLoadingSheetTitles] = useState(false);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [showPickingBackdrop, setShowPickingBackdrop] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const pickerTokenClientRef = useRef<google.accounts.oauth2.TokenClient | null>(null);
  const pickerScriptPromiseRef = useRef<Promise<void> | null>(null);
  const gisScriptPromiseRef = useRef<Promise<void> | null>(null);
  const lastPickerLaunchSigRef = useRef('');
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

  useEffect(() => {
    if (!open) {
      setPhase('closed');
      setPickerAttemptId(0);
      lastPickerLaunchSigRef.current = '';
      pickerGsAccessTokenRef.current = '';
      return;
    }

    setExportMode('new');
    setWriteMode('overwrite');
    setOverwriteConfirmed(false);
    setTitle(`${folderName}_${new Date().toISOString().split('T')[0]}`);
    setSelectedSpreadsheet(null);
    setSheetTitles([]);
    setSelectedSheet('');
    setError(null);
    setPhase('form');
  }, [open, folderName]);

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
            setPhase('form');
            return;
          }
          if (data.action !== google.picker.Action.PICKED) {
            return;
          }
          const doc = data.docs?.[0];
          if (!doc?.id) {
            setPickerLoading(false);
            setPhase('form');
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
    [t],
  );

  const requestAccessToken = useCallback(async (): Promise<string> => {
    const existing = pickerGsAccessTokenRef.current.trim();
    if (existing) {
      return existing;
    }
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
    return new Promise<string>((resolve, reject) => {
      pickerTokenClientRef.current!.callback = (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(t('googleSheets.pickerAuthError')));
          return;
        }
        pickerGsAccessTokenRef.current = response.access_token;
        resolve(response.access_token);
      };
      pickerTokenClientRef.current!.requestAccessToken({ prompt: '' });
    });
  }, [ensurePickerReady, t]);

  const runPickerFlow = useCallback(async () => {
    try {
      setPickerLoading(true);
      setError(null);
      setShowPickingBackdrop(true);
      setPhase('picking');
      const token = await requestAccessToken();
      openPickerOverlay(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('googleSheets.pickerLoadError'));
      setPhase('form');
      setPickerLoading(false);
      setShowPickingBackdrop(false);
    }
  }, [openPickerOverlay, requestAccessToken, t]);

  useEffect(() => {
    if (!open || phase !== 'picking' || exportMode !== 'existing') {
      return;
    }
    const sig = `export:${pickerAttemptId}`;
    if (lastPickerLaunchSigRef.current === sig) {
      return;
    }
    lastPickerLaunchSigRef.current = sig;
    void runPickerFlow();
  }, [open, phase, pickerAttemptId, exportMode, runPickerFlow]);

  const handlePickSpreadsheet = () => {
    setPickerAttemptId((id) => id + 1);
    setShowPickingBackdrop(true);
    setPhase('picking');
  };

  const handleExportModeChange = (mode: ExportMode) => {
    setExportMode(mode);
    setError(null);
    if (mode === 'new') {
      setSelectedSpreadsheet(null);
      setSheetTitles([]);
      setSelectedSheet('');
    }
  };

  const handleExport = async () => {
    if (exportMode === 'existing' && !selectedSpreadsheet) {
      setError(t('googleSheets.pickSpreadsheet'));
      return;
    }
    if (
      exportMode === 'existing' &&
      writeMode === 'overwrite' &&
      !overwriteConfirmed
    ) {
      setError(t('googleSheets.exportOverwriteConfirmRequired'));
      return;
    }

    try {
      setError(null);
      setIsExporting(true);
      const pickerToken = await requestAccessToken();

      const result = await cardsApi.exportToGoogleSheets(folderId, {
        mode: exportMode,
        pickerAccessToken: pickerToken,
        title:
          exportMode === 'new'
            ? title.trim() || `${folderName}_${new Date().toISOString().split('T')[0]}`
            : undefined,
        spreadsheetId: exportMode === 'existing' ? selectedSpreadsheet!.id : undefined,
        sheetName: exportMode === 'existing' ? selectedSheet.trim() : undefined,
        append: exportMode === 'existing' && writeMode === 'append',
      });

      window.open(result.spreadsheetUrl, '_blank', 'noopener,noreferrer');
      onClose();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } }; message?: string };
      setError(ax.response?.data?.message || ax.message || t('errors.generic'));
    } finally {
      setIsExporting(false);
    }
  };

  const canExport =
    exportMode === 'new' ||
    (Boolean(selectedSpreadsheet) &&
      selectedSheet.trim().length > 0 &&
      !loadingSheetTitles &&
      (writeMode !== 'overwrite' || overwriteConfirmed));

  const sheetFieldDisabled = exportMode !== 'existing' || !selectedSpreadsheet || loadingSheetTitles;

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
      onClose={onClose}
      title={t('googleSheets.exportTitle')}
      maxWidth="sm"
      fullWidth
      content={
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('googleSheets.exportDescription')}
          </Typography>

          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <RadioGroup
              value={exportMode}
              onChange={(e) => handleExportModeChange(e.target.value as ExportMode)}
            >
              <FormControlLabel
                value="new"
                control={<Radio />}
                label={t('googleSheets.exportModeNew')}
              />
              <FormControlLabel
                value="existing"
                control={<Radio />}
                label={t('googleSheets.exportModeExisting')}
              />
            </RadioGroup>
          </FormControl>

          {exportMode === 'new' ? (
            <TextField
              fullWidth
              label={t('googleSheets.exportNewTitleLabel')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            />
          ) : (
            <>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ flex: '1 1 auto' }}>
                  {selectedSpreadsheet
                    ? selectedSpreadsheet.name
                    : t('googleSheets.noSpreadsheetSelected')}
                </Typography>
                <ButtonUI onClick={handlePickSpreadsheet} disabled={pickerLoading} size="small">
                  {selectedSpreadsheet
                    ? t('googleSheets.pickAnotherSpreadsheet')
                    : t('googleSheets.pickSpreadsheetButton')}
                </ButtonUI>
              </Box>

              {sheetTitles.length > 0 ? (
                <FormControl fullWidth sx={{ mb: 2 }} disabled={sheetFieldDisabled}>
                  <InputLabel id="gs-export-sheet-tab-label">
                    {t('googleSheets.sheetTabLabel')}
                  </InputLabel>
                  <Select
                    labelId="gs-export-sheet-tab-label"
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

              <FormControl component="fieldset" sx={{ mb: 1 }}>
                <RadioGroup
                  value={writeMode}
                  onChange={(e) => {
                    setWriteMode(e.target.value as WriteMode);
                    setOverwriteConfirmed(false);
                  }}
                >
                  <FormControlLabel
                    value="overwrite"
                    control={<Radio />}
                    label={t('googleSheets.exportWriteOverwrite')}
                  />
                  <FormControlLabel
                    value="append"
                    control={<Radio />}
                    label={t('googleSheets.exportWriteAppend')}
                  />
                </RadioGroup>
              </FormControl>

              {writeMode === 'overwrite' ? (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={overwriteConfirmed}
                      onChange={(e) => setOverwriteConfirmed(e.target.checked)}
                    />
                  }
                  label={t('googleSheets.exportOverwriteConfirm')}
                  sx={{ mb: 2, alignItems: 'flex-start' }}
                />
              ) : null}
            </>
          )}

          {error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          ) : null}
        </>
      }
      actions={
        <>
          <ButtonUI onClick={onClose}>{t('auth.cancel')}</ButtonUI>
          <ButtonBlack
            onClick={handleExport}
            disabled={isExporting || !canExport}
            startIcon={
              isExporting ? (
                <CircularProgress size={16} thickness={5} sx={{ color: 'inherit' }} />
              ) : undefined
            }
          >
            {isExporting ? t('googleSheets.exportingToSheets') : t('googleSheets.exportToSheets')}
          </ButtonBlack>
        </>
      }
    />
  );
};
