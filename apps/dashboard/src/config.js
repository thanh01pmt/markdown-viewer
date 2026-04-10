export const REPO = {
  owner: 'thanh01pmt',
  repo: 'my-agents',
  branch: 'main',
};

export const PROJECTS_ROOT = 'packages/the-ultimate-curriculum-agent-os/projects';

export const GITHUB_API = 'https://api.github.com';

// Helper to get file paths for a specific project
export const getProjectFiles = (projectDirName) => {
  const base = `${PROJECTS_ROOT}/${projectDirName}`;
  return {
    base,
    projectStatus: `${base}/PROJECT_STATUS.md`,
    alignmentMatrix: `${base}/ALIGNMENT_MATRIX.md`,
    changelog: `${base}/CHANGELOG.md`,
    resourceManifest: `${base}/_shared/RESOURCE_MANIFEST.md`,
    lessonsDir: `${base}/_shared/LESSONS`,
    slidesDir: `${base}/_shared/SLIDES`,
    reportsDir: `${base}/_reports`,
    analystDir: `${base}/_analyst`,
    designerDir: `${base}/_designer`,
  };
};

