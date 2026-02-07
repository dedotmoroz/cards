import { styled } from "@mui/material/styles";
import { Box, Typography, ListItemButton, IconButton, List } from "@mui/material";

export const StyledWrappedBox = styled(Box)`
    padding: 20px;
    height: 100%;
    box-shadow: none;
`
export const StyledCaptionBox = styled(Box)`
    display: flex; 
    justify-content: space-between; 
    align-items: center;
    margin-bottom: 12px;
`
export const StyledTypography = styled(Typography)``

export const StyledListItemButton = styled(ListItemButton)`
    border-radius: 8px;
    padding: 8px 12px;
`

export const StyledIconButton = styled(IconButton)`
    &:hover {
        background-color: white;
    }
`

export const StyledMenuBox = styled(Box)`
    display: flex;
    justify-content: space-between;
    align-items: center; 
    width:100%;
`
export const StyledList = styled(List)`
    margin: 0 -8px 0 -12px;
`