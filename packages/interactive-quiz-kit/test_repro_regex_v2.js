
const testCases = [
    "Hello\\nWorld",           // Standard literal newline -> Expect newline
    "\\(variable)",            // Swift interpolation -> Expect preserved
    "Value: \\(x)",            // Swift interpolation -> Expect preserved
    "Escaped newline \\\\n",   // Literal backslash + n -> Expect preserved literal \n (double backslash in output)
    "Escaped backslash \\\\",  // Literal backslash -> Expect preserved
];

console.log("--- Testing New Robust Regex ---");

testCases.forEach(input => {
    // logic from QuestionImportService.ts
    const val = input.replace(/\\(.)/g, (match, char) => {
        return char === 'n' ? '\n' : match;
    });

    console.log(`Input: "${input}"`);
    console.log(`Output: ${JSON.stringify(val)}`);

    if (input.includes('(') && input.includes('\\') && !val.includes('\\')) {
        console.error("FAIL: Swift interpolation stripped!");
    }
    if (input.includes('\\\\n') && val.includes('\n') && !val.includes('\\n')) {
        // If input was literal `\\n` (backslash n), output should contain `\\n` (literal backslash n), 
        // NOT newline character (unless it also had one).
        // Wait, logic: match `\\`. Char `\`. Return `\\`. Next `n`. Result `\\n`. Correct.
        // Old logic: matched `\n` -> newline. Result `\` `newline`.
        console.log("CHECK: Escaped newline preserved as literal?");
    }
});
