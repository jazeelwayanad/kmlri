'use client';

import { useEffect, useState } from 'react';
import { api } from './api';
import type { NavItem, FooterContact, SocialLinks, HomepageSection, SiteHeroConfig, SiteService } from './site-config-defaults';

const STORAGE_KEY = 'kmlri_public_settings';

let memoryCache: Record<string, any> | null = null;
let inFlightPromise: Promise<Record<string, any>> | null = null;
const listeners = new Set<(settings: Record<string, any>) => void>();

function getStoredSettings(): Record<string, any> {
  if (memoryCache) return memoryCache;
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        memoryCache = JSON.parse(stored);
        return memoryCache!;
      }
    } catch {}
  }
  return {};
}

function notifyListeners(settings: Record<string, any>) {
  memoryCache = settings;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }
  listeners.forEach((fn) => fn(settings));
}

export async function fetchPublicWebsiteSettings(forceRefresh = false): Promise<Record<string, any>> {
  if (!forceRefresh && memoryCache) {
    return memoryCache;
  }

  if (inFlightPromise) {
    return inFlightPromise;
  }

  inFlightPromise = api
    .getPublicWebsiteSettings()
    .then((fresh) => {
      if (fresh && typeof fresh === 'object') {
        notifyListeners(fresh);
      }
      return fresh || {};
    })
    .catch(() => memoryCache || {})
    .finally(() => {
      inFlightPromise = null;
    });

  return inFlightPromise;
}

export function usePublicWebsiteSettings() {
  const [settings, setSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    // Initial sync from cache on client mount
    const current = getStoredSettings();
    if (current && Object.keys(current).length > 0) {
      setSettings(current);
    }

    // Subscribe to fresh updates
    const listener = (fresh: Record<string, any>) => {
      setSettings(fresh);
    };
    listeners.add(listener);

    // Trigger background revalidation
    fetchPublicWebsiteSettings(true);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    settings,
    navItems: (settings.navItems as NavItem[] | undefined) || [],
    footerContact: (settings.footerContact as FooterContact | undefined) || {},
    socialLinks: (settings.socialLinks as SocialLinks | undefined) || {},
    homepageSections: (settings.homepageSections as HomepageSection[] | undefined) || [],
    hero: (settings.hero as SiteHeroConfig | undefined) || {},
    services: (settings.services as SiteService[] | undefined) || [],
  };
}
