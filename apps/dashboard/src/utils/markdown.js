import GithubSlugger from 'github-slugger';

const TECHNICAL_KEYS = [
  'marp', 'theme', 'size', 'paginate', 'header', 'footer', 'style', 'class',
  'headingdivider', 'color', 'background', 'background-color', 'border', 'border-left',
  'font-family', 'font-size', 'line-height', 'transition', 'width', 'height', 'text-shadow'
];

function isTechnicalKey(key) {
  const k = key.toLowerCase();
  return TECHNICAL_KEYS.some(tk => k === tk || k.startsWith('ms-') || k.startsWith('_'));
}

export function extractMetadata(content) {
  if (!content) return { processedContent: '', mdMeta: [], isMarp: false, rawContent: '' };

  let stripped = content;
  let mdMeta = [];
  let isMarp = false;

  // 1. Detect and parse frontmatter (YAML-like)
  const fmRegex = /^\s*---\s*\n([\s\S]*?)\n---\s*\n?/;
  const fmMatch = content.match(fmRegex);
  
  if (fmMatch) {
    const fmLines = fmMatch[1].split('\n');
    fmLines.forEach(line => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const originalKey = parts[0].trim();
        const key = originalKey.toLowerCase();
        const val = parts.slice(1).join(':').trim();
        
        if (key === 'marp' && (val === 'true' || val === '1')) isMarp = true;
        
        // Only add non-technical keys as metadata badges
        if (!isTechnicalKey(key)) {
          mdMeta.push({ label: originalKey, value: val });
        }
      }
    });
    // Remove frontmatter from the "processed" content
    stripped = content.replace(fmRegex, '');
  } else {
    // Fallback: check if marp: true is present anywhere in the start of the file
    if (content.substring(0, 500).toLowerCase().includes('marp: true')) {
        isMarp = true;
    }
  }

  // 2. Extract metadata from HTML comments (custom tags like <!-- ... -->)
  const htmlCommentRegex = /<!--([\s\S]*?)-->/g;
  stripped = stripped.replace(htmlCommentRegex, (match, innerText) => {
    const text = innerText.trim();
    if (text.includes('SME_MANDATE') || text.includes(':') || text.toLowerCase().includes('meta')) {
    const lines = text.split('\n').map(l => l.trim().replace(/^meta\s*[:-]*/i, '')).filter(Boolean);
      lines.forEach(line => {
        if (line.includes('[SME_MANDATE]')) {
          mdMeta.push({ label: 'SME MANDATE', isPrimary: true });
          return;
        }
        
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0 && colonIdx < 40) {
          const originalKey = line.substring(0, colonIdx).trim();
          const key = originalKey.toLowerCase();
          const val = line.substring(colonIdx + 1).trim();
          
          if (!isTechnicalKey(key)) {
            mdMeta.push({ label: originalKey, value: val });
          }
        } else if (line.length < 50) {
          // If it doesn't look like a key-value or technical directive
          const key = line.toLowerCase();
          if (!isTechnicalKey(key) && !key.includes('marp')) {
            mdMeta.push({ label: line });
          }
        }
      });
    }
    return ''; // Remove comment from display
  });

  // 3. Keep support for legacy @ annotations if they exist
  stripped = stripped.replace(/^@\S+[^\n]*\n?/gm, '');

  // Final cleanup of the markdown content
  stripped = stripped.replace(/^\s+/, '');

  // For Marp, we MUST pass the full content including frontmatter/directives.
  // Stripping it makes Marp ignore its own slide formatting rules.
  const rawContentForMarp = content;

  return { 
    processedContent: stripped, 
    mdMeta, 
    isMarp, 
    rawContent: rawContentForMarp 
  };
}

export function getHeadings(content) {
  if (!content) return [];
  const slugger = new GithubSlugger();
  // Strip frontmatter before parsing headings
  const fmRegex = /^\s*---\s*\n([\s\S]*?)\n---\s*\n?/;
  const stripped = content.replace(fmRegex, '');
  
  // Also strip HTML comments which might contain metadata that shouldn't be headings
  const cleanContent = stripped.replace(/<!--[\s\S]*?-->/g, '');
  
  const matches = Array.from(cleanContent.matchAll(/^(#{1,3})\s+(.+)$/gm));
  return matches.map(m => {
    const level = m[1].length;
    const text = m[2].trim();
    // Use the same slugification as LessonOutline (strip Markdown from text before slugging)
    const id = slugger.slug(text);
    return { level, text, id };
  });
}

