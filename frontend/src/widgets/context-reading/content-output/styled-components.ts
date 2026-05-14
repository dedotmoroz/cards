import { styled } from '@mui/material/styles';
import type { BoxProps, TypographyProps } from '@mui/material';
import {
  Container,
  Box,
  Typography,
  Accordion,
  Chip,
} from '@mui/material';
import { ButtonColor, ButtonLink } from '@/shared/ui';

const CONTEXT_READING_ACTIVE_CHIP_BG = '#3900ff26';

export const StyledContainerWrapper = styled(Container)(() => `
    padding: 10px;
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
    font-weight: bold;
    line-height: 28px;
    font-size: 24px;
`);

export const StyledChipsSection = styled(Box)(({ theme }) => `
    margin-top: ${theme.spacing(2)};
    margin-bottom: ${theme.spacing(3)};
    padding-left: ${theme.spacing(2)};
    // ${theme.breakpoints.up('sm')} {
    //     padding-left: ${theme.spacing(4)};
    // }
`);

export const StyledChipsRow = styled(Box)(({ theme }) => `
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing(1)};
`);

export const StyledContextWordChip = styled(Chip)(() => `
    &.MuiChip-filled {
        background-color: ${CONTEXT_READING_ACTIVE_CHIP_BG};
        &:hover {
            background-color: ${CONTEXT_READING_ACTIVE_CHIP_BG};
        }
        &:active {
            background-color: ${CONTEXT_READING_ACTIVE_CHIP_BG};
        }
    }
`);

export const StyledChipLabelRow = styled(Box)<BoxProps>`
    display: inline-flex;
    align-items: baseline;
    gap: 4px;
`;

export const StyledAccordionsStack = styled(Box)(({ theme }) => `
    margin-top: ${theme.spacing(2)};
    margin-bottom: ${theme.spacing(4)};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing(1)};
`);

export const StyledContentAccordion = styled(Accordion)(() => `
    box-shadow: rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px;
    &:before {
        display: none;
    }
`);

export const StyledAccordionSectionTitle = styled(Typography)<TypographyProps>(() => `
    margin-left: 0;
`);

export const StyledAccordionBodyText = styled(Typography)<TypographyProps>(({ theme }) => `
    white-space: pre-wrap;
    line-height: 1.8;
    ${theme.breakpoints.up('sm')} {
            font-size: 18px;
    }
    padding: 0;
    margin-top: ${theme.spacing(-1)};
    background-color: ${theme.palette.background.paper};
    border-radius: ${theme.shape.borderRadius}px;
    width: 100%;
    box-sizing: border-box;
`);

export const StyledFooterRow = styled(Box)(({ theme }) => `
    margin-top: ${theme.spacing(4)};
    margin-bottom: ${theme.spacing(4)};
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${theme.spacing(2)};
`);

export const StyledProgressText = styled(Typography)(({ theme }) => `
    margin-left: ${theme.spacing(2)};
    color: ${theme.palette.text.secondary};
    ${theme.breakpoints.up('sm')} {
        margin-left: ${theme.spacing(4)};
    }
`);

export const StyledFooterActions = styled(Box)(({ theme }) => `
    display: flex;
    gap: ${theme.spacing(2)};
    flex-wrap: wrap;
    margin-left: auto;
`);

export const StyledResetButton = styled(ButtonLink)(() => `
    width: 120px;
`);

export const StyledNextButton = styled(ButtonColor)(() => `
    width: 160px;
`);

export const StyledHighlightMark = styled('mark')(({ theme }) => `
    background-color: transparent;
    color: ${theme.palette.text.primary};
    padding-left: ${theme.spacing(0.25)};
    padding-right: ${theme.spacing(0.25)};
    border-radius: 4px;
    margin-left: -2px;
    margin-right: -2px;
    border-bottom: 4px solid #3900ff47;
`);
