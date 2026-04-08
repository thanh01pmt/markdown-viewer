// src/client-services.ts
"use client";

/**
 * This is a dedicated entry point for client-side services that depend on browser APIs
 * like localStorage. Importing from this file ensures that these services are only
 * used in client components, preventing server-side rendering errors in frameworks like Next.js.
 */

export { APIKeyService, GEMINI_API_KEY_SERVICE_NAME } from './services/APIKeyService';
export { SCORMService } from './services/SCORMService';