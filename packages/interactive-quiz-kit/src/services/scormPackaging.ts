// src/lib/interactive-quiz-kit/services/scormPackaging.ts
import JSZip from 'jszip';
import type { QuizConfig } from '..';
import { generateSCORMManifest } from './SCORMManifestGenerator';
import { generateLauncherHTML } from './HTMLLauncherGenerator';

interface SCORMExportOptions {
  scormVersion: "1.2" | "2004";
}

const sanitizeFilename = (name: string): string => {
  return name.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
}

export const exportQuizAsSCORMZip = async (
  quiz: QuizConfig,
  options: SCORMExportOptions
): Promise<{ success: boolean; error?: string; fileName?: string }> => {
  try {
    const zip = new JSZip();

    // --- ĐỊNH NGHĨA CÁC ĐƯỜNG DẪN ---

    // 1. Đường dẫn URL để FETCH từ server (tương đối với thư mục `public`)
    const playerJSUrlToFetch = '/static/scorm-bundle/player.js';
    const mainCSSUrlToFetch = '/static/scorm-bundle/styles.css';
    const scratchBlocksEngineUrlToFetch = '/static/scratch-blocks/js/blockly_compressed_vertical.js';
    const scratchBlocksDefsUrlToFetch = '/static/scratch-blocks/js/blocks_compressed_vertical.js';
    const scratchBlocksMsgEnUrlToFetch = '/static/scratch-blocks/msg/js/en.js';
    const scratchBlocksCSSUrlToFetch = '/static/scratch-blocks/css/vertical.css';
    // Giả sử file blockly vẫn nằm ở gốc public để đơn giản
    // const blocklyCSSUrlToFetch = '/blockly-styles.css';

    // 2. Đường dẫn BÊN TRONG file ZIP (cấu trúc phẳng)
    const libraryJSPathInZip = 'player.js';
    const mainCSSPathInZip = 'styles.css';
    const scratchBlocksEnginePathInZip = 'scratch-blocks/js/blockly_compressed_vertical.js';
    const scratchBlocksDefsPathInZip = 'scratch-blocks/js/blocks_compressed_vertical.js';
    const scratchBlocksMsgEnPathInZip = 'scratch-blocks/msg/js/en.js';
    const scratchBlocksCSSPathInZip = 'scratch-blocks/css/vertical.css';
    //const blocklyCSSPathInZip = 'blockly-styles.css';
    const quizDataPathInZip = 'quiz_data.json';


    // --- BƯỚC MỚI: FETCH NỘI DUNG CÁC FILE TÀI SẢN TỪ THƯ MỤC PUBLIC ---
    console.log(`Fetching Player JS from: ${playerJSUrlToFetch}`);
    console.log(`Fetching Main CSS from: ${mainCSSUrlToFetch}`);

    const [playerJSContent, mainCSSContent, scratchBlocksEngineContent, scratchBlocksDefsContent, scratchBlocksMsgEnContent, scratchBlocksCSSContent ] = await Promise.all([
      // Fetch file JS của player
      fetch(playerJSUrlToFetch).then(res => {
        if (!res.ok) throw new Error(`Could not fetch Player JS at ${playerJSUrlToFetch}. Make sure the file exists in your app's public folder.`);
        return res.text();
      }),
      // Fetch file CSS chính
      fetch(mainCSSUrlToFetch).then(res => {
        if (!res.ok) throw new Error(`Could not fetch Main CSS at ${mainCSSUrlToFetch}. Make sure the file exists in your app's public folder.`);
        return res.text();
      }),
      fetch(scratchBlocksEngineUrlToFetch).then(res => {
        if (!res.ok) throw new Error(`Could not fetch Scratch Blocks Engine at ${scratchBlocksEngineUrlToFetch}.`);
        return res.text();
      }),
      fetch(scratchBlocksDefsUrlToFetch).then(res => {
        if (!res.ok) throw new Error(`Could not fetch Scratch Blocks Definitions at ${scratchBlocksDefsUrlToFetch}.`);
        return res.text();
      }),
      fetch(scratchBlocksMsgEnUrlToFetch).then(res => {
        if (!res.ok) throw new Error(`Could not fetch Scratch Blocks Messages EN at ${scratchBlocksMsgEnUrlToFetch}.`);
        return res.text();
      }),
      fetch(scratchBlocksCSSUrlToFetch).then(res => {
        if (!res.ok) throw new Error(`Could not fetch Scratch Blocks CSS at ${scratchBlocksCSSUrlToFetch}.`);
        return res.text();
      })
    ]);

    // --- THÊM CÁC FILE ĐÃ FETCH VÀO ZIP ---
    zip.file(libraryJSPathInZip, playerJSContent);
    zip.file(mainCSSPathInZip, mainCSSContent);
    zip.file(scratchBlocksEnginePathInZip, scratchBlocksEngineContent);
    zip.file(scratchBlocksDefsPathInZip, scratchBlocksDefsContent);
    zip.file(scratchBlocksMsgEnPathInZip, scratchBlocksMsgEnContent);
    zip.file(scratchBlocksCSSPathInZip, scratchBlocksCSSContent);

    // --- CÁC BƯỚC CÒN LẠI (TƯƠNG TỰ NHƯ CŨ) ---

    // 1. Tạo quiz_data.json
    const quizDataString = JSON.stringify(quiz, null, 2);
    zip.file(quizDataPathInZip, quizDataString);

    // 2. Generate imsmanifest.xml
    const manifestContent = generateSCORMManifest(
      quiz,
      options.scormVersion,
      'index.html',
      libraryJSPathInZip,
      quizDataPathInZip,
      scratchBlocksCSSPathInZip,
      mainCSSPathInZip
    );
    zip.file('imsmanifest.xml', manifestContent);

    // 3. Generate index.html (SCORM Launcher)
    const launcherContent = generateLauncherHTML(
      quiz,
      libraryJSPathInZip,
      quizDataPathInZip,
      scratchBlocksCSSPathInZip,
      mainCSSPathInZip,
      quiz.title
    );
    zip.file('index.html', launcherContent);
    
    // 4. Generate và tải ZIP
    const blob = await zip.generateAsync({ type: 'blob' });
    const fileName = `${sanitizeFilename(quiz.title || 'quiz')}_scorm_${options.scormVersion.replace('.', '_')}.zip`;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    return { success: true, fileName };
  } catch (err) {
    console.error('Error creating SCORM ZIP:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error during ZIP creation.' };
  }
};