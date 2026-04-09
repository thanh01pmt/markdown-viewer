import { GITHUB_API, REPO, PROJECTS_ROOT } from '../config';

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
  if (!filePath) return '';
  const data = await githubFetch(filePath, token).catch(() => null);
  if (!data || !data.content) return '';
  // data.content is base64 encoded
  const decoded = atob(data.content.replace(/\n/g, ''));
  return decoded;
}

export async function fetchDirContents(dirPath, token) {
  if (!dirPath) return [];
  const data = await githubFetch(dirPath, token).catch(() => []);
  return Array.isArray(data) ? data : [];
}

// --- Specific fetchers ---

export async function fetchProjects(token) {
  const contents = await fetchDirContents(PROJECTS_ROOT, token);
  return contents.filter(f => f.type === 'dir').map(f => f.name);
}

export async function fetchProjectStatus(path, token) {
  return fetchFileContent(path, token);
}

export async function fetchAlignmentMatrix(path, token) {
  return fetchFileContent(path, token);
}

export async function fetchChangelog(path, token) {
  return fetchFileContent(path, token).catch(() => '');
}

export async function fetchLessons(path, token) {
  const files = await fetchDirContents(path, token);
  return files.filter(f => f.name.endsWith('.md')).sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchSlides(path, token) {
  const files = await fetchDirContents(path, token);
  return files.filter(f => f.name.endsWith('.md')).sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchLessonContent(lessonPath, token) {
  return fetchFileContent(lessonPath, token);
}

export function clearCache() {
  cache.clear();
}

