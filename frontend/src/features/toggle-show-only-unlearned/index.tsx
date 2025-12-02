import { IconButton } from '@mui/material';
import { FilterList } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface ToggleShowOnlyUnlearnedProps {
    showOnlyUnlearned: boolean;
    onToggle: () => void;
}

export const ToggleShowOnlyUnlearned = ({ showOnlyUnlearned, onToggle }: ToggleShowOnlyUnlearnedProps) => {
    const { t } = useTranslation();

    return (
        <IconButton
            size="small"
            onClick={onToggle}
            color={showOnlyUnlearned ? 'primary' : 'default'}
            title={showOnlyUnlearned ? t('learning.learned') : t('learning.learned')}
        >
            <FilterList />
        </IconButton>
    );
};

