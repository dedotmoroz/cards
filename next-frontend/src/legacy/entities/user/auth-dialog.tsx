import React, { useState, useLayoutEffect, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  Box,
  CircularProgress,
  Link,
} from '@mui/material';
import { ButtonColor, TextFieldUI } from '@/shared/ui';
import { useAuthStore } from '@/shared/store/authStore.ts';
import { normalizeLoginError } from '@/shared/libs/authLoginErrors';
import { isValidEmail } from '@/shared/libs/emailValidation';
import { GOOGLE_CLIENT_ID } from '@/shared/config/api';
import {
  StyledDialogActions,
  StyledRegisterBox,
  StyledDialogTitle,
} from './styled-components.ts';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: { theme?: string; size?: string; width?: number; text?: string },
          ) => void;
        };
      };
    };
  }
}

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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const { login, loginWithGoogle } = useAuthStore();
  const navigate = useNavigate();

  const handleGoogleSignInRef = useRef<(credential: string) => Promise<void>>(async () => {});
  handleGoogleSignInRef.current = async (credential: string) => {
    setIsGoogleLoading(true);
    setEmailError('');
    setPasswordError('');
    try {
      await loginWithGoogle(credential);
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
      setIsGoogleLoading(false);
    }
  };

  useLayoutEffect(() => {
    if (!open || !GOOGLE_CLIENT_ID) return;

    let cancelled = false;
    let poll: ReturnType<typeof setInterval> | undefined;

    const initGoogleButton = () => {
      const el = googleButtonRef.current;
      if (!el || !window.google?.accounts?.id) return;
      el.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: { credential: string }) => {
          handleGoogleSignInRef.current(response.credential);
        },
      });
      window.google.accounts.id.renderButton(el, {
        theme: 'outline',
        size: 'large',
        width: 280,
        text: 'signin_with',
      });
    };

    const run = () => {
      if (cancelled) return;
      if (window.google?.accounts?.id) {
        initGoogleButton();
      } else {
        poll = setInterval(() => {
          if (cancelled) return;
          if (window.google?.accounts?.id) {
            if (poll) clearInterval(poll);
            poll = undefined;
            initGoogleButton();
          }
        }, 100);
      }
    };

    const raf = requestAnimationFrame(run);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (poll) clearInterval(poll);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      emailInputRef.current?.focus();
    }, 0);
    return () => clearTimeout(timer);
  }, [open]);

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
    if (!isLoading && !isGoogleLoading) {
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
        <Box
          component="form"
          id="auth-login-form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
        >
            <TextFieldUI
                placeholder={t('auth.email')}
                fullWidth
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading || isGoogleLoading}
                inputRef={emailInputRef}
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
                disabled={isLoading || isGoogleLoading}
                error={!!passwordError}
                helperText={passwordError}
            />
        </Box>
      </DialogContent>

        <StyledDialogActions>
            <ButtonColor
                type="submit"
                form="auth-login-form"
                variant="contained"
                disabled={isLoading || isGoogleLoading}
            >
                {isLoading ? <CircularProgress size={24}/> : t('auth.login')}
            </ButtonColor>
        </StyledDialogActions>

        {GOOGLE_CLIENT_ID && (
          <>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '40px',
                mt: 3,
                px: 3,
                opacity: isGoogleLoading ? 0.6 : 1,
              }}
            >
              <div ref={googleButtonRef} />
            </Box>
          </>
        )}

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
