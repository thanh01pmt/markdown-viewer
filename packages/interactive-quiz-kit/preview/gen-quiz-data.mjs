import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as iqk from '../dist/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outPath = join(__dirname, 'quiz_data.json');

const data = iqk.sampleQuiz;

const logValidation = (label, payload) => {
  try {
    const compact = JSON.stringify(payload);
    console.log(`Validation successful: ${compact}`);
  } catch {
    console.log(label, payload);
  }
};

const findQuestion = (code) => data.questions.find(q => q.questionTypeCode === code);

const mcq = findQuestion('MULTIPLE_CHOICE');
if (mcq && Array.isArray(mcq.options) && mcq.options.length > 0 && typeof mcq.correctAnswerId === 'string') {
  const hasCorrect = mcq.options.some(opt => opt.id === mcq.correctAnswerId);
  if (hasCorrect) {
    logValidation('MCQ', { id: mcq.id, questionTypeCode: mcq.questionTypeCode, prompt: mcq.prompt, options: mcq.options.slice(0,2), correctAnswerId: mcq.correctAnswerId, points: mcq.points });
  }
}

const blk = findQuestion('BLOCKLY_PROGRAMMING');
if (blk && typeof blk.toolboxDefinition === 'string' && blk.toolboxDefinition.includes('<xml')) {
  logValidation('BLOCKLY', { id: blk.id, questionTypeCode: blk.questionTypeCode, prompt: blk.prompt, toolboxDefinition: '<xml>...</xml>', solutionGeneratedCode: blk.solutionGeneratedCode });
}

const scr = findQuestion('SCRATCH_PROGRAMMING');
if (scr && typeof scr.toolboxDefinition === 'string') {
  const hasBlocks = scr.toolboxDefinition.includes('motion_movesteps') && scr.toolboxDefinition.includes('event_whenflagclicked');
  const usesStyles = scr.toolboxDefinition.includes('categorystyle');
  if (hasBlocks && usesStyles) {
    logValidation('SCRATCH', { id: scr.id, questionTypeCode: scr.questionTypeCode, prompt: scr.prompt, toolboxDefinition: '<xml>...</xml>', solutionGeneratedCode: scr.solutionGeneratedCode });
  }
}

writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8');
console.log('Wrote preview quiz data to', outPath);