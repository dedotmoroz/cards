import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCollection, type CollectionItem } from '@/shared/api/collectionsApi';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    FormControlLabel,
    FormGroup,
    Typography,
} from '@mui/material';
import { foldersApi } from '@/shared/api/foldersApi';
import { cardsApi } from '@/shared/api/cardsApi';
import { useTranslation } from 'react-i18next';
import { useSEO } from '@/shared/hooks/useSEO';
import { SITE_BASE_URL } from '@/shared/config/api';
import { PageLayout } from '@/entities';
import { PageLoader, ButtonColor, CheckboxUI, HeaderCollection } from '@/shared/ui';
import { useAuthStore } from '@/shared/store/authStore';
import { Footer } from '@/widgets/landing/footer.tsx';

type WordItem = {
    word: string;
    translationWord: string;
    context: string;
    translationContext: string;
};

function parseCollectionWords(
    words: unknown
): { folderName: string | null; items: WordItem[] } {
    if (!words || typeof words !== 'object') return { folderName: null, items: [] };
    const obj = words as Record<string, unknown>;

    const folderName = typeof obj.folderName === 'string' && obj.folderName.trim()
        ? obj.folderName.trim()
        : null;

    // Find first array that looks like [{ word: string, ... }, ...]
    for (const value of Object.values(obj)) {
        if (!Array.isArray(value)) continue;
        const arr = value as Array<unknown>;
        const items: WordItem[] = arr
            .map((x) => (x && typeof x === 'object' ? (x as Record<string, unknown>) : null))
            .filter((x): x is Record<string, unknown> => Boolean(x))
            .map((x) => {
                const word = typeof x.word === 'string' ? x.word.trim() : '';
                const translationWord =
                    typeof x.translationWord === 'string' ? x.translationWord.trim() : '';
                const context = typeof x.context === 'string' ? x.context.trim() : '';
                const translationContext =
                    typeof x.translationContext === 'string' ? x.translationContext.trim() : '';

                return { word, translationWord, context, translationContext };
            })
            .filter((x) => x.word.length > 0);

        if (items.length > 0) return { folderName, items };
    }

    return { folderName, items: [] };
}

