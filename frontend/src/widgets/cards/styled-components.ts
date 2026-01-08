import { styled } from "@mui/material/styles";
import { Grid, Box, ListItem, Typography } from "@mui/material";

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
    //border-bottom: 1px solid #d2d6dc;
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
