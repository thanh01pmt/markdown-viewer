
const testCases = [
    "Hello\\nWorld", // Typical literal newline
    "\\(variable)",   // Swift interpolation: literal slash + paren
    "print(\"Hello\")",
    "Line1\\nLine2",
    "Value: \\(x)",
];

console.log("--- Testing Regex /\\\\n/g ---");

testCases.forEach(input => {
    const val = input.replace(/\\n/g, '\n');
    console.log(`Input: "${input}"`);
    // Use JSON.stringify to see special chars clearly
    console.log(`Output: ${JSON.stringify(val)}`);

    // Check if backslash preserved in swift string
    if (input.includes('(') && input.includes('\\') && !val.includes('\\')) {
        console.log("ALERT: Backslash missing in output!");
    }
});
