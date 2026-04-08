import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.resolve(__dirname, '../apps/web/src/content');

/**
 * Recursively find all files in a directory
 */
function getFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let results = [];

  for (const file of files) {
    const res = path.resolve(dir, file.name);
    if (file.isDirectory()) {
      results = results.concat(getFiles(res));
    } else if (file.name.endsWith('.md') || file.name.endsWith('.mdx')) {
      results.push(res);
    }
  }
  return results;
}

/**
 * Fix frontmatter title formatting
 */
function fixFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Regex explains:
  // ^title:\s+ - matches 'title: ' at the start of a line
  // " - matches an opening double quote
  // (.*) - captures everything inside
  // " - matches a closing double quote
  // $ - matches end of line
  // Note: This regex target lines that are wrapped in double quotes
  const fixedContent = content.replace(/^title:\s+"(.*)"$/m, (match, title) => {
    // If the title contains double quotes inside, wrap in single quotes
    // This is the most common cause of Astro YAML parsing errors
    if (title.includes('"')) {
      return `title: '${title}'`;
    }
    return match; // Keep as is if no nested quotes
  });

  if (content !== fixedContent) {
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
    return true;
  }
  return false;
}

async function main() {
  console.log('🔍 Scanning for frontmatter issues...');
  
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`❌ Content directory not found: ${CONTENT_DIR}`);
    process.exit(1);
  }

  const files = getFiles(CONTENT_DIR);
  let fixedCount = 0;

  for (const file of files) {
    if (fixFrontmatter(file)) {
      fixedCount++;
    }
  }

  console.log(`\n✨ Done! Processed ${files.length} files. Fixed ${fixedCount} issues.`);
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
