import { styled } from '@mui/material/styles';
import { Box, List, ListItemIcon } from '@mui/material';
import FolderOffOutlinedIcon from '@mui/icons-material/FolderOffOutlined';

export const StyledFolderList = styled(List)({
  maxHeight: 216,
  overflow: 'auto',
});

export const StyledListItemIcon = styled(ListItemIcon)({
  minWidth: 0,
  marginRight: 8,
});

export const StyledEmptyBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingTop: 24,
  paddingBottom: 24,
});

export const StyledFolderOffIcon = styled(FolderOffOutlinedIcon)(({ theme }) => ({
  fontSize: 48,
  color: theme.palette.text.secondary,
  opacity: 0.4,
  marginBottom: 8,
}));
