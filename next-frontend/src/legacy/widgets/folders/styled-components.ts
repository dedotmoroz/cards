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
export const StyledTypography = styled(Typography)`
   position: relative;
   display: flex;
`

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
    position: relative;
`
export const StyledList = styled(List)`
    margin: 0 -8px 0 -12px;
`

export const StyledFolderCounter = styled(Box)`
    font-size: 9px;
    left: 12px;
    top: -4px;
    position: absolute;
    color: rgba(0, 0, 0, 0.42);
`

export const StyledFoldersCounter = styled(Box)`
display: inline-block;
    font-size: 9px;
    margin-left: 4px;
    color: rgba(0, 0, 0, 0.42);
`

export const StyledHeaderActions = styled(Box)`
    display: flex;
    align-items: center;
    gap: 4px;
`

export const StyledPinIcon = styled(Box)`
    display: flex;
    align-items: center;
    margin-right: 4px;
    color: rgba(0, 0, 0, 0.42);

    svg {
        font-size: 14px;
    }
`