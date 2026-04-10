// ─── parseProjectStatus ───────────────────────────────────────────────
// Parses PROJECT_STATUS.md into structured data
export function parseProjectStatus(md) {
  const lines = md.split('\n');

  // ── Pipeline table ─────────────────────────────────────────
  const pipelineRows = [];
  let inPipeline = false;
  let headerParsed = false;

  for (const line of lines) {
    if (/##\s*1\.\s*Trạng thái Pipeline/i.test(line)) { inPipeline = true; continue; }
    if (inPipeline && /^##\s*[^1]/.test(line)) { inPipeline = false; }
    if (!inPipeline) continue;

    const cells = line.split('|').map(c => c.trim()).filter(Boolean);
    if (!cells.length || cells[0].startsWith(':') || cells[0].startsWith('-')) continue;
    if (!headerParsed) { headerParsed = true; continue; } // skip header row

    const [phase, artifact, status, agent, note] = cells;
    if (!phase) continue;

    pipelineRows.push({
      phase: phase.replace(/\*\*/g, '').trim(),
      artifact: artifact?.replace(/\*\*/g, '').trim() || '',
      status: normalizeStatus(status || ''),
      agent: agent?.trim() || '',
      note: note?.trim() || '',
    });
  }

  // ── Roadmap checklist ───────────────────────────────────────
  const roadmap = [];
  let inRoadmap = false;
  for (const line of lines) {
    if (/##\s*2\.\s*Lộ trình/i.test(line)) { inRoadmap = true; continue; }
    if (inRoadmap && /^##/.test(line)) { inRoadmap = false; }
    if (!inRoadmap) continue;
    const m = line.match(/^-\s*\[(x| )\]\s*\*\*(.+?)\*\*(?:\s*[-–:]\s*(.+))?/i);
    if (m) {
      roadmap.push({
        done: m[1].toLowerCase() === 'x',
        label: m[2].trim(),
        sub: m[3]?.trim() || '',
        id: m[2].match(/HP\d+/)?.[0] || m[2].trim(),
      });
    }
  }

  // ── Changelog ──────────────────────────────────────────────
  const changelog = [];
  let inChangelog = false;
  for (const line of lines) {
    if (/##\s*3\.\s*Nhật ký/i.test(line)) { inChangelog = true; continue; }
    if (inChangelog && /^##/.test(line)) { inChangelog = false; }
    if (!inChangelog) continue;
    const checkItem = line.match(/^-\s*\[(x| )\]\s*(.+)/i);
    if (checkItem) {
      changelog.push({ done: checkItem[1].toLowerCase() === 'x', text: checkItem[2].trim(), type: 'task' });
      continue;
    }
    const dateItem = line.match(/^-\s*\*\*(\d{4}-\d{2}-\d{2})\*\*[:\s]+(.+)/);
    if (dateItem) {
      changelog.push({ done: true, date: dateItem[1], text: dateItem[2].trim(), type: 'date' });
    }
  }

  // ── Issues & Escalated ───────────────────────────────────────
  const issues = [];
  const escalated = [];
  let inIssues = false;
  for (const line of lines) {
    if (/##\s*4\.\s*Việc đang dang dở/i.test(line)) { inIssues = true; continue; }
    if (inIssues && /^##/.test(line)) { inIssues = false; }
    if (!inIssues) continue;
    
    if (line.includes('⛔ ESCALATED')) {
      escalated.push(line.replace(/.*⛔ ESCALATED[:\s]*/i, '').trim());
    } else if (line.trim().startsWith('-')) {
      issues.push(line.replace(/^-\s*/, '').trim());
    }
  }

  // ── Computed stats ─────────────────────────────────────────
  const done = pipelineRows.filter(r => r.status === 'done').length;
  const pending = pipelineRows.filter(r => r.status === 'pending').length;
  const total = pipelineRows.length;
  const hpDone = roadmap.filter(r => r.done).length;

  return { 
    pipelineRows, roadmap, changelog, issues, escalated,
    stats: { done, pending, total, hpDone, hpTotal: roadmap.length } 
  };
}

function normalizeStatus(raw) {
  if (/✅/.test(raw) || /completed|approved|done|finished/i.test(raw)) return 'done';
  if (/⏳/.test(raw) || /pending|in.progress|wip/i.test(raw)) return 'pending';
  if (/❌/.test(raw) || /blocked/i.test(raw)) return 'blocked';
  return 'todo';
}

// ─── parseAlignmentMatrix ─────────────────────────────────────────────
export function parseAlignmentMatrix(md) {
  const rows = [];
  let inTable = false;
  let headerSeen = false;

  for (const line of md.split('\n')) {
    if (!line.trim().startsWith('|')) { inTable = false; headerSeen = false; continue; }
    if (!inTable) inTable = true;
    const cells = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cells[0].startsWith('-') || cells[0].startsWith(':')) continue;
    if (!headerSeen) { headerSeen = true; continue; }
    if (cells.length >= 2) {
      rows.push({
        lesson: cells[0]?.replace(/\*\*/g, '') || '',
        objective: cells[1] || '',
        content: cells[2] || '',
        activity: cells[3] || '',
        assessment: cells[4] || '',
        status: normalizeStatus(cells[5] || cells[cells.length - 1] || ''),
      });
    }
  }
  return rows;
}
