/**
 * JWT payload base64 디코딩 유틸리티
 *
 * 서명 검증 불필요 (서버가 검증함), payload만 추출합니다.
 */
export function parseJwtPayload<T>(token: string): T | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );

    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
