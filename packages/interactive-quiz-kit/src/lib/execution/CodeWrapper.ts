/**
 * Utility to wrap user code with boilerplate (like main function) for specific languages.
 */
export class CodeWrapper {
  /**
   * Wraps code with necessary boilerplate for the given language.
   */
  public static wrap(code: string, language: string, options: { 
    functionSignature?: string; 
    testCaseInput?: any[];
  } = {}): string {
    const lang = language.toLowerCase();

    if (lang === 'c' || lang === 'cpp') {
      return this.wrapC(code, options.testCaseInput || [], options.functionSignature);
    }

    // Languages like Python, JS, Lua don't strictly need a wrapper for simple snippets
    // as they are top-level execution scripts.
    return code;
  }

  private static wrapC(code: string, input: any[], signature?: string): string {
    // If code already contains main, don't wrap
    if (code.includes('int main') || code.includes('void main')) {
      return code;
    }

    // Default to a simple wrapper if no signature
    if (!signature) {
      return `
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>

${code}

int main() {
    // No signature provided, assuming competitive programming style if stdin is used
    return 0;
}
`;
    }

    // Attempt to parse signature: "int add(int a, int b)"
    // This is a naive parser for the prototype
    const sig = signature?.trim();
    const match = sig?.match(/(\w+)\s+(\w+)\s*\((.*)\)/);
    
    if (!match) {
      // Fallback: If we have 2 inputs, assume int add(int a, int b) for testing
      if (input.length === 2) {
        return `
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>

${code}

int main() {
    int v0, v1;
    if (scanf("%d %d", &v0, &v1) == 2) {
        // Try to call 'add' if it exists in the code
        ${code.includes('add') ? 'printf("%d", add(v0, v1));' : '// Function not found'}
    }
    return 0;
}
`;
      }
      return code;
    }

    const [,, funcName, paramsStr] = match;
    const params = paramsStr.split(',').map(p => p.trim()).filter(p => p.length > 0);
    
    // Generate scanf and printf logic based on params
    // C: int -> %d, float -> %f, string -> %s
    let scanfFormat = '';
    let scanfArgs = '';
    let callArgs = '';

    params.forEach((p, i) => {
      const parts = p.split(/\s+/);
      const type = parts[0];
      const name = parts[parts.length - 1];
      
      let fmt = '%d';
      if (type === 'float' || type === 'double') fmt = '%lf';
      if (type === 'char*') fmt = '%s';
      
      scanfFormat += (i === 0 ? '' : ' ') + fmt;
      scanfArgs += `, &v${i}`;
      callArgs += (i === 0 ? '' : ', ') + `v${i}`;
    });

    return `
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>

${code}

int main() {
    ${params.map((p, i) => `${p.split(/\s+/)[0]} v${i};`).join('\n    ')}
    if (scanf("${scanfFormat}"${scanfArgs}) != ${params.length}) return 1;
    printf("%d", ${funcName}(${callArgs}));
    return 0;
}
`;
  }
}
