import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  Box,
  CircularProgress,
  Link
} from '@mui/material';
import { ButtonColor, TextFieldUI } from '@/shared/ui';
import { useAuthStore } from '@/shared/store/authStore.ts';
import { normalizeLoginError } from '@/shared/libs/authLoginErrors';
import { isValidEmail } from '@/shared/libs/emailValidation';
import {
    StyledDialogActions,
    StyledRegisterBox,
    StyledDialogTitle,
} from "./styled-components.ts";

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
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setEmailError('');
    setPasswordError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');

    if (!formData.email.trim()) {
      setEmailError(t('auth.emailRequired'));
      return;
    }

    if (!isValidEmail(formData.email)) {
      setEmailError(t('auth.emailInvalidFormat'));
      return;
    }

    if (!formData.password.trim()) {
      setPasswordError(t('auth.passwordRequired'));
      return;
    }

    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const { field, messageKey } = normalizeLoginError(err);
      const message = t(messageKey);
      if (field === 'email') {
        setEmailError(message);
      } else {
        setPasswordError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ email: '', password: '' });
      setEmailError('');
      setPasswordError('');
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
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 1,
          background: 'linear-gradient(135deg, #FFF 8.54%, #F9FAFB 91.46%), #FFF',
        }
      }}
    >
      <StyledDialogTitle>
          {t('auth.login')}
      </StyledDialogTitle>
      
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextFieldUI
                placeholder={t('auth.email')}
                fullWidth
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                autoFocus
                error={!!emailError}
                helperText={emailError}
            />

            <TextFieldUI
                placeholder={t('auth.password')}
                fullWidth
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                error={!!passwordError}
                helperText={passwordError}
            />
        </Box>
      </DialogContent>

        <StyledDialogActions>
            <ButtonColor
                onClick={handleSubmit}
                variant="contained"
                disabled={isLoading}
            >
                {isLoading ? <CircularProgress size={24}/> : t('auth.login')}
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
