import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Link
} from '@mui/material';
import { ButtonColor, ButtonWhite } from '@/shared/ui';
import { useAuthStore } from '@/shared/store/authStore.ts';
import { StyledLabel, StyledDialogActions, StyledRegisterBox, StyledDialogTitle } from "./styled-components.ts";

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthDialog: React.FC<AuthDialogProps> = ({ open, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      setError(error.message || t('auth.invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ email: '', password: '' });
      setError('');
      onClose();
    }
  };

  const handleRegister = () => {
    onClose();
    navigate('/signup');
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 1
        }
      }}
    >
      <StyledDialogTitle>
          {t('auth.login')}
      </StyledDialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>

            <StyledLabel>
                {t('auth.email')}
            </StyledLabel>
            <TextField
                fullWidth
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                autoFocus
            />

            <StyledLabel>
                {t('auth.password')}
            </StyledLabel>
            <TextField
                fullWidth
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
            />
        </Box>
      </DialogContent>
      
      <StyledDialogActions>
        <ButtonWhite
          onClick={handleClose}
          disabled={isLoading}
        >
          {t('auth.cancel')}
        </ButtonWhite>
        <ButtonColor
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : t('auth.login')}
        </ButtonColor>
      </StyledDialogActions>

      <StyledRegisterBox>
          {t('auth.notRegistered')}{' '}
          <Link
            component="button"
            onClick={handleRegister}
          >
            {t('auth.registerLink')}
          </Link>
      </StyledRegisterBox>
    </Dialog>
  );
};