export function CollectionDetailPage() {
    const { locale, slug } = useParams<{ locale: string; slug: string }>();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { user, createGuest } = useAuthStore();
    const [collection, setCollection] = useState<CollectionItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [checked, setChecked] = useState<Record<string, boolean>>({});
    const [isImporting, setIsImporting] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const [importSuccess, setImportSuccess] = useState<string | null>(null);
    const [createdFolderId, setCreatedFolderId] = useState<string | null>(null);
    const [showGuestPrompt, setShowGuestPrompt] = useState(false);

    useEffect(() => {
        if (!locale || !slug) return;
        getCollection(locale, slug)
            .then(setCollection)
            .finally(() => setLoading(false));
    }, [locale, slug]);

    useSEO({
        title: collection ? (collection.seoTitle ?? collection.title) : undefined,
        description: collection?.seoDescription ?? undefined,
        canonical: locale && slug ? `${SITE_BASE_URL}/collections/${locale}/${slug}` : undefined,
        lang: locale ?? undefined,
    });

    const wordsData = useMemo(
        () => parseCollectionWords(collection?.words),
        [collection?.words]
    );

    // By default: all words checked (reset on collection change)
    useEffect(() => {
        const nextChecked: Record<string, boolean> = {};
        wordsData.items.forEach((_, idx) => {
            nextChecked[String(idx)] = true;
        });
        setChecked(nextChecked);
        setImportError(null);
        setImportSuccess(null);
        setCreatedFolderId(null);
        setShowGuestPrompt(false);
    }, [collection?.id, wordsData.items.length]);

    if (loading) return <PageLoader />;
    if (!collection) return <div>Collection not found</div>;

    const selectedIndexes = Object.entries(checked)
        .filter(([, v]) => v)
        .map(([k]) => Number(k))
        .filter((n) => Number.isFinite(n));
    const selectedItems = selectedIndexes
        .map((idx) => wordsData.items[idx])
        .filter(Boolean);

    const runImport = async () => {
        setImportError(null);
        setImportSuccess(null);
        setCreatedFolderId(null);
        setShowGuestPrompt(false);

        const folderName = wordsData.folderName;
        if (!folderName) {
            setImportError(t('collections.wordsImport.errors.missingFolderName'));
            return;
        }
        if (selectedItems.length === 0) {
            setImportError(t('collections.wordsImport.errors.selectAtLeastOne'));
            return;
        }

        const existingFolders = await foldersApi.getFolders();
        const alreadyExists = existingFolders.some((f) => f.name === folderName);
        if (alreadyExists) {
            setImportError(t('collections.wordsImport.errors.folderExists', { folderName }));
            return;
        }

        const folder = await foldersApi.createFolder({ name: folderName });

        await Promise.all(
            selectedItems.map((item) =>
                cardsApi.createCard({
                    folderId: folder.id,
                    question: item.word,
                    answer: item.translationWord,
                    questionSentences: item.context || undefined,
                    answerSentences: item.translationContext || undefined,
                })
            )
        );

        setImportSuccess(t('collections.wordsImport.success', { count: selectedItems.length }));
        setCreatedFolderId(folder.id);
    };

    const handleImport = async () => {
        // If not authenticated, show guest prompt instead of failing foldersApi
        if (!user) {
            setImportError(null);
            setImportSuccess(null);
            setCreatedFolderId(null);
            setShowGuestPrompt(true);
            return;
        }

        setIsImporting(true);
        try {
            await runImport();
        } catch (e) {
            setImportError(e instanceof Error ? e.message : t('collections.wordsImport.errors.importFailed'));
        } finally {
            setIsImporting(false);
        }
    };

    const handleCreateGuestAndImport = async () => {
        setImportError(null);
        setImportSuccess(null);
        setCreatedFolderId(null);

        setIsImporting(true);
        try {
            const language = i18n.language || 'ru';
            await createGuest(language);
            await runImport();
        } catch (e) {
            setImportError(e instanceof Error ? e.message : t('collections.wordsImport.errors.importFailed'));
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                boxSizing: 'border-box',
                pt: { xs: '56px', sm: '64px' },
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <HeaderCollection />
            <Box sx={{ flex: '1 1 auto' }}>
                <PageLayout
                    title={collection.title}
                    content={
                        <Box>
                            {wordsData.items.length > 0 ? (
                                <Box
                                    sx={{
                                        '& ul': { margin: 0, paddingLeft: 2 },
                                        '& li': { color: 'text.secondary' },
                                    }}
                                >
                                    {wordsData.items.map((item, idx) => (
                                        <Box key={`${item.word}-${idx}`} sx={{ mb: 2 }}>
                                            <Typography
                                                component="h5"
                                                variant="subtitle1"
                                                sx={{ fontWeight: 600 }}
                                            >
                                                {item.word}
                                                {item.translationWord ? ` - ${item.translationWord}` : ''}
                                            </Typography>
                                            {item.context || item.translationContext ? (
                                                <Box component="ul">
                                                    {item.context ? <Box component="li">{item.context}</Box> : null}
                                                    {item.translationContext ? (
                                                        <Box component="li">{item.translationContext}</Box>
                                                    ) : null}
                                                </Box>
                                            ) : null}
                                        </Box>
                                    ))}
                                </Box>
                            ) : null}

                            {wordsData.items.length > 0 ? (
                                <Box sx={{ mt: 2 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            mb: 1,
                                            mt: 5,
                                        }}
                                    >
                                        <Typography variant="h5">
                                            {t('collections.wordsImport.title')}
                                        </Typography>
                                        <ButtonColor
                                            variant="contained"
                                            onClick={handleImport}
                                            style={{
                                                width: 'fit-content',
                                                flexShrink: 0,
                                                padding: '8px 30px',
                                            }}
                                            disabled={isImporting || selectedItems.length === 0}
                                            startIcon={
                                                isImporting ? <CircularProgress size={18} /> : undefined
                                            }
                                        >
                                            {t('collections.wordsImport.takeButton')}
                                        </ButtonColor>
                                    </Box>

                                    {showGuestPrompt ? (
                                        <Alert
                                            severity="warning"
                                            sx={{ mb: 1 }}
                                            action={
                                                <Button
                                                    color="inherit"
                                                    size="small"
                                                    onClick={handleCreateGuestAndImport}
                                                    disabled={isImporting}
                                                >
                                                    {t('collections.wordsImport.createGuestButton')}
                                                </Button>
                                            }
                                        >
                                            {t('collections.wordsImport.guestPrompt')}
                                        </Alert>
                                    ) : null}

                                    {importError ? (
                                        <Alert severity="error" sx={{ mb: 1 }}>
                                            {importError}
                                        </Alert>
                                    ) : null}
                                    {importSuccess ? (
                                        <Alert
                                            severity="success"
                                            sx={{ mb: 1 }}
                                            action={
                                                createdFolderId && user?.id ? (
                                                    <Button
                                                        color="inherit"
                                                        size="small"
                                                        onClick={() =>
                                                            navigate(`/learn/${user.id}/${createdFolderId}`)
                                                        }
                                                    >
                                                        {t('collections.wordsImport.goToFolder')}
                                                    </Button>
                                                ) : null
                                            }
                                        >
                                            {importSuccess}
                                        </Alert>
                                    ) : null}

                                    <FormGroup sx={{ alignItems: 'flex-start' }}>
                                        {wordsData.items.map((item, idx) => (
                                            <FormControlLabel
                                                sx={{ pt: 2, pl: 3, width: 'fit-content' }}
                                                key={`${item.word}-${idx}`}
                                                control={
                                                    <CheckboxUI
                                                        sx={{ pr: 1 }}
                                                        checked={Boolean(checked[String(idx)])}
                                                        onChange={(e) =>
                                                            setChecked((prev) => ({
                                                                ...prev,
                                                                [String(idx)]: e.target.checked,
                                                            }))
                                                        }
                                                    />
                                                }
                                                label={item.word}
                                            />
                                        ))}
                                    </FormGroup>
                                </Box>
                            ) : null}
                        </Box>
                    }
                    backTo="/collections"
                />
            </Box>
            <Box sx={{ mt: 'auto', pt: 5 }}>
                <Footer />
            </Box>
        </Box>
    );
}
