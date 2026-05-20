import type { PartnerProfileSummary } from './types';

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  localStorage.removeItem('partnerProfile');
}

export function getToken(): string | null {
  return localStorage.getItem('access_token');
}

export function getPartnerProfile(): PartnerProfileSummary | null {
  const profile = localStorage.getItem('partnerProfile');
  return profile ? JSON.parse(profile) : null;
}
