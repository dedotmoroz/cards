import { styled } from '@mui/material/styles';
import type { BoxProps, TypographyProps } from '@mui/material';
import { Container, Box, Typography, Chip } from '@mui/material';

export const StyledContainerWrapper = styled(Container)(({ theme }) => `
    margin-top: ${theme.spacing(4)};
`);

export const StyledHeaderRow = styled(Box)(({ theme }) => `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${theme.spacing(2)};
    flex-wrap: wrap;
    gap: ${theme.spacing(2)};
`);

export const StyledPageTitle = styled(Typography)<TypographyProps>(({ theme }) => `
    margin-left: ${theme.spacing(2)};
    font-size: 28px;
    ${theme.breakpoints.up('sm')} {
        margin-left: ${theme.spacing(4)};
    }
`);

export const StyledChipsSection = styled(Box)(({ theme }) => `
    margin-top: ${theme.spacing(2)};
    margin-bottom: ${theme.spacing(3)};
    padding-left: ${theme.spacing(2)};
    ${theme.breakpoints.up('sm')} {
        padding-left: ${theme.spacing(4)};
    }
`);

export const StyledChipsRow = styled(Box)(({ theme }) => `
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing(1)};
`);

export const StyledPoolWordChip = styled(Chip)(() => `
    &.MuiChip-outlined {
        border-color: rgba(57, 0, 255, 0.35);
    }
`);

export const StyledLearnedWordChip = styled(Chip)(({ theme }) => `
    &.MuiChip-outlined {
        opacity: 0.55;
        border-color: ${theme.palette.divider};
        color: ${theme.palette.text.disabled};
        background-color: ${theme.palette.action.hover};
    }
`);

export const StyledChipLabelRow = styled(Box)<BoxProps>`
    display: inline-flex;
    align-items: baseline;
    gap: 4px;
`;

export const StyledControlsBlock = styled(Box)(({ theme }) => `
    display: flex;
    margin-left: ${theme.spacing(2)};
    margin-top: ${theme.spacing(4)};
    ${theme.breakpoints.up('sm')} {
        margin-left: ${theme.spacing(4)};
    }
`);

export const StyledControlsRow = styled(Box)(() => `
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
`);

export const StyledChipsLoading = styled(Box)(({ theme }) => `
    display: flex;
    justify-content: center;
    padding: ${theme.spacing(3)} 0;
`);
