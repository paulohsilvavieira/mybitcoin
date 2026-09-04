import CookieManager from '@preeternal/react-native-cookie-manager';

/** Cookie CSRF definido pela API no login (não-httpOnly, por design do ADR 0004 da API). */
export const CSRF_COOKIE_NAME = '__Host-csrf';

/**
 * Lê o token CSRF do cookie jar nativo do React Native.
 *
 * O RN persiste `Set-Cookie` automaticamente no cookie jar da plataforma; o
 * `__Host-session` é httpOnly e permanece opaco para o JS. Só o `__Host-csrf`
 * precisa ser lido, para ser reenviado como header `X-CSRF-Token` em mutations
 * — o mesmo que o front faz com `document.cookie`.
 */
export async function readCsrfToken(baseUrl: string): Promise<string | null> {
  try {
    const cookies = await CookieManager.get(baseUrl);
    const value = cookies?.[CSRF_COOKIE_NAME]?.value;
    return value ? decodeURIComponent(value) || null : null;
  } catch {
    return null;
  }
}
