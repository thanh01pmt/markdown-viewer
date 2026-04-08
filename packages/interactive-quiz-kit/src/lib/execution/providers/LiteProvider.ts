import { IExecutionProvider, ExecutionResult } from '../IExecutionProvider';

declare global {
  interface Window {
    loadPyodide?: any;
    pyodide?: any;
    fengari?: any;
    to_luastring?: any;
  }
}

export class LiteProvider implements IExecutionProvider {
  public readonly id = 'lite';
  public readonly name = 'Lite Browser Engine';
  private pyodideInstance: any = null;
  private isInitializingPython = false;

  public async isAvailable(): Promise<boolean> {
    // Lite is always available in browser environments
    return typeof window !== 'undefined';
  }

  public async execute(code: string, language: string, stdin?: string): Promise<ExecutionResult> {
    const lang = language.toLowerCase();

    switch (lang) {
      case 'javascript':
      case 'js':
        return this.executeJS(code, stdin);
      case 'lua':
        return this.executeLua(code, stdin);
      case 'python':
        return this.executePython(code, stdin);
      default:
        return {
          stdout: '',
          stderr: `Lite execution for '${language}' is not implemented yet.`,
          exitCode: 1,
          message: 'UNSUPPORTED_LANGUAGE'
        };
    }
  }

  private async executeJS(code: string, _stdin?: string): Promise<ExecutionResult> {
    try {
      let output = '';
      const originalLog = console.log;
      
      // Temporary override for output capture
      console.log = (...args: any[]) => {
        output += args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : arg)).join(' ') + '\n';
      };

      const fn = new Function(code);
      fn();

      console.log = originalLog;
      return { stdout: output, stderr: '', exitCode: 0 };
    } catch (error) {
      return {
        stdout: '',
        stderr: error instanceof Error ? error.message : String(error),
        exitCode: 1,
        message: 'JS_EXECUTION_FAILED'
      };
    }
  }

  private async executeLua(code: string, _stdin?: string): Promise<ExecutionResult> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Lua Lite execution requires a browser environment.');
      }

      if (!window.fengari) {
        await this.loadScript('https://unpkg.com/fengari-web/dist/fengari-web.js');
      }

      const { lua, lauxlib, lualib, to_luastring } = window.fengari;
      const L = lauxlib.luaL_newstate();
      lualib.luaL_openlibs(L);

      let output = '';
      // We set a global variable in JS that Lua can write to. 
      // Fengari allows exposing JS objects to Lua.
      (window as any)._lite_lua_print = (...args: any[]) => {
          output += args.join('\t') + '\n';
      };

      const wrapperCode = `
        local js = require "js"
        print = function(...)
          js.global._lite_lua_print(...)
        end
        ${code}
      `;

      const status = lauxlib.luaL_dostring(L, to_luastring(wrapperCode));

      if (status !== 0) {
        const err = lua.lua_tostring(L, -1);
        return { stdout: output, stderr: err || 'Unknown Lua error', exitCode: 1 };
      }

      return { stdout: output, stderr: '', exitCode: 0 };
    } catch (error) {
      return {
        stdout: '',
        stderr: error instanceof Error ? error.message : String(error),
        exitCode: 1,
        message: 'LUA_EXECUTION_FAILED'
      };
    }
  }

  private async executePython(code: string, _stdin?: string): Promise<ExecutionResult> {
    try {
      if (!this.pyodideInstance) {
        if (this.isInitializingPython) {
          throw new Error('Python engine is still initializing...');
        }
        this.isInitializingPython = true;
        
        await this.loadScript('https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js');
        this.pyodideInstance = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/'
        });
        this.isInitializingPython = false;
      }

      let output = '';
      this.pyodideInstance.setStdout({
        batched: (text: string) => {
          output += text + '\n';
        }
      });

      await this.pyodideInstance.runPythonAsync(code);

      return { stdout: output, stderr: '', exitCode: 0 };
    } catch (error) {
      this.isInitializingPython = false;
      return {
        stdout: '',
        stderr: error instanceof Error ? error.message : String(error),
        exitCode: 1,
        message: 'PYTHON_EXECUTION_FAILED'
      };
    }
  }

  private loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
      document.head.appendChild(script);
    });
  }

  public getPriority(language: string): number {
    const lang = language.toLowerCase();
    // Lite is best for JS (instant). 
    // For Python/Lua, it's a good middle ground (8) compared to AI (1).
    if (lang === 'javascript' || lang === 'js') return 100;
    if (['python', 'lua'].includes(lang)) return 8;
    return 0;
  }

  public getSupportedLanguages(): string[] {
    return ['javascript', 'js', 'python', 'lua'];
  }
}
