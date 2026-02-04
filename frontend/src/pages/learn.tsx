import { useEffect, useMemo, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Container } from '@mui/material';

import { useCardLearning } from '@/features/card-learning/model/useCardLearning';
import { LearnProcess } from '@/widgets/learn';
import { ErrorBlock,
    // MessageBlock
} from '@/entities';
import { useFoldersStore } from '@/shared/store/foldersStore';
import { useTranslation } from 'react-i18next';
import { useSEO } from '@/shared/hooks/useSEO';

export const LearnPage = () => {
    const { t, i18n } = useTranslation();
    const { folderId } = useParams<{ userId?: string; folderId?: string }>();
    const [searchParams] = useSearchParams();
    const { folders } = useFoldersStore();
    
    // Получаем initialSide из URL сразу, до создания хука
    const initialSideFromUrl = (searchParams.get('initialSide') || 'question') as 'question' | 'answer';
    const learning = useCardLearning(folderId, initialSideFromUrl);

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

    // Инициализируем режим и начальную сторону из URL параметров
    // Используем ref для отслеживания, был ли уже установлен режим
    const modeInitializedRef = useRef(false);
    useEffect(() => {
        const mode = searchParams.get('mode');
        const initialSide = searchParams.get('initialSide') || 'question';
        
        // Устанавливаем начальную сторону
        learning.setInitialSide(initialSide as 'question' | 'answer');
        
        // Устанавливаем режим только один раз при монтировании или изменении searchParams
        if (!modeInitializedRef.current || mode) {
            if (mode === 'unlearned') {
                setTimeout(() => {
                    learning.setLearningMode(true);
                }, 150);
            } else if (mode === 'phrases') {
                setTimeout(() => {
                    learning.setPhrasesMode(true);
                }, 150);
            }
            modeInitializedRef.current = true;
        }
    }, [searchParams]); // Убрали learning из зависимостей


    // const CardNotFoundState = !learning.isCompleted && (learning.currentIndex >= learning.displayCards.length || !learning.currentCard);

    if (learning.error) {
        return (
            <Container maxWidth="md" sx={{mt: 4}}>
                <ErrorBlock error={learning.error}/>
            </Container>
        );
    }

    // if (CardNotFoundState) {
    //     return (
    //         <Container maxWidth="md" sx={{mt: 4}}>
    //             <MessageBlock message={'errors.notFound'}/>
    //         </Container>
    //     );
    // }

    return (
        <Container maxWidth="md" sx={{mt: 0, height: '100vh'}}>
            <LearnProcess learning={learning}/>
        </Container>
    );
};
