/** Cookie CSRF definido pela API no login (não-httpOnly, por design do ADR 0004 da API). */
export const CSRF_COOKIE_NAME = '__Host-csrf';

/**
 * Variante web: o browser já gerencia o cookie jar, então o token CSRF é lido
 * de `document.cookie` — idêntico ao `readCsrfToken` do `../mybitcoin-front`.
 *
 * `baseUrl` é ignorado aqui (o browser resolve o escopo do cookie sozinho),
 * mas faz parte da assinatura compartilhada com a variante nativa.
 */
export async function readCsrfToken(_baseUrl: string): Promise<string | null> {
  if (typeof document === 'undefined') return null;

  const match = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${CSRF_COOKIE_NAME}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(CSRF_COOKIE_NAME.length + 1)) || null;
}
