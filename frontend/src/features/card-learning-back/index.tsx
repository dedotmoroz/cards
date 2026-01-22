import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useFoldersStore } from '@/shared/store/foldersStore';
import { ButtonLink } from '@/shared/ui/button-link';

export const CardLearningBack = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userId, folderId } = useParams<{ userId?: string; folderId?: string }>();
  const { selectedFolderId } = useFoldersStore();

  // Используем folderId из URL, если он есть, иначе используем selectedFolderId из store
  const currentFolderId = folderId || selectedFolderId;

  const handleBack = () => {
    if (userId && currentFolderId) {
      navigate(`/learn/${userId}/${currentFolderId}`);
    } else if (currentFolderId) {
      navigate(`/learn/${currentFolderId}`);
    } else {
      navigate('/learn');
    }
  };
  
  return (
    <ButtonLink
      onClick={handleBack}
      startIcon={<ChevronLeftIcon />}
    >
      {t('forms.back')}
    </ButtonLink>
  );
};

