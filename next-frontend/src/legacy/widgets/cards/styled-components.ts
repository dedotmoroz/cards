import { styled } from "@mui/material/styles";
import { Grid, Box, ListItem, Typography, IconButton } from "@mui/material";
import { VisibilityOffOutlined } from '@mui/icons-material';
import type { InputHTMLAttributes } from "react";
import React, { forwardRef } from "react";

export const StyledGrid = styled(Grid)`
    height: calc(100vh - 64px);
    padding: 80px 10px 10px;
`
export const StyledWrapperBox = styled(Box)`
    padding: 20px 16px;
    height: 100%;
    
    ${({ theme }) => theme.breakpoints.down('sm')} {
        padding: 20px 0;
    }
`
export const StyledTopBox = styled(Box)`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
`
export const StyleLeftBox = styled(Box)`
    display: flex;
    align-items: flex-start;
    padding-left: 16px;
`

export const StyledHeaderBox = styled(Box)`
    display: flex;
    align-items: center;
    gap: 2;
`

export const StyledCardBoxHeader = styled(Box)`
    display: flex;
    box-sizing: border-box;
    // gap: 16px;
    justify-content: space-between;
    align-items: center;
    background: var(--gradient-cards-header);
    padding: 10px 19px;
    border: 1px solid var(--border-cards-header);
    border-bottom: none;

    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
`

export const StyledBoxWrapper = styled(Box)`
    display: flex;
    flex-direction: column;
    background: var(--bg-surface-glass-strong);
    box-shadow: var(--shadow-lg);
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
    overflow: hidden;
`

export const StyledBoxSideA = styled(Box)`
    display: flex;
    width: 100%;
    align-items: center; 
    gap: 10px;
    justify-content: space-between;
    
    ${({ theme }) => theme.breakpoints.down('md')} {
        flex-direction: column;
        align-items: flex-start;
    }
`

export const StyledBoxSideB = styled(Box)`
    display: flex;
    width: 100%;
    align-items: center;
    gap: 10px;
    
    ${({ theme }) => theme.breakpoints.down('md')} {
        flex-direction: column;
        align-items: flex-start;
    }
`

export const StyledHeaderWithButton = styled(Box)`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(1)};
`

export const StyledListItem = styled(ListItem, {
    shouldForwardProp: (prop) => prop !== '$highlighted',
})<{ $highlighted?: boolean }>`
    transition: background-color 0.2s ease-in-out;
    margin: 0;
    padding: 10px 20px;
    border-bottom: 2px solid var(--border-card-row);
    background-color: ${({ theme, $highlighted }) =>
        $highlighted ? theme.palette.action.selected : 'transparent'};
    &:last-child {
        border-bottom: none;
    }
`;

export const StyledCardContainer = styled(Box)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
`;

export const StyledCardContent = styled(Box)`
    display: flex;
    width: 100%;
    gap: ${({ theme }) => theme.spacing(2)};
    
    ${({ theme }) => theme.breakpoints.down('md')} {
        flex-direction: column;
    }
    
    ${({ theme }) => theme.breakpoints.up('md')} {
        flex-direction: row;
    }
`;

export const StyledCardHeaderContent = styled(Box)`
    display: flex;
    width: 100%;
    gap: ${({ theme }) => theme.spacing(2)};

    ${({ theme }) => theme.breakpoints.down('md')} {
        flex-direction: column;
    }
`

export const StyledCardColumn = styled(Box)`
    flex: 1;
    position: relative;
`;

export const StyledCardColumnContent = styled(Box, {
    shouldForwardProp: (prop) => prop !== '$isVisible',
})<{ $isVisible: boolean }>`
    visibility: ${({ $isVisible }) => ($isVisible ? 'visible' : 'hidden')};
`;

export const StyledHiddenColumnOverlay = styled(Box)`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
`;

export const StyledHiddenEyeIcon = styled(VisibilityOffOutlined)`
    font-size: 20px;
    color: ${({ theme }) => theme.palette.text.secondary};
    opacity: 0.5;
`;

export const StyledCardActions = styled(Box)`
    display: flex;
    width: 110px;
    align-items: center;
    justify-content: flex-end;
    gap: 5px;
    
    ${({ theme }) => theme.breakpoints.down('md')} {
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 60px;
    }
`;

export const StyledHeaderCardActions = styled(Box)`
    display: flex;
    width: 110px;
    align-items: center;
    justify-content: flex-end;
    gap: 5px;

    ${({ theme }) => theme.breakpoints.down('md')} {
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 60px;
    }
`;

export const StyledSentencesContainer = styled(Box)`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing(1)};
`;

export const StyledCardText = styled(Typography)`
    font-size: 20px;
`;

export const StyledCardSentencesText = styled(Typography)`
    margin-top: ${({ theme }) => theme.spacing(1)};
    white-space: pre-wrap;
`;

export const StyledColumnHeader = styled(Typography)`
    font-weight: bold;
    font-size: 16px;
`;

export const StyledColumnHeaderLang = styled('span')`
    font-weight: normal;
    color: var(--text-tertiary);
`;

export const StyledMargin = styled(Box)`
    margin: 0 0 0 12px;
`
export const StyledMarginMobile = styled(Box)`
    ${({ theme }) => theme.breakpoints.down('md')} {
        margin: 0 0 0 12px;
    }
`

export const StyledCreateCardBox = styled(Box)`
    display: flex;
    align-items: center;
    gap: 16px;

    ${({ theme }) => theme.breakpoints.down('sm')} {
        display: none;
    }
`

export const StyledCreateBlockMobile  = styled(Box)`
width: 100%;
display: flex;
justify-content: space-between;
align-items: center;
padding: 16px 8px 16px 16px;
gap: 16px;
    ${({ theme }) => theme.breakpoints.up('sm')} {
        display: none;
    }
`

export const StyledBoxAnswer = styled(Box)`
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 24px;
    width: 100%;
`

export const StyledBoxQuestion = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    min-height: 24px;
    width: 100%;
`

// Создаем базовый компонент с forwardRef
const BaseInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
    (props, ref) => React.createElement('input', { ref, ...props })
);

BaseInput.displayName = 'BaseInput';

// Обертываем его в styled
export const StyledInput = styled(BaseInput)`
    width: 100%;
    border: 2px solid var(--border-strong);
    outline: none;
    background: transparent;
    font-size: 20px;
    font-family: inherit;
    color: inherit;
    padding: 6px 6px;
    border-radius: 4px;
    margin-top: -3px;
    margin-bottom: -1px;

    &::placeholder {
        color: var(--text-placeholder);
        opacity: 1;
    }

    &:focus {
        outline: none;
        background: var(--bg-surface);
        border: 2px solid var(--brand-primary);
        box-shadow: var(--shadow-focus-brand);
    }
`
export const StyledSaveIconButton = styled(IconButton)`
    background: var(--success-strong);
    color: var(--text-on-brand);

    &:hover {
        background: var(--success-strong);
    }
`

export const StyledCloseIconButton = styled(IconButton)`
`

export const StyledSuggestionsBox = styled(Box)`
    position: relative;
    width: 100%;
`

export const StyledSuggestionsList = styled(Box)`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--bg-surface);
    border: 1px solid var(--border-strong);
    border-top: none;
    border-radius: 0 0 4px 4px;
    box-shadow: var(--shadow-dropdown);
    z-index: 1000;
    max-height: 200px;
    overflow-y: auto;
`

export const StyledSuggestionItem = styled(Box)`
    padding: 8px 12px;
    cursor: pointer;
    font-size: 16px;
    border-bottom: 1px solid var(--border-suggestion);
    transition: background-color 0.2s;

    &:hover {
        background-color: var(--bg-suggestion-hover);
    }

    &:last-child {
        border-bottom: none;
    }
`

export const StyledSuggestionMeta = styled(Box)`
    font-size: 12px;
    color: var(--text-tertiary);
    margin-bottom: 2px;
`

export const StyledLoadingIndicator = styled(Box)`
    padding: 8px 12px;
    font-size: 14px;
    color: var(--text-secondary);
    font-style: italic;
`

export const StyledLoaderOverlay = styled(Box)`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--bg-overlay);
`

export const StyledLoaderSpinner = styled(Box)`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`