import { useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Container } from '@mui/material';

import { useCardLearning } from '@/features/card-learning/model/useCardLearning';
import { LearnProcess } from '@/widgets/learn';
import { ErrorBlock, MessageBlock } from '@/entities';
import { useFoldersStore } from '@/shared/store/foldersStore';
import { useTranslation } from 'react-i18next';
import { useSEO } from '@/shared/hooks/useSEO';

export const LearnPage = () => {
    const { t, i18n } = useTranslation();
    const { folderId } = useParams<{ folderId: string }>();
    const [searchParams] = useSearchParams();
    const learning = useCardLearning(folderId);
    const { folders } = useFoldersStore();

    const folderName = useMemo(() => {
        if (!folderId) {
            return null;
        }
        const folder = folders.find((item) => item.id === folderId);
        return folder?.name ?? null;
    }, [folderId, folders]);

    const pageTitle = useMemo(() => {
        const baseTitle = t('seo.learn.title');
        return folderName ? `${baseTitle} - ${folderName}` : baseTitle;
    }, [t, folderName]);

    useSEO({
        title: pageTitle,
        description: t('seo.learn.description'),
        keywords: t('seo.keywords'),
        lang: i18n.language
    });

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

    // if (notCurrentCard) {
    //     return (
    //         <Container maxWidth="md" sx={{mt: 4}}>
    //             <MessageBlock message={'errors.notFound'}/>
    //         </Container>
    //     );
    // }


    return (
        <Container maxWidth="md" sx={{mt: 4,}}>
            <LearnProcess learning={learning}/>
        </Container>
    );
};
