import {useEffect} from 'react';
import {useParams, useSearchParams} from 'react-router-dom';
import {Container} from '@mui/material';

import {useCardLearning} from '@/features/card-learning/model/useCardLearning';
import {LearnProcess} from '@/widgets/learn';

import {ErrorBlock, MessageBlock} from '@/entities'

export const LearnPage = () => {
    const {folderId} = useParams<{ folderId: string }>();
    const [searchParams] = useSearchParams();
    const learning = useCardLearning(folderId);


    useEffect(() => {
        const mode = searchParams.get('mode');
        if (mode === 'unlearned') {
            learning.setLearningMode(true);
        }
    }, [searchParams, learning]);


    const NoCardsState = !learning.cards.length;
    const AllCardsLearnedState = learning.showOnlyUnlearned && learning.displayCards.length === 0;
    const CardNotFoundState = !learning.isCompleted && (learning.currentIndex >= learning.displayCards.length || !learning.currentCard);


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
        <Container maxWidth="md" sx={{mt: 4,}}>
            <LearnProcess learning={learning}/>
        </Container>
    );
};
