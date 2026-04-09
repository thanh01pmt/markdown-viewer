export const REPO = {
  owner: 'thanh01pmt',
  repo: 'my-agents',
  branch: 'main',
  base: 'packages/the-ultimate-curriculum-agent-os/projects/pathway-aiot',
};

export const GITHUB_API = 'https://api.github.com';
export const RAW_BASE = `https://raw.githubusercontent.com/${REPO.owner}/${REPO.repo}/${REPO.branch}/${REPO.base}`;

// Key file paths relative to base
export const FILES = {
  projectStatus: `${REPO.base}/PROJECT_STATUS.md`,
  alignmentMatrix: `${REPO.base}/ALIGNMENT_MATRIX.md`,
  changelog: `${REPO.base}/CHANGELOG.md`,
  resourceManifest: `${REPO.base}/_shared/RESOURCE_MANIFEST.md`,
  lessonsDir: `${REPO.base}/_shared/LESSONS`,
};
