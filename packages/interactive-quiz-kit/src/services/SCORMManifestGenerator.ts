// src/lib/interactive-quiz-kit/services/SCORMManifestGenerator.ts

import type { QuizConfig, SCORMSettings } from '..';

const escapeXML = (unsafe: string | undefined): string => {
  if (typeof unsafe !== 'string') return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

export const generateSCORMManifest = (
  quizConfig: QuizConfig,
  scormVersion: "1.2" | "2004",
  launcherFile: string = 'index.html',
  libraryJSPath: string = 'scorm-bundle/player.js',
  quizDataPath: string = 'quiz_data.json',
  blocklyCSSPath?: string,
  mainCSSPath: string = 'styles.css'
): string => {
  const uniqueId = `iqk_${quizConfig.id.replace(/[^a-zA-Z0-9_]/g, '_')}`;
  const organizationId = `ORG-${uniqueId}`;
  const itemId = `ITEM-${uniqueId}`;
  const resourceId = `RES-${uniqueId}`;
  const quizTitle = escapeXML(quizConfig.title);
  const passingScore = quizConfig.settings?.passingScorePercent; // Get passing score from quizConfig

  const effectiveScormVersion = scormVersion;
  const manifestVersion = effectiveScormVersion === "2004" ? "1.0" : "1.3"; // Fixed for 1.2 compliance
  const schemaVersion = effectiveScormVersion === "2004" ? "CAM 1.3" : "1.2"; // Fixed to standard
  const adlcpNamespace = effectiveScormVersion === "2004" ? "http://www.adlnet.org/xsd/adlcp_v1p3" : "http://www.adlnet.org/xsd/adlcp_rootv1p2";
  const lomNamespace = effectiveScormVersion === "2004" ? "http://ltsc.ieee.org/xsd/LOM" : "http://www.imsglobal.org/xsd/imsmd_rootv1p2p1";

  // Additional namespaces for 2004 (recommended for compliance)
  const additionalNamespaces2004 = effectiveScormVersion === "2004" ? `
          xmlns:adlseq="http://www.adlnet.org/xsd/adlseq_v1p3"
          xmlns:adlnav="http://www.adlnet.org/xsd/adlnav_v1p3"
          xmlns:imsss="http://www.imsglobal.org/xsd/imsss_v1p0"` : '';

  const xsiSchemaLocation = effectiveScormVersion === "2004" 
    ? `http://www.imsglobal.org/xsd/imscp_v1p1 imscp_v1p1.xsd http://www.adlnet.org/xsd/adlcp_v1p3 adlcp_v1p3.xsd http://www.imsglobal.org/xsd/imsmd_v1p2 imsmd_v1p2p4.xsd http://www.adlnet.org/xsd/adlseq_v1p3 adlseq_v1p3.xsd http://www.adlnet.org/xsd/adlnav_v1p3 adlnav_v1p3.xsd http://www.imsglobal.org/xsd/imsss_v1p0 imsss_v1p0.xsd http://ltsc.ieee.org/xsd/LOM lom.xsd`
    : `http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd`; // Fixed mismatches

  const manifestHeader = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${uniqueId}-MANIFEST" version="${manifestVersion}" 
          xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
          xmlns:adlcp="${adlcpNamespace}"
          xmlns:imsmd="http://www.imsglobal.org/xsd/imsmd_v1p2"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"${additionalNamespaces2004}
          xsi:schemaLocation="${xsiSchemaLocation}">`;

  // Files list (include core + optional Scratch assets)
  const filesList = [launcherFile, libraryJSPath, quizDataPath, mainCSSPath];
  if (blocklyCSSPath) filesList.push(blocklyCSSPath);
  filesList.push(
    'scratch-blocks/css/vertical.css',
    'scratch-blocks/js/blockly_compressed_vertical.js',
    'scratch-blocks/js/blocks_compressed_vertical.js',
    'scratch-blocks/msg/js/en.js'
  );
  const files = filesList.map(file => `<file href="${escapeXML(file)}"/>`).join('\n      ');

  const masteryScoreTag = effectiveScormVersion === "2004" ? 'masteryScore' : 'masteryscore';
  const masteryScoreContent = passingScore !== undefined ? `<adlcp:${masteryScoreTag}>${passingScore}</adlcp:${masteryScoreTag}>` : '';

  const organizationStructure = effectiveScormVersion === "2004" ?
  `<organizations default="${organizationId}">
    <organization identifier="${organizationId}" structure="hierarchical">
      <title>${quizTitle}</title>
      <item identifier="${itemId}" identifierref="${resourceId}">
        <title>${quizTitle}</title>
        ${masteryScoreContent}
      </item>
    </organization>
  </organizations>` :
  // SCORM 1.2
  `<organizations default="${organizationId}">
    <organization identifier="${organizationId}">
      <title>${quizTitle}</title>
      <item identifier="${itemId}" identifierref="${resourceId}" isvisible="true">
        <title>${quizTitle}</title>
        ${masteryScoreContent}
      </item>
    </organization>
  </organizations>`;

  const scormTypeAttr = effectiveScormVersion === "2004" ? "scormType" : "scormtype";
  const resourceScormType = "sco"; // Same value, but attribute case differs

  // Version-specific LOM metadata (optional, but fixed for compliance)
  const lomContent = effectiveScormVersion === "2004" ? 
    `<lom xmlns="${lomNamespace}">
      <general>
        <title>
          <string language="en">${quizTitle}</string>
        </title>
        ${quizConfig.description ? `<description><string language="en">${escapeXML(quizConfig.description)}</string></description>` : ''}
      </general>
    </lom>` :
    `<imsmd:lom>
      <imsmd:general>
        <imsmd:title>
          <imsmd:langstring xml:lang="en">${quizTitle}</imsmd:langstring>
        </imsmd:title>
        ${quizConfig.description ? `<imsmd:description><imsmd:langstring xml:lang="en">${escapeXML(quizConfig.description)}</imsmd:langstring></imsmd:description>` : ''}
      </imsmd:general>
    </imsmd:lom>`;

  return `${manifestHeader}
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>${schemaVersion}</schemaversion>
    ${lomContent}
  </metadata>
  ${organizationStructure}
  <resources>
    <resource identifier="${resourceId}" type="webcontent" adlcp:${scormTypeAttr}="${resourceScormType}" href="${escapeXML(launcherFile)}">
      ${files}
    </resource>
  </resources>
</manifest>`;
};