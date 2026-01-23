import { styled } from "@mui/material/styles";
import { Grid, Box, ListItem, Typography, IconButton } from "@mui/material";
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
    align-items: center;
    margin-bottom: 20px;
`
export const StyleLeftBox = styled(Box)`
    display: flex;
    align-items: flex-start;
    padding-left: 20px;
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
    background: linear-gradient(90deg, rgba(224, 231, 255, 0.60) 0%, rgba(243, 232, 255, 0.60) 50%, rgba(252, 231, 243, 0.60) 100%);
    padding: 10px 19px;
    border: 1px solid rgba(255, 255, 255, 0.90);
    border-bottom: none;

    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
`

export const StyledBoxWrapper = styled(Box)`
    background: rgba(255, 255, 255, 0.50);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.10), 0 8px 10px -6px rgba(0, 0, 0, 0.10);
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

export const StyledListItem = styled(ListItem)`
    transition: background-color 0.2s ease-in-out;
    margin: 0;
    padding: 10px 20px;
    border-bottom: 2px solid rgba(227, 231, 237, 0.74);
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

export const StyledCardColumn = styled(Box)<{ $isVisible: boolean }>`
    flex: 1;
    visibility: ${({ $isVisible }) => $isVisible ? 'visible' : 'hidden'};
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

export const StyledMargin = styled(Box)`
    margin: 0 0 0 12px;
`
export const StyledMarginMobile = styled(Box)`
    ${({ theme }) => theme.breakpoints.down('md')} {
        margin: 0 0 0 12px;
    }
`

export const StyledCreateCardBox = styled(Box)`
    ${({ theme }) => theme.breakpoints.down('sm')} {
        padding-right: 8px;
    }
`

export const StyledBoxAnswer = styled(Box)`
    display: flex;
    align-items: center;
    min-height: 24px;
    width: 100%;
`

export const StyledBoxQuestion = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
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
    border: 2px solid #d5d5d5;
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
        color: rgba(0, 0, 0, 0.2);
        opacity: 1;
    }

    &:focus {
        outline: none;
        background: #fff;
        border: 2px solid #615FFF;
        box-shadow: 0 0 5px 3px rgba(97, 95, 255, 0.3);
    }
`
export const StyledSaveIconButton = styled(IconButton)`
    background: #00A63E;
    color: #fff;

    &:hover {
        background: #00A63E;
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
    background: white;
    border: 1px solid #d5d5d5;
    border-top: none;
    border-radius: 0 0 4px 4px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    max-height: 200px;
    overflow-y: auto;
`

export const StyledSuggestionItem = styled(Box)`
    padding: 8px 12px;
    cursor: pointer;
    font-size: 16px;
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.2s;

    &:hover {
        background-color: #f5f5f5;
    }

    &:last-child {
        border-bottom: none;
    }
`

export const StyledLoadingIndicator = styled(Box)`
    padding: 8px 12px;
    font-size: 14px;
    color: #666;
    font-style: italic;
`