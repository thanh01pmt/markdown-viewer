// FILE: src/lib/interactive-quiz-kit/utils/jsonUtils.ts
// ================================================================================
// VERSION 3: Refactored for robustness and accuracy
// Fixes critical bugs in regex and improves repair strategies.

/**
 * Advanced JSON string repair utilities for handling AI-generated content
 */
class JsonRepairEngine {
  /**
   * Attempts to repair unterminated strings in JSON.
   * NOTE: This is a heuristic approach and may not be perfect for all cases.
   */
  private static repairUnterminatedStrings(jsonStr: string): string {
    let repaired = jsonStr;
    let inString = false;
    let escaped = false;
    let lastQuoteIndex = -1;

    for (let i = 0; i < repaired.length; i++) {
      const char = repaired[i];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === '\\') {
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        if (inString) {
          lastQuoteIndex = i;
        }
      }
    }

    // If we're still in a string at the end, attempt to close it
    if (inString && lastQuoteIndex !== -1) {
      const beforeUnterminated = repaired.substring(0, lastQuoteIndex + 1);
      const afterUnterminated = repaired.substring(lastQuoteIndex + 1);

      // Find the next logical break point (comma, brace, bracket)
      const breakPoints = [',', '}', ']', '\n'];
      let breakIndex = -1;

      for (let i = 0; i < afterUnterminated.length; i++) {
        if (breakPoints.includes(afterUnterminated[i])) {
          breakIndex = i;
          break;
        }
      }

      if (breakIndex !== -1) {
        const stringContent = afterUnterminated.substring(0, breakIndex);
        const remainder = afterUnterminated.substring(breakIndex);
        
        // Escape any unescaped quotes within the identified content
        const escapedContent = stringContent.replace(/(?<!\\)"/g, '\\"');
        repaired = beforeUnterminated + escapedContent + '"' + remainder;
      } else {
        // Just close the string at the very end
        const escapedContent = afterUnterminated.replace(/(?<!\\)"/g, '\\"');
        repaired = beforeUnterminated + escapedContent + '"';
      }
    }

    return repaired;
  }

  // FIX: Replaced unsafe single quote replacement with a stateful parser.
  /**
   * Safely replaces single quotes with double quotes only for keys and string values,
   * ignoring apostrophes inside already double-quoted strings.
   */
  private static safelyFixQuotes(jsonStr: string): string {
    let result = '';
    let inDoubleQuoteString = false;
    let escaped = false;

    for (let i = 0; i < jsonStr.length; i++) {
      const char = jsonStr[i];

      if (escaped) {
        result += char;
        escaped = false;
        continue;
      }

      if (char === '\\') {
        escaped = true;
        result += char;
        continue;
      }
      
      if (char === '"') {
        inDoubleQuoteString = !inDoubleQuoteString;
      }

      if (char === "'" && !inDoubleQuoteString) {
        result += '"'; // Replace single quote with double quote
      } else {
        result += char;
      }
    }
    return result;
  }

  /**
   * Fixes common JSON formatting issues using more robust methods.
   */
  private static applyCommonFixes(jsonStr: string): string {
    let fixed = jsonStr;

    // FIX: Use the new safe method for fixing quotes.
    fixed = this.safelyFixQuotes(fixed);

    // Fix trailing commas (this regex is safe and correct)
    fixed = fixed.replace(/,\s*([}\]])/g, '$1');

    // FIX: Improved regex for adding missing commas between properties.
    // This looks for a valid end of a value (quote, bracket, brace, number, true, false, null)
    // followed by whitespace and then a new key starting with a quote.
    fixed = fixed.replace(/("|}|\d|]|true|false|null)\s*\n\s*(")/g, '$1,\n$2');

    // FIX: More robustly fix unescaped newlines within strings.
    // This processes each string individually to avoid unintended side effects.
    fixed = fixed.replace(/"[\s\S]*?"/g, (match) => {
      // Don't process the outer quotes
      const content = match.substring(1, match.length - 1);
      // Replace unescaped newlines with escaped ones
      const fixedContent = content.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
      return `"${fixedContent}"`;
    });
    
    // Un-quote boolean and null values (this regex is safe and correct)
    fixed = fixed.replace(/"(true|false|null)"/g, '$1');

    return fixed;
  }

  /**
   * Validates JSON by attempting to parse and providing detailed error info.
   */
  private static validateAndGetError(jsonStr: string): { isValid: boolean; error?: string; position?: number } {
    try {
      JSON.parse(jsonStr);
      return { isValid: true };
    } catch (error: any) {
      const errorMessage = error.message || '';
      const positionMatch = errorMessage.match(/position (\d+)/);
      const position = positionMatch ? parseInt(positionMatch[1], 10) : undefined;

      return {
        isValid: false,
        error: errorMessage,
        position,
      };
    }
  }

  /**
   * Main repair function that attempts multiple strategies.
   */
  static repairJson(jsonStr: string): string {
    let current = jsonStr.trim();
    const maxAttempts = 5;
    let lastError = '';
    let lastPosition: number | undefined = -1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const validation = this.validateAndGetError(current);

      if (validation.isValid) {
        return current;
      }
      
      console.warn(`JSON repair attempt ${attempt + 1}: ${validation.error}`);

      // Prevent infinite loops on the same error
      if (validation.error === lastError && validation.position === lastPosition) {
        console.error("Repair attempt stuck on the same error, aborting this strategy.");
        // REFACTOR: More aggressive truncation as a last resort for stuck loops
        if (validation.position) {
            const truncated = current.substring(0, validation.position);
            const openBraces = (truncated.match(/{/g) || []).length;
            const closeBraces = (truncated.match(/}/g) || []).length;
            const openBrackets = (truncated.match(/\[/g) || []).length;
            const closeBrackets = (truncated.match(/\]/g) || []).length;

            let repaired = truncated.replace(/,\s*$/, ''); // Remove trailing comma before closing
            
            for (let i = 0; i < (openBrackets - closeBrackets); i++) repaired += ']';
            for (let i = 0; i < (openBraces - closeBraces); i++) repaired += '}';
            
            current = repaired;
            // Try to validate this aggressive fix immediately
            const finalValidation = this.validateAndGetError(current);
            if (finalValidation.isValid) return current;
        }
        break; // Exit loop if stuck
      }
      
      lastError = validation.error || '';
      lastPosition = validation.position;

      // Apply different repair strategies based on the error
      if (validation.error?.includes('Unterminated string')) {
        current = this.repairUnterminatedStrings(current);
      } else {
        // Generic fixes for other errors like 'Unexpected token'
        current = this.applyCommonFixes(current);
      }
    }
    
    // One last attempt with all fixes
    try {
        let finalAttempt = this.applyCommonFixes(jsonStr.trim());
        finalAttempt = this.repairUnterminatedStrings(finalAttempt);
        JSON.parse(finalAttempt);
        return finalAttempt;
    } catch (e: any) {
        throw new Error(`Unable to repair JSON after ${maxAttempts} attempts. Last known error: ${lastError}`);
    }
  }
}

/**
 * Extracts a JSON string from a larger text block, often returned by an AI.
 * Enhanced version with advanced error recovery and repair capabilities.
 *
 * @param text The raw text output from the AI.
 * @returns A string that is a valid JSON object or array.
 * @throws An error if a valid JSON string cannot be extracted or repaired.
 */
export function extractJsonFromMarkdown(text: string): string {
  if (!text) {
    throw new Error("Input text is empty or null.");
  }
  const trimmedText = text.trim();

  // Early validation - if the entire text is valid JSON, return it
  try {
    JSON.parse(trimmedText);
    return trimmedText;
  } catch (e) {
    // Not valid JSON, continue with extraction logic
  }

  // Strategy 1: Look for Markdown JSON code blocks
  const markdownPatterns = [
    /```(?:json|JSON)\s*([\s\S]*?)\s*```/, // ```json ... ```
    /```\s*({[\s\S]*?}|\[[\s\S]*?\])\s*```/, // ``` { ... } ``` or ``` [ ... ] ```
  ];

  for (const pattern of markdownPatterns) {
    const match = trimmedText.match(pattern);
    if (match && match[1]) {
      const content = match[1].trim();
      try {
        // First, try to parse directly
        JSON.parse(content);
        return content;
      } catch (e) {
        console.warn("JSON inside markdown block is invalid, attempting repair...");
        try {
          return JsonRepairEngine.repairJson(content);
        } catch (repairError: any) {
          console.warn(`Markdown block repair failed: ${repairError.message}. Trying other strategies...`);
        }
      }
    }
  }

  // Strategy 2: Find the first '{' or '[' and find its matching pair
  const firstBrace = trimmedText.indexOf('{');
  const firstBracket = trimmedText.indexOf('[');
  
  let startIndex = -1;
  
  if (firstBrace === -1 && firstBracket === -1) {
      // No JSON structure found, attempt to repair the whole thing as a last resort
  } else if (firstBrace === -1) {
      startIndex = firstBracket;
  } else if (firstBracket === -1) {
      startIndex = firstBrace;
  } else {
      startIndex = Math.min(firstBrace, firstBracket);
  }

  if (startIndex !== -1) {
    const textToProcess = trimmedText.substring(startIndex);
    let balance = 0;
    let inString = false;
    let escaped = false;
    const startChar = textToProcess[0];
    const endChar = startChar === '{' ? '}' : ']';

    for (let i = 0; i < textToProcess.length; i++) {
      const char = textToProcess[i];

      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\') {
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
      }

      if (!inString) {
        if (char === startChar) balance++;
        if (char === endChar) balance--;
      }

      if (balance === 0 && i > 0) {
        const potentialJson = textToProcess.substring(0, i + 1);
        try {
          JSON.parse(potentialJson);
          return potentialJson;
        } catch (e) {
          console.warn(`Balanced JSON segment is invalid, attempting repair...`);
          try {
            return JsonRepairEngine.repairJson(potentialJson);
          } catch (repairError: any) {
            console.warn(`Repair failed for balanced segment: ${repairError.message}`);
          }
        }
        // If repair fails, we break and move to the final strategy
        break;
      }
    }
  }

  // Strategy 3: Last resort - try to repair the entire text
  console.warn("All extraction strategies failed, attempting to repair the entire input text as a last resort.");
  try {
    return JsonRepairEngine.repairJson(trimmedText);
  } catch (finalError: any) {
    throw new Error(`Unable to extract or repair valid JSON from AI response. Preview: "${trimmedText.substring(0, 100)}...". Final error: ${finalError.message}`);
  }
}

// The debug function remains largely the same and is still useful.
export function debugJsonExtraction(text: string): {
  originalText: string;
  textLength: number;
  hasMarkdownBlocks: boolean;
  potentialJsonStarts: number[];
  extractionResult?: string;
  extractionError?: string;
} {
  const trimmedText = text.trim();
  
  const debugInfo: any = {
    originalText: trimmedText.substring(0, 200) + (trimmedText.length > 200 ? '...' : ''),
    textLength: trimmedText.length,
    hasMarkdownBlocks: /```/.test(trimmedText),
    potentialJsonStarts: [],
  };
  
  for (let i = 0; i < trimmedText.length; i++) {
    if (trimmedText[i] === '{' || trimmedText[i] === '[') {
      debugInfo.potentialJsonStarts.push(i);
    }
  }
  
  try {
    debugInfo.extractionResult = extractJsonFromMarkdown(text);
  } catch (error: any) {
    debugInfo.extractionError = error.message;
  }
  
  return debugInfo;
}