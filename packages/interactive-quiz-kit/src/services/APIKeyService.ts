// src/lib/interactive-quiz-kit/services/APIKeyService.ts
'use client';

export const GEMINI_API_KEY_SERVICE_NAME = 'gemini';
export const JUDGE0_PRIMARY_API_KEY_SERVICE_NAME = 'judge0_primary';
export const JUDGE0_PRIMARY_API_URL_SERVICE_NAME = 'judge0_primary_url';
export const JUDGE0_FALLBACK_API_KEY_SERVICE_NAME = 'judge0_fallback';
export const JUDGE0_FALLBACK_API_URL_SERVICE_NAME = 'judge0_fallback_url';
export const PISTON_PRIMARY_API_URL_SERVICE_NAME = 'piston_primary_url';
const LOCAL_STORAGE_PREFIX = 'iqk_api_keys_';

// --- IMPORTANT SECURITY NOTE ---
// The Base64 encoding/decoding used here is for MILD OBFUSCATION ONLY.
// It is NOT a secure encryption method. API keys stored in localStorage can be
// accessed by JavaScript running on the same origin, and potentially by browser
// extensions or if the user's machine is compromised.
//
// Storing sensitive API keys directly in client-side localStorage has inherent risks.
// Users should be aware of these risks.
// True client-side encryption without a server-side component for key management
// or without requiring a user-provided master password each session is complex
// to implement securely.
// The primary protection here is the browser's Same-Origin Policy for localStorage.
// Advise users to use API keys with appropriate restrictions if possible.
// --- END SECURITY NOTE ---

function _encode(data: string): string {
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    try {
      return window.btoa(data);
    } catch (e) {
      console.error("Base64 encoding (btoa) failed:", e);
      return data; // Fallback to unencoded if btoa fails (e.g., non-ASCII characters in some environments)
    }
  }
  return data; // Fallback for non-browser environments (though this service is client-focused)
}

function _decode(data: string): string {
  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    try {
      return window.atob(data);
    } catch (e) {
      console.error("Base64 decoding (atob) failed:", e);
      // If atob fails, it might be because the data wasn't Base64 encoded (e.g., due to btoa fallback).
      return data; 
    }
  }
  return data; // Fallback for non-browser environments
}

export class APIKeyService {
  private static getStorageKey(serviceName: string): string {
    return `${LOCAL_STORAGE_PREFIX}${serviceName}`;
  }

  /**
   * Saves an API key to localStorage. The key is mildly obfuscated using Base64.
   * @param serviceName - The name of the service (e.g., 'gemini').
   * @param apiKey - The API key to save.
   */
  static saveAPIKey(serviceName: string, apiKey: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const encodedKey = _encode(apiKey);
        localStorage.setItem(this.getStorageKey(serviceName), encodedKey);
      } catch (e) {
        console.error(`Error saving API key for ${serviceName} to localStorage:`, e);
      }
    } else {
      console.warn("localStorage is not available. APIKeyService cannot save keys.");
    }
  }

  /**
   * Retrieves an API key from localStorage.
   * @param serviceName - The name of the service.
   * @returns The decoded API key, or null if not found or if localStorage is unavailable.
   */
  static getAPIKey(serviceName: string): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const storedKey = localStorage.getItem(this.getStorageKey(serviceName));
        if (storedKey) {
          return _decode(storedKey);
        }
      } catch (e) {
        console.error(`Error retrieving API key for ${serviceName} from localStorage:`, e);
      }
    } else {
      // console.warn("localStorage is not available. APIKeyService cannot retrieve keys.");
      // Warning can be noisy in SSR or Node environments, so only log if explicitly needed.
    }
    return null;
  }

  /**
   * Removes an API key from localStorage.
   * @param serviceName - The name of the service.
   */
  static removeAPIKey(serviceName: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(this.getStorageKey(serviceName));
      } catch (e) {
        console.error(`Error removing API key for ${serviceName} from localStorage:`, e);
      }
    } else {
      // console.warn("localStorage is not available. APIKeyService cannot remove keys.");
    }
  }

  /**
   * Checks if an API key exists in localStorage for the given service.
   * @param serviceName - The name of the service.
   * @returns True if a key exists, false otherwise.
   */
  static hasAPIKey(serviceName: string): boolean {
    return this.getAPIKey(serviceName) !== null;
  }
}
