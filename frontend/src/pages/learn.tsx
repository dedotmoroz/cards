import {useEffect} from 'react';
import {useParams, useSearchParams} from 'react-router-dom';
import {Container } from '@mui/material';

import {useCardLearning} from '@/features/card-learning/model/useCardLearning';
import {LearnProcess} from '@/widgets/learn';
import {ErrorBlock, MessageBlock} from '@/entities';
import { SEO } from '@/shared/libs/useSEO';
import { useTranslation } from 'react-i18next';
import { useFoldersStore } from '@/shared/store/foldersStore';
import { useMemo } from 'react';

export const LearnPage = () => {
    const { t } = useTranslation();
    const {folderId} = useParams<{ folderId: string }>();
    const [searchParams] = useSearchParams();
    const learning = useCardLearning(folderId);
    const { folders } = useFoldersStore();
    
    // Находим название папки по folderId
    const folderName = useMemo(() => {
        if (!folderId) return null;
        const folder = folders.find(f => f.id === folderId);
        return folder?.name || null;
    }, [folderId, folders]);
    
    // Формируем title с названием папки, если оно есть
    const pageTitle = useMemo(() => {
        const baseTitle = t('seo.learn.title');
        return folderName ? `${baseTitle} - ${folderName}` : baseTitle;
    }, [t, folderName]);


    useEffect(() => {
        const mode = searchParams.get('mode');
        if (mode === 'unlearned') {
            learning.setLearningMode(true);
        }
    }, [searchParams]);

    const NoCardsState = !learning.cards.length;
    const AllCardsLearnedState = learning.showOnlyUnlearned && learning.displayCards.length === 0;
    const CardNotFoundState = !learning.isCompleted && (learning.currentIndex >= learning.displayCards.length || !learning.currentCard);
    // const notCurrentCard = !learning.currentCard;

    if (learning.error) {
        return (
            <Container maxWidth="md" sx={{mt: 4}}>
                <ErrorBlock error={learning.error}/>
            </Container>
        );
    }

    if (NoCardsState) {
        return (
            <Container maxWidth="md" sx={{mt: 4}}>
                <MessageBlock message={'learning.allLearned'}/>
            </Container>
        );
    }

    if (AllCardsLearnedState) {
        return (
            <Container maxWidth="md" sx={{mt: 4}}>
                <MessageBlock message={'learning.allLearned'}/>
            </Container>
        );
    }

    if (CardNotFoundState) {
        return (
            <Container maxWidth="md" sx={{mt: 4}}>
                <MessageBlock message={'errors.notFound'}/>
            </Container>
        );
    }

    return (
        <>
            <SEO 
                title={pageTitle}
                description={t('seo.learn.description')}
            />
            <Container maxWidth="md" sx={{mt: 4,}}>
                <LearnProcess learning={learning}/>
            </Container>
        </>
    );
};
