// Cross-subdomain & universal cookie utility for seamless Single Sign-On (SSO)

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

export function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = '; expires=' + date.toUTCString();
  const encodedValue = encodeURIComponent(value);

  // 1. Always set standard root path cookie
  document.cookie = `${name}=${encodedValue}${expires}; path=/; SameSite=Lax`;

  // 2. If on production domain or custom domain with subdomains, set domain-wide wildcard cookie
  const hostname = window.location.hostname;
  if (hostname.includes('kmlri.in')) {
    document.cookie = `${name}=${encodedValue}${expires}; path=/; domain=.kmlri.in; SameSite=Lax`;
  }
}

export function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  const expired = '; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
  document.cookie = `${name}=${expired}`;

  const hostname = window.location.hostname;
  if (hostname.includes('kmlri.in')) {
    document.cookie = `${name}=${expired}; domain=.kmlri.in`;
  }
}
