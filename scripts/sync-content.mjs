import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';

const SOURCE_DIR = process.argv[2] || process.env.CONTENT_SOURCE;
const PROGRAM_ID = process.argv[3] || process.env.PROGRAM_ID || 'default-program';
const TARGET_BASE = './src/content';

if (!SOURCE_DIR) {
  console.error('Usage: node sync-content.mjs <source-dir> <program-id>');
  process.exit(1);
}

async function syncCollection(sourceSubDir, type) {
  const sourcePath = path.join(SOURCE_DIR, sourceSubDir);
  const targetDir = path.join(TARGET_BASE, type, PROGRAM_ID);

  if (!existsSync(sourcePath)) {
    console.warn(`Source subdirectory not found: ${sourcePath}`);
    return;
  }

  await fs.mkdir(targetDir, { recursive: true });
  const files = await fs.readdir(sourcePath);

  for (const file of files) {
    if (!file.endsWith('.md')) continue;

    const sourceFile = path.join(sourcePath, file);
    const content = await fs.readFile(sourceFile, 'utf8');
    
    // Simple Transformation: MD -> MDX + Inject Frontmatter
    const transformed = transformContent(content, file, type);
    const targetFile = path.join(targetDir, file.replace('.md', '.mdx'));
    
    await fs.writeFile(targetFile, transformed);
    console.log(`Synced: ${file} -> ${type}/${PROGRAM_ID}`);
  }
}

function transformContent(content, fileName, type) {
  // Extract title from first # header or filename
  const titleMatch = content.match(/^#\s+(.+)/m);
  const title = titleMatch ? titleMatch[1] : fileName.replace('.md', '');
  
  // Clean content of the first title to avoid duplication if it's there
  let body = content;
  if (titleMatch) {
    body = content.replace(/^#\s+.+/m, '').trim();
  }

  const frontmatter = [
    '---',
    `title: "${title}"`,
    `program_id: "${PROGRAM_ID}"`,
    `type: "${type}"`,
    `date: ${new Date().toISOString()}`,
    '---',
    '',
  ].join('\n');

  return frontmatter + body;
}

async function main() {
  console.log(`Starting sync for program: ${PROGRAM_ID}`);
  await syncCollection('LESSONS', 'lessons');
  await syncCollection('SLIDES', 'slides');
  console.log('Sync completed successfully.');
}

main().catch(console.error);
