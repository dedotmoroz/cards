import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextField, Typography, Alert } from '@mui/material';
import { DialogUI } from '@/shared/ui/dialog-ui';
import { ButtonUI } from '@/shared/ui/button-ui';
import { cardsApi } from '@/shared/api/cardsApi';

function extractSpreadsheetId(input: string): string | null {
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9-_]+$/.test(trimmed)) return trimmed;
  return null;
}

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
  const [urlOrId, setUrlOrId] = useState('');
  const [sheetName, setSheetName] = useState('Sheet1');
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    const spreadsheetId = extractSpreadsheetId(urlOrId);
    if (!spreadsheetId) {
      setError(t('googleSheets.invalidUrl'));
      return;
    }

    try {
      setError(null);
      setIsImporting(true);
      const result = await cardsApi.importFromGoogleSheets(folderId, {
        spreadsheetId,
        sheetName: sheetName.trim() || 'Sheet1',
      });
      if (result.successCount > 0) {
        onSuccess();
        onClose();
        setUrlOrId('');
      }
      if (result.errorCount > 0 && result.errors?.length) {
        setError(result.errors.slice(0, 3).join('; '));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || t('errors.generic'));
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setUrlOrId('');
    onClose();
  };

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
          <TextField
            fullWidth
            label={t('googleSheets.spreadsheetUrlOrId')}
            value={urlOrId}
            onChange={(e) => setUrlOrId(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/... or spreadsheet ID"
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label={t('googleSheets.sheetName')}
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            placeholder="Sheet1"
            variant="outlined"
            sx={{ mb: 2 }}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </>
      }
      actions={
        <>
          <ButtonUI onClick={handleClose} variant="outlined">
            {t('auth.cancel')}
          </ButtonUI>
          <ButtonUI onClick={handleImport} disabled={isImporting}>
            {isImporting ? t('import.importing') : t('import.import')}
          </ButtonUI>
        </>
      }
    />
  );
};
