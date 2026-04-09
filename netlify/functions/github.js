const OWNER = 'thanh01pmt';
const REPO = 'my-agents';
const BRANCH = 'main';
const PROJECTS_ROOT = 'packages/the-ultimate-curriculum-agent-os/projects';

export const handler = async (event) => {
  const { path: githubPath, action, project } = event.queryStringParameters;
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'GITHUB_TOKEN not configured on server' }),
    };
  }

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
      };

      const fetchContent = async (p) => {
        const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${p}?ref=${BRANCH}`;
        const res = await fetch(url, { headers });
        if (!res.ok) return null;
        return res.json();
      };

      const [status, matrix, changelog, lessons, slides] = await Promise.all([
        fetchContent(paths.status),
        fetchContent(paths.matrix),
        fetchContent(paths.changelog),
        fetchContent(paths.lessons),
        fetchContent(paths.slides),
      ]);

      return {
        statusCode: 200,
        body: JSON.stringify({
          status,
          matrix,
          changelog,
          lessons: Array.isArray(lessons) ? lessons : [],
          slides: Array.isArray(slides) ? slides : [],
        }),
      };
    }

    // --- 2. Generic Proxy for Single Path ---
    if (githubPath) {
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
