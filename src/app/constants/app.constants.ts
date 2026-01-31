// src/app/constants/app.constants.ts
export const APP_CONFIG = {
  API_BASE_URL: 'https://api.codingburo.com',
  // API_BASE_URL: 'http://localhost:9191',
  SBAWEB_LINK: 'https://www.syedbaqirali.com',
  MAX_RETRIES: 3,
  TIMEOUT_MS: 5000,
  DEFAULT_LANGUAGE: 'en',
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'A network error occurred. Please try again later.',
  INVALID_INPUT: 'Please check your input and try again.',
};

export enum Provider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GEMINI = 'gemini',
}

export const PROVIDER_CONFIG = {
  [Provider.OPENAI]: { label: 'OpenAI', value: Provider.OPENAI },
  [Provider.ANTHROPIC]: { label: 'Anthropic', value: Provider.ANTHROPIC },
  [Provider.GEMINI]: { label: 'Gemini', value: Provider.GEMINI },
};

export const PROVIDER_OPTIONS = Object.values(PROVIDER_CONFIG);
export const DEFAULT_PROVIDER = Provider.OPENAI;

export const getProviderLabel = (
  provider: string | null | undefined
): string => {
  return (
    PROVIDER_CONFIG[provider as Provider]?.label ||
    PROVIDER_CONFIG[DEFAULT_PROVIDER].label
  );
};

export const PROVIDER_ICONS = {
  [Provider.OPENAI]: 'pi pi-bolt',
  [Provider.ANTHROPIC]: 'pi pi-sparkles',
  [Provider.GEMINI]: 'pi pi-sparkles',
};

export const getProviderIcon = (
  provider: string | null | undefined
): string => {
  return (
    PROVIDER_ICONS[provider as Provider] || PROVIDER_ICONS[DEFAULT_PROVIDER]
  );
};