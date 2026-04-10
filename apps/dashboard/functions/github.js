/* global process */
import { Buffer } from 'node:buffer';
const OWNER = 'thanh01pmt';
const REPO = 'my-agents';
const BRANCH = 'main';
const PROJECTS_ROOT = 'packages/the-ultimate-curriculum-agent-os/projects';

export const handler = async (event) => {
  const { path: githubPath, action, project } = event.queryStringParameters;
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    console.error('❌ GITHUB_TOKEN is missing in process.env');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'GITHUB_TOKEN not configured on server' }),
    };
  }

  console.log(`📡 [Proxy Request] path: ${githubPath || '(none)'}, action: ${action || '(none)'}, project: ${project || '(none)'}`);

  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'Authorization': `Bearer ${token}`,
    'User-Agent': 'Netlify-Function-Proxy',
  };

  try {
    // --- 1. Aggregated Action for Project Metadata ---
    if (action === 'aggregate' && project) {
      const base = `${PROJECTS_ROOT}/${project}`;
      const paths = {
        status: `${base}/PROJECT_STATUS.md`,
        matrix: `${base}/ALIGNMENT_MATRIX.md`,
        changelog: `${base}/CHANGELOG.md`,
        lessons: `${base}/_shared/LESSONS`,
        slides: `${base}/_shared/SLIDES`,
        assets: `${base}/_assets`,
        code: `${base}/_code`,
      };

      const fetchRecursive = async (p, depth = 0) => {
        if (depth > 3) return []; // Limit depth to avoid explosion
        const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${p}?ref=${BRANCH}`;
        const res = await fetch(url, { headers });
        if (!res.ok) {
          console.warn(`Failed to fetch ${p}: ${res.statusText}`);
          return [];
        }
        const data = await res.json();
        if (!Array.isArray(data)) return [data];

        let results = [];
        for (const item of data) {
          if (item.type === 'dir') {
            const subFiles = await fetchRecursive(item.path, depth + 1);
            results = results.concat(subFiles);
          } else {
            results.push(item);
          }
        }
        return results;
      };

      const fetchContent = async (p) => {
        const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${p}?ref=${BRANCH}`;
        const res = await fetch(url, { headers });
        if (!res.ok) return null;
        return res.json();
      };

      const [status, matrix, changelog, lessons, slides, assets, code] = await Promise.all([
        fetchContent(paths.status),
        fetchContent(paths.matrix),
        fetchContent(paths.changelog),
        fetchContent(paths.lessons),
        fetchContent(paths.slides),
        fetchRecursive(paths.assets),
        fetchRecursive(paths.code),
      ]);

      return {
        statusCode: 200,
        body: JSON.stringify({
          status,
          matrix,
          changelog,
          lessons: Array.isArray(lessons) ? lessons : [],
          slides: Array.isArray(slides) ? slides : [],
          assets: Array.isArray(assets) ? assets : [],
          code: Array.isArray(code) ? code : [],
        }),
      };
    }

    // --- 2. Generic Proxy for Single Path (Supports Images) ---
    if (githubPath) {
      const isImg = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].some(ext => githubPath.toLowerCase().endsWith(ext));
      
      // If it's an image, we want the raw binary content
      if (isImg) {
        const rawUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${githubPath}?ref=${BRANCH}`;
        const rawRes = await fetch(rawUrl, {
          headers: {
            ...headers,
            'Accept': 'application/vnd.github.v3.raw',
          }
        });

        if (!rawRes.ok) {
          return {
            statusCode: rawRes.status,
            body: JSON.stringify({ error: `GitHub image error: ${rawRes.statusText}` }),
          };
        }

        const buffer = await rawRes.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        
        // Determine Content-Type
        let contentType = 'image/png';
        if (githubPath.endsWith('.jpg') || githubPath.endsWith('.jpeg')) contentType = 'image/jpeg';
        else if (githubPath.endsWith('.svg')) contentType = 'image/svg+xml';
        else if (githubPath.endsWith('.webp')) contentType = 'image/webp';
        else if (githubPath.endsWith('.gif')) contentType = 'image/gif';

        return {
          statusCode: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600',
          },
          body: base64,
          isBase64Encoded: true,
        };
      }

      // Default: Fetch JSON metadata for other files
      const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${githubPath}?ref=${BRANCH}`;
      const res = await fetch(url, { headers });
      
      if (!res.ok) {
        return {
          statusCode: res.status,
          body: JSON.stringify({ error: `GitHub error: ${res.statusText}` }),
        };
      }

      const data = await res.json();
      return {
        statusCode: 200,
        body: JSON.stringify(data),
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing path or aggregated action parameters' }),
    };

  } catch (error) {
    console.error('Proxy Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', message: error.message }),
    };
  }
};
