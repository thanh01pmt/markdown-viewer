// FILE: src/lib/interactive-quiz-kit/utils/aiUtils.ts
// ================================================================================
// NEW FILE: Contains utility functions to support AI flows.

import type { Part } from '@google/generative-ai';

/**
 * Fetches an image from a URL and converts it into a Google GenAI GenerativePart object.
 * This is necessary for making multimodal requests.
 * @param url The public URL of the image to fetch.
 * @param mimeType The MIME type of the image (e.g., 'image/png', 'image/jpeg').
 * @returns A Promise that resolves to a Part object for the AI model.
 * @throws An error if the image fetch fails.
 */
export async function urlToGenerativePart(url: string, mimeType: string): Promise<Part> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image from URL: ${url}. Status: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < uint8Array.byteLength; i++) {
        binary += String.fromCharCode(uint8Array[i]);
    }
    const base64 = btoa(binary);

    return {
        inlineData: {
            data: base64,
            mimeType,
        },
    };
}