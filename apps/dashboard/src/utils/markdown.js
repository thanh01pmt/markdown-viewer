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
        const key = parts[0].trim().toLowerCase();
        const val = parts.slice(1).join(':').trim();
        
        if (key === 'marp' && (val === 'true' || val === '1')) isMarp = true;
        
        // Add all frontmatter keys as metadata badges
        mdMeta.push({ label: parts[0].trim(), value: val });
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
          const key = line.substring(0, colonIdx).trim();
          const val = line.substring(colonIdx + 1).trim();
          mdMeta.push({ label: key, value: val });
        } else if (line.length < 50) {
          mdMeta.push({ label: line });
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
