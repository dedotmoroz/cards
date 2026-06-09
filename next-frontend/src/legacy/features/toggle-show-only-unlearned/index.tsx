import { useState } from 'react';
import { IconButton, Badge } from '@mui/material';
import { FilterList } from '@mui/icons-material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import RuleIcon from '@mui/icons-material/Rule';
import { useTranslation } from 'react-i18next';
import { MenuUI } from '@/shared/ui/menu-ui';
import { StyledMenuItem } from '@/shared/ui/menu-ui/styled-components';

interface ToggleShowOnlyUnlearnedProps {
    showOnlyUnlearned: boolean;
    onToggle: () => void;
}

export const ToggleShowOnlyUnlearned = ({ showOnlyUnlearned, onToggle }: ToggleShowOnlyUnlearnedProps) => {
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleShowAll = () => {
        if (showOnlyUnlearned) {
            onToggle();
        }
        handleClose();
    };

    const handleShowUnlearned = () => {
        if (!showOnlyUnlearned) {
            onToggle();
        }
        handleClose();
    };

    return (
        <>
            <IconButton
                size="small"
                onClick={handleClick}
            >
                <Badge 
                    variant="dot" 
                    invisible={!showOnlyUnlearned}
                    sx={{
                        '& .MuiBadge-dot': {
                            backgroundColor: '#9810FA',
                        }
                    }}
                >
                    <FilterList />
                </Badge>
            </IconButton>
            <MenuUI
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                <StyledMenuItem onClick={handleShowAll} selected={!showOnlyUnlearned}>
                    <RuleIcon fontSize="small" sx={{ marginRight: '12px' }}/>
                    {t('cards.showAll')}
                </StyledMenuItem>
                <StyledMenuItem onClick={handleShowUnlearned} selected={showOnlyUnlearned}>
                    <CheckBoxOutlineBlankIcon fontSize="small" sx={{ marginRight: '12px' }}/>
                    {t('cards.showUnlearned')}
                </StyledMenuItem>
            </MenuUI>
        </>
    );
};

