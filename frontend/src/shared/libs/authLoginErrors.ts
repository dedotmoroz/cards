/**
 * Нормализует ошибку логина с API в поле и ключ перевода для человекочитаемого сообщения.
 */
export type LoginErrorField = 'email' | 'password';

export interface NormalizedLoginError {
  field: LoginErrorField;
  messageKey: string;
}

function getRawMessage(err: unknown): string {
  const data = (err as { response?: { data?: Record<string, unknown> }; status?: number })?.response?.data;
  if (!data || typeof data !== 'object') {
    return (err as Error)?.message ?? '';
  }
  const msg = data.message ?? data.error;
  if (typeof msg === 'string') return msg;
  // Fastify/Ajv иногда отдаёт массив errors
  const errors = data.errors;
  if (Array.isArray(errors) && errors[0] && typeof errors[0] === 'object' && errors[0] !== null && 'message' in errors[0]) {
    return String((errors[0] as { message: unknown }).message);
  }
  return (err as Error)?.message ?? '';
}

export function normalizeLoginError(err: unknown): NormalizedLoginError {
  const raw = getRawMessage(err);
  const rawLower = String(raw).toLowerCase();

  // Ошибка формата или валидации email (Ajv/Fastify: body/email must match format "email", или только "email" в контексте формата)
  const isEmailFormatError =
    rawLower.includes('body/email') ||
    rawLower.includes('must match format') ||
    (rawLower.includes('format') && rawLower.includes('email')) ||
    /email.*(format|required|invalid)/.test(rawLower) ||
    /(format|required|invalid).*email/.test(rawLower);

  if (isEmailFormatError) {
    return { field: 'email', messageKey: 'auth.emailInvalidFormat' };
  }

  // Неверные учётные данные (401)
  if (
    rawLower.includes('invalid credentials') ||
    (rawLower.includes('invalid') && rawLower.includes('password')) ||
    rawLower.includes('incorrect')
  ) {
    return { field: 'password', messageKey: 'auth.invalidCredentials' };
  }

  // По умолчанию — общая ошибка под полем пароля
  return { field: 'password', messageKey: 'auth.errorGeneric' };
}

export type RegisterErrorField = 'username' | 'email' | 'password';

export interface NormalizedRegisterError {
  field: RegisterErrorField;
  messageKey: string;
}

/**
 * Нормализует ошибку регистрации с API в поле и ключ перевода.
 */
export function normalizeRegisterError(err: unknown): NormalizedRegisterError {
  const raw = getRawMessage(err);
  const rawLower = String(raw).toLowerCase();

  // Ошибка формата email (Ajv/Fastify: body/email must match format "email")
  const isEmailFormatError =
    rawLower.includes('body/email') ||
    rawLower.includes('must match format') ||
    (rawLower.includes('format') && rawLower.includes('email')) ||
    /email.*(format|required|invalid)/.test(rawLower) ||
    /(format|required|invalid).*email/.test(rawLower);

  if (isEmailFormatError) {
    return { field: 'email', messageKey: 'auth.emailInvalidFormat' };
  }

  // Ошибки, связанные с username (занят, невалидный и т.д.)
  if (rawLower.includes('body/username') || rawLower.includes('username') && (rawLower.includes('taken') || rawLower.includes('exist'))) {
    return { field: 'username', messageKey: 'auth.errorGeneric' };
  }

  // По умолчанию — общая ошибка под полем email
  return { field: 'email', messageKey: 'auth.errorGeneric' };
}
