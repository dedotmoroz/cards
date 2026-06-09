/**
 * i18n language code → BCP-47 for SpeechSynthesisUtterance.lang
 */
const I18N_TO_BCP47: Record<string, string> = {
  en: 'en-US',
  ru: 'ru-RU',
  uk: 'uk-UA',
  de: 'de-DE',
  es: 'es-ES',
  fr: 'fr-FR',
  pl: 'pl-PL',
  pt: 'pt-PT',
  zh: 'zh-CN',
};

const DEFAULT_LANG = 'en-US';

export function mapI18nToSpeechLang(i18nLang: string): string {
  const normalized = (i18nLang ?? '').split('-')[0]?.toLowerCase() ?? '';
  return I18N_TO_BCP47[normalized] ?? DEFAULT_LANG;
}

/**
 * Speak text via Web Speech API (browser TTS).
 * @param text - Text to speak
 * @param i18nLang - Optional i18n language (e.g. from useTranslation); used for utterance.lang
 */
export function speak(text: string, i18nLang?: string): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const t = text?.trim();
  if (!t) return;

  const utterance = new SpeechSynthesisUtterance(t);
  utterance.lang = mapI18nToSpeechLang(i18nLang ?? 'en');
  window.speechSynthesis.speak(utterance);
}
