import { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import { useTranslation } from 'react-i18next';
import { DialogUI } from '@/shared/ui/dialog-ui';
import { ButtonUI } from '@/shared/ui/button-ui';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { cardsApi } from '@/shared/api/cardsApi';
import { useAuthStore } from '@/shared/store/authStore';
import { useAppNavigate } from '@/shared/libs/use-app-navigate';
import type { CardSearchResult } from '@/shared/types/cards';

interface SearchCardsDialogProps {
  open: boolean;
  onClose: () => void;
}

export const SearchCardsDialog = ({ open, onClose }: SearchCardsDialogProps) => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const userId = useAuthStore((state) => state.user?.id);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CardSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query.trim(), 300);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setError(null);
      setIsLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (debouncedQuery.length < 2) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    void cardsApi
      .searchCards({ q: debouncedQuery, limit: 30 })
      .then((items) => {
        if (!cancelled) {
          setResults(items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(t('folders.search.error'));
          setResults([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, open, t]);

  const handleResultClick = (result: CardSearchResult) => {
    if (!userId) return;
    navigate(`/learn/${userId}/${result.folderId}?cardId=${result.id}`);
    onClose();
  };

  const showHint = query.trim().length > 0 && query.trim().length < 2;
  const showEmpty =
    debouncedQuery.length >= 2 && !isLoading && !error && results.length === 0;

  return (
    <DialogUI
      open={open}
      onClose={onClose}
      title={t('folders.search.title')}
      fullWidth
      maxWidth="sm"
      content={
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            autoFocus
            fullWidth
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('folders.search.placeholder')}
            aria-label={t('folders.search.placeholder')}
          />
          {showHint ? (
            <Typography variant="body2" color="text.secondary">
              {t('folders.search.minChars')}
            </Typography>
          ) : null}
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={28} />
            </Box>
          ) : null}
          {error ? (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          ) : null}
          {showEmpty ? (
            <Typography variant="body2" color="text.secondary">
              {t('folders.search.noResults')}
            </Typography>
          ) : null}
          {results.length > 0 ? (
            <List dense disablePadding>
              {results.map((result) => (
                <ListItemButton
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  sx={{ alignItems: 'flex-start', py: 1.5 }}
                >
                  <ListItemText
                    primary={result.question}
                    secondary={
                      <Box component="span" sx={{ display: 'block' }}>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ display: 'block' }}
                        >
                          {result.answer}
                        </Typography>
                        <Box
                          component="span"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            mt: 0.5,
                            flexWrap: 'wrap',
                          }}
                        >
                          <FolderOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography component="span" variant="caption" color="text.secondary">
                            {result.folderName || t('folders.search.unknownFolder')}
                          </Typography>
                          <Typography component="span" variant="caption" color="text.secondary">
                            ·{' '}
                            {result.isLearned
                              ? t('folders.search.learned')
                              : t('folders.search.notLearned')}
                          </Typography>
                        </Box>
                      </Box>
                    }
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItemButton>
              ))}
            </List>
          ) : null}
        </Box>
      }
      actions={<ButtonUI onClick={onClose}>{t('auth.cancel')}</ButtonUI>}
    />
  );
};
