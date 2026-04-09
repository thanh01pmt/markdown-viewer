import { GITHUB_API, REPO, FILES } from '../config';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

async function githubFetch(path, token) {
  const cached = getCached(path);
  if (cached) return cached;

  const headers = { Accept: 'application/vnd.github.v3+json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = `${GITHUB_API}/repos/${REPO.owner}/${REPO.repo}/contents/${path}?ref=${REPO.branch}`;
  const res = await fetch(url, { headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GitHub API error ${res.status}`);
  }

  const json = await res.json();
  setCache(path, json);
  return json;
}

export async function fetchFileContent(filePath, token) {
  const data = await githubFetch(filePath, token);
  // data.content is base64 encoded
  const decoded = atob(data.content.replace(/\n/g, ''));
  return decoded;
}

export async function fetchDirContents(dirPath, token) {
  const data = await githubFetch(dirPath, token);
  return Array.isArray(data) ? data : [];
}

export async function fetchProjectStatus(token) {
  return fetchFileContent(FILES.projectStatus, token);
}

export async function fetchAlignmentMatrix(token) {
  return fetchFileContent(FILES.alignmentMatrix, token);
}

export async function fetchChangelog(token) {
  return fetchFileContent(FILES.changelog, token).catch(() => '');
}

export async function fetchLessons(token) {
  const files = await fetchDirContents(FILES.lessonsDir, token);
  return files.filter(f => f.name.endsWith('.md')).sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchLessonContent(lessonPath, token) {
  return fetchFileContent(lessonPath, token);
}

export function clearCache() {
  cache.clear();
}
