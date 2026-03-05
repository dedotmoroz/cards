import React from 'react';
import { ListItemButton, ListItemText, Typography } from '@mui/material';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import { useTranslation } from 'react-i18next';
import { DialogUI } from '@/shared/ui/dialog-ui';
import { ButtonUI } from '@/shared/ui/button-ui';
import type { Folder } from '@/shared/types/cards';
import {
  StyledFolderList,
  StyledListItemIcon,
  StyledEmptyBox,
  StyledFolderOffIcon,
} from './styled-components';

interface MoveCardDialogProps {
  open: boolean;
  onClose: () => void;
  currentFolderId: string | null;
  folders: Folder[];
  onMove: (cardId: string, targetFolderId: string) => Promise<void>;
  cardId: string | null;
}

export const MoveCardDialog = ({
  open,
  onClose,
  currentFolderId,
  folders,
  onMove,
  cardId,
}: MoveCardDialogProps) => {
  const { t } = useTranslation();
  const [isMoving, setIsMoving] = React.useState(false);

  const targetFolders = folders.filter(
    (f) => f.id !== currentFolderId
  );

  const handleFolderSelect = async (targetFolderId: string) => {
    if (!cardId) return;
    setIsMoving(true);
    try {
      await onMove(cardId, targetFolderId);
      onClose();
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <DialogUI
      open={open}
      onClose={onClose}
      title={t('cards.moveToFolder')}
      fullWidth
      maxWidth="xs"
      content={
        targetFolders.length > 0 ? (
          <StyledFolderList dense disablePadding>
            {targetFolders.map((folder) => (
              <ListItemButton
                key={folder.id}
                onClick={() => handleFolderSelect(folder.id)}
                disabled={isMoving}
              >
                <StyledListItemIcon>
                  <FolderOutlinedIcon fontSize="small" />
                </StyledListItemIcon>
                <ListItemText
                  primary={folder.name}
                  primaryTypographyProps={{ fontSize: 16 }}
                />
              </ListItemButton>
            ))}
          </StyledFolderList>
        ) : (
          <StyledEmptyBox>
            <StyledFolderOffIcon />
            <Typography variant="body2" color="text.secondary">
              {t('cards.noOtherFolders')}
            </Typography>
          </StyledEmptyBox>
        )
      }
      actions={
        <ButtonUI onClick={onClose}>{t('auth.cancel')}</ButtonUI>
      }
    />
  );
};
