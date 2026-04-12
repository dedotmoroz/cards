import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Autocomplete,
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
import {ButtonBlack} from "@/shared/ui";

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
  const [spreadsheetOptions, setSpreadsheetOptions] = useState<{ id: string; name: string }[]>(
    []
  );
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [loadingSpreadsheets, setLoadingSpreadsheets] = useState(false);
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [sheetTitles, setSheetTitles] = useState<string[]>([]);
  const [loadingSheetTitles, setLoadingSheetTitles] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState('Sheet1');
  const [error, setError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadSpreadsheets = useCallback(
    async (q: string, pageToken: string | undefined, append: boolean) => {
      setLoadingSpreadsheets(true);
      if (!append) {
        setListError(null);
      }
      try {
        const res = await cardsApi.listGoogleSpreadsheets({
          q: q || undefined,
          pageToken,
        });
        if (append) {
          setSpreadsheetOptions((prev) => [...prev, ...res.files]);
        } else {
          setSpreadsheetOptions(res.files);
        }
        setNextPageToken(res.nextPageToken);
      } catch {
        if (!append) {
          setListError(t('googleSheets.listSpreadsheetsError'));
          setSpreadsheetOptions([]);
          setNextPageToken(undefined);
        }
      } finally {
        setLoadingSpreadsheets(false);
      }
    },
    [t]
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    setSpreadsheetOptions([]);
    setNextPageToken(undefined);
    setSelectedSpreadsheet(null);
    setInputValue('');
    setSheetTitles([]);
    setSelectedSheet('Sheet1');
    setError(null);
    setListError(null);
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
    loadSpreadsheets('', undefined, false);
  }, [open, loadSpreadsheets]);

  useEffect(() => {
    if (!selectedSpreadsheet) {
      setSheetTitles([]);
      setSelectedSheet('Sheet1');
      return;
    }
    let cancelled = false;
    setLoadingSheetTitles(true);
    cardsApi
      .getGoogleSpreadsheetSheetTitles(selectedSpreadsheet.id)
      .then((res) => {
        if (cancelled) return;
        const titles = res.titles;
        setSheetTitles(titles);
        setSelectedSheet(titles[0] ?? 'Sheet1');
      })
      .catch(() => {
        if (cancelled) return;
        setSheetTitles([]);
        setSelectedSheet('Sheet1');
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingSheetTitles(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selectedSpreadsheet]);

  const handleSpreadsheetInputChange = (
    _: unknown,
    newInputValue: string,
    reason: string
  ) => {
    if (reason === 'reset') {
      setInputValue(newInputValue);
      return;
    }
    setInputValue(newInputValue);
    if (reason === 'clear') {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = null;
      }
      loadSpreadsheets('', undefined, false);
      return;
    }
    if (reason !== 'input') {
      return;
    }
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = setTimeout(() => {
      loadSpreadsheets(newInputValue.trim(), undefined, false);
    }, 400);
  };

  const handleLoadMore = () => {
    if (!nextPageToken || loadingSpreadsheets) {
      return;
    }
    loadSpreadsheets(inputValue.trim(), nextPageToken, true);
  };

  const handleImport = async () => {
    if (!selectedSpreadsheet) {
      setError(t('googleSheets.pickSpreadsheet'));
      return;
    }

    try {
      setError(null);
      setIsImporting(true);
      const result = await cardsApi.importFromGoogleSheets(folderId, {
        spreadsheetId: selectedSpreadsheet.id,
        sheetName: selectedSheet.trim() || 'Sheet1',
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
    setListError(null);
    onClose();
  };

  const canImport =
    Boolean(selectedSpreadsheet) &&
    selectedSheet.trim().length > 0 &&
    !loadingSheetTitles;

  return (
    <DialogUI
      open={open}
      onClose={handleClose}
      title={t('googleSheets.importTitle')}
      maxWidth="sm"
      fullWidth
      content={
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('googleSheets.importDescription')}
          </Typography>
          <Autocomplete
            options={spreadsheetOptions}
            loading={loadingSpreadsheets}
            getOptionLabel={(o) => o.name}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            value={selectedSpreadsheet}
            onChange={(_, v) => setSelectedSpreadsheet(v)}
            inputValue={inputValue}
            onInputChange={handleSpreadsheetInputChange}
            filterOptions={(opts) => opts}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('googleSheets.spreadsheetPickerLabel')}
                placeholder={t('googleSheets.spreadsheetSearchPlaceholder')}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingSpreadsheets ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            sx={{ mb: 2 }}
          />
          {nextPageToken ? (
            <Box sx={{ mb: 2 }}>
              <ButtonUI
                size="small"
                variant="outlined"
                onClick={handleLoadMore}
                disabled={loadingSpreadsheets}
              >
                {t('googleSheets.loadMoreSpreadsheets')}
              </ButtonUI>
            </Box>
          ) : null}
          {listError ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {listError}
            </Alert>
          ) : null}
          {loadingSheetTitles && selectedSpreadsheet ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CircularProgress size={22} />
              <Typography variant="body2" color="text.secondary">
                {t('googleSheets.loadingSheetTabs')}
              </Typography>
            </Box>
          ) : sheetTitles.length > 0 ? (
            <FormControl fullWidth sx={{ mb: 2 }}>
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
              sx={{ mb: 2 }}
            />
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
          <ButtonUI onClick={handleClose} >
            {t('auth.cancel')}
          </ButtonUI>
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
