import {useTranslation} from "react-i18next";
import {useMediaQuery, useTheme} from "@mui/material";
import {useFoldersStore} from "@/shared/store/foldersStore.ts";
import {ButtonBlack} from "@/shared/ui/button-black";
import {StyledPlusIcon} from "./styled-components";

interface CreateCardButtonProps {
    onToggleForm: () => void;
    isFormOpen: boolean;
}

export const CreateCardButton: React.FC<CreateCardButtonProps> = ({ onToggleForm }) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { selectedFolderId } = useFoldersStore();

    return (
        <ButtonBlack
            onClick={onToggleForm}
            disabled={!selectedFolderId}
            startIcon={<StyledPlusIcon/>}
        >
            <span style={{ display: isMobile ? 'none' : 'inline' }}>
                {t('cards.create')}
            </span>
        </ButtonBlack>
    )
}
