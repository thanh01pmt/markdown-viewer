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

const FUNC_URL = '/.netlify/functions/github';

async function githubFetch(path, token) {
  const cached = getCached(path);
  if (cached) return cached;

  // If a token is provided in the front-end (manual override), we still use the direct GitHub API
  // Otherwise, we use our Netlify Function (which has the server-side token)
  let url, headers = { Accept: 'application/vnd.github.v3+json' };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    url = `${GITHUB_API}/repos/${REPO.owner}/${REPO.repo}/contents/${path}?ref=${REPO.branch}`;
  } else {
    url = `${FUNC_URL}?path=${encodeURIComponent(path)}`;
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 403 && res.headers.get('X-RateLimit-Remaining') === '0') {
      const reset = res.headers.get('X-RateLimit-Reset');
      const resetTime = reset ? new Date(parseInt(reset) * 1000).toLocaleTimeString('vi-VN') : '?';
      throw new Error(`Rate limit! Hết quota API. Reset lúc ${resetTime}.`);
    }
    throw new Error(err.message || `API error ${res.status}`);
  }

  const json = await res.json();
  setCache(path, json);
  return json;
}

export async function fetchAggrData(projectName) {
  const url = `${FUNC_URL}?action=aggregate&project=${encodeURIComponent(projectName)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (err.message || err.error) {
      throw new Error(err.message || err.error);
    }
    throw new Error(`Fallback: Không thể tải dữ liệu tổng hợp cho ${projectName}`);
  }
  return res.json();
}

export async function fetchFileContent(filePath, token) {
  if (!filePath) return '';
  const data = await githubFetch(filePath, token).catch(() => null);

  if (!data || !data.content) return '';
  const binaryString = atob(data.content.replace(/\n/g, ''));
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export async function fetchDirContents(dirPath, token) {
  if (!dirPath) return [];
  const data = await githubFetch(dirPath, token).catch(() => []);
  return Array.isArray(data) ? data : [];
}

// --- Specific fetchers ---

export async function fetchProjects(token) {
  const contents = await fetchDirContents(PROJECTS_ROOT, token);
  return contents.filter(f => f.type === 'dir').map(f => ({
    name: f.name,
    path: f.name // Use folder name as the project key/path
  }));
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

