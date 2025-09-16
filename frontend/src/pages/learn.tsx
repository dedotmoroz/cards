import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';

export function LearnPage() {
    const { folderId } = useParams();

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Изучение карточек
            </Typography>
            <Typography variant="body1">Папка: {folderId}</Typography>
            {/* Тут будет логика обучения */}
        </div>
    );
}