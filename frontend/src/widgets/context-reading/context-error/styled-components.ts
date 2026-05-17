import { styled } from '@mui/material/styles';
import type { BoxProps, TypographyProps } from '@mui/material';
import { Container, Box, Typography, Chip } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

export const StyledContainerWrapper = styled(Container)(({}) => `
   padding: 10px;
`);

export const StyledHeaderRow = styled(Box)(({}) => `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
`);

export const StyledPageTitle = styled(Typography)<TypographyProps>(({ theme }) => `
    margin-left: ${theme.spacing(2)};
    font-size: 28px;
    font-weight: bold;
    line-height: 28px;
    font-size: 24px;
`);

export const StyledChipsSection = styled(Box)(({ theme }) => `
    margin-top: ${theme.spacing(2)};
    margin-bottom: ${theme.spacing(3)};
    padding-left: ${theme.spacing(2)};
`);

export const StyledChipsRow = styled(Box)(({ theme }) => `
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: ${theme.spacing(1)};
    max-height: 250px;
    overflow-y: auto;
`);

export const StyledPoolWordChip = styled(Chip)(() => `
    &.MuiChip-outlined {
        border-color: rgba(57, 0, 255, 0.35);
    }
`);

export const StyledLearnedWordChip = styled(Chip)(({}) => `
    &.MuiChip-outlined {
        border-color: rgba(57, 0, 255, 0.35);
    }
`);

export const StyledUnactiveWordChip = styled(Chip)(({ theme }) => `
    &.MuiChip-outlined {
        opacity: 0.55;
        border-color: ${theme.palette.divider};
        color: ${theme.palette.text.disabled};
        background-color: ${theme.palette.action.hover};
    }
`);

export const StyledChipLabelRow = styled(Box)<BoxProps>`
    display: inline-flex;
    align-items: center;
    gap: 4px;
`;

export const StyledChipLearnedMark = styled(CheckIcon)(({ theme }) => `
    font-size: 15px;
    flex-shrink: 0;
    margin-left: ${theme.spacing(0.25)};
    border-radius: 3px;
`);

export const StyledControlsBlock = styled(Box)(({ theme }) => `
    display: flex;
    margin-right: ${theme.spacing(2)};
    margin-top: ${theme.spacing(4)};
    flex-direction: column;
    justify-content: left;
    gap: 20px;
    ${theme.breakpoints.up('sm')} {
        flex-direction: row;
        justify-content: space-between;
    }
`);


export const StyledButtonContainer = styled(Box)(({ theme }) => `
    ${theme.breakpoints.up('sm')} {
           width: 260px
    }
`);

export const StyledControlsRow = styled(Box)(() => `
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
`);

export const StyledChipsLoading = styled(Box)(({ theme }) => `
    display: flex;
    justify-content: center;
    padding: ${theme.spacing(3)} 0;
`);
