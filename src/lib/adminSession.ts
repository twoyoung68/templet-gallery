/** 탭/창을 닫으면 사라짐 (브라우저 세션과 동일한 수명) */
const SESSION_KEY = 'epc-gallery-admin-authed';

export function getExpectedAdminPassword(): string {
  const fromEnv = import.meta.env.VITE_ADMIN_PASSWORD;
  return typeof fromEnv === 'string' && fromEnv.length > 0 ? fromEnv : '1207';
}

export function readAdminSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function writeAdminSession(value: boolean): void {
  try {
    if (value) sessionStorage.setItem(SESSION_KEY, '1');
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* 시크릿 등 */
  }
}
