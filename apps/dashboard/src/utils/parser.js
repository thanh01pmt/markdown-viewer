export function parseProjectStatus(markdown) {
  if (!markdown) return { pipeline: [], metrics: { totalLessons: 0, completed: 0, blockers: 0 } };
  
  const pipeline = [];
  const lines = markdown.split('\n');
  
  let inPipelineTable = false;
  let headersParsed = false;
  
  let completed = 0;
  let blockers = 0;
  
  for (const line of lines) {
    // Basic heuristic to find the pipeline table
    if (line.trim().startsWith('##') && line.toLowerCase().includes('pipeline')) {
      inPipelineTable = true;
      continue;
    }
    
    if (inPipelineTable && line.includes('|')) {
      if (line.includes('---')) {
        headersParsed = true;
        continue;
      }
      if (headersParsed) {
        const parts = line.split('|').map(p => p.trim()).filter(Boolean);
        // Assuming columns: Phase | Items | Status | Progress | Blockers
        if (parts.length >= 4) {
          const status = parts[2] || '';
          const blk = parts[4] || '';
          
          if (status.includes('Done') || status.includes('✅')) completed++;
          if (blk && blk !== 'None' && blk !== '-') blockers++;

          pipeline.push({
             phase: parts[0] || '',
             items: parts[1] || '',
             status: status,
             progress: parts[3] || '',
             blockers: blk
          });
        }
      }
    } else if (inPipelineTable && line.trim() === '') {
        // usually end of table
        if (headersParsed) inPipelineTable = false;
    }
  }

  const metrics = { 
      totalLessons: pipeline.length > 0 ? pipeline.length : 12, 
      completed: completed, 
      blockers: blockers 
  };
  
  return { pipeline, metrics };
}

export function parseAlignmentMatrix(markdown) {
   if (!markdown) return { roadmap: [] };
   
   const roadmap = [];
   const lines = markdown.split('\n');
   let inTable = false;
   let headersParsed = false;
   
   for (const line of lines) {
      if (line.includes('|')) {
         inTable = true;
         if (line.includes('---')) {
             headersParsed = true; continue;
         }
         if (headersParsed) {
            const parts = line.split('|').map(p => p.trim()).filter(Boolean);
            if (parts.length >= 3) {
               // Assuming columns: Module/ID | Title | Goals | Status
               const idModule = parts[0] || '';
               const title = parts[1] || '';
               const statusRaw = parts[parts.length - 1] || '';
               const status = statusRaw.includes('✅') ? '✅' : statusRaw.includes('🔄') ? '🔄' : '❌';
               
               roadmap.push({ id: idModule, title, status });
            }
         }
      } else if (inTable && line.trim() === '') {
          inTable = false;
      }
   }
   
   return { roadmap };
}
