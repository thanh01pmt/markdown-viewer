import http from 'http';
import https from 'https';
import { existsSync, createReadStream, readFileSync, promises as fsPromises } from 'fs';
import { join, normalize } from 'path';

const root = normalize(join(process.cwd(), '.'));
const port = process.env.PORT ? Number(process.env.PORT) : 8080;

// Simple .env.local parser since we don't want extra dependencies
const envPaths = [
    join(process.cwd(), '.env.local'),
    join(process.cwd(), '../../.env.local')
];

for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    console.log(`[Env Load] Found environment file at: ${envPath}`);
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const [key, ...value] = line.trim().split('=');
      if (key && value.length > 0 && !key.startsWith('#')) {
        const val = value.join('=').replace(/^['"]|['"]$/g, '').trim(); // Remove quotes
        process.env[key.trim()] = val;
      }
    });
  }
}

// The real target (Mac Mini) should be defined separately
const JUDGE0_TARGET = process.env.JUDGE0_PROXY_TARGET || 'https://code.orchable.xyz';
const PISTON_TARGET = process.env.PISTON_PROXY_TARGET || 'https://piston.orchable.xyz';

console.log(`[Proxy Config] Judge0 -> ${JUDGE0_TARGET}`);
console.log(`[Proxy Config] Piston -> ${PISTON_TARGET}`);

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
};

const aliasScratchBlocks = normalize(join(root, '../learnwell-platform/public/static/scratch-blocks'));
const aliasStaticScratchBlocks = aliasScratchBlocks; // same folder, two route prefixes

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  let pathname = url.pathname;

  // --- Proxy for Judge0 to bypass CORS ---
  if (pathname.startsWith('/api/judge0')) {
    const targetUrl = new URL(JUDGE0_TARGET);
    const proxyPath = pathname.replace('/api/judge0', '') + url.search;
    
    const headers = { ...req.headers };
    delete headers.host;
    if (['GET', 'HEAD'].includes(req.method)) delete headers['content-length'];

    const client = targetUrl.protocol === 'https:' ? https : http;

    const proxyReq = client.request({
      protocol: targetUrl.protocol,
      hostname: targetUrl.hostname,
      port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
      path: proxyPath,
      method: req.method,
      headers: {
        ...headers,
        host: targetUrl.hostname,
      }
    }, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error(`[Judge0 Proxy Error] ${err.message}`);
      res.statusCode = 502;
      res.end(`Proxy error: ${err.message}`);
    });

    if (['GET', 'HEAD', 'DELETE', 'OPTIONS'].includes(req.method)) {
      proxyReq.end();
    } else {
      req.pipe(proxyReq);
    }
    return;
  }

  // --- Proxy for Piston to bypass CORS ---
  if (pathname.startsWith('/api/piston')) {
    const targetUrl = new URL(PISTON_TARGET);
    
    // Convert /api/piston/... to /api/v2/...
    let proxyPath = pathname.replace('/api/piston', '/api/v2');
    
    // Ensure it starts with /api/v2
    if (!proxyPath.startsWith('/api/v2')) {
        proxyPath = '/api/v2' + (proxyPath || '');
    }

    const pistonKey = process.env.PISTON_API_KEY;

    console.log(`[Piston Proxy] ${req.method} ${pathname} -> ${targetUrl.origin}${proxyPath}${url.search}`);

    const headers = { ...req.headers };
    delete headers.host;
    if (['GET', 'HEAD'].includes(req.method)) delete headers['content-length'];

    const client = targetUrl.protocol === 'https:' ? https : http;

    const proxyReq = client.request({
      protocol: targetUrl.protocol,
      hostname: targetUrl.hostname,
      port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
      path: proxyPath + url.search,
      method: req.method,
      headers: {
        ...headers,
        host: targetUrl.hostname,
        ...(pistonKey ? { 'X-API-Key': pistonKey } : {})
      }
    }, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('[Piston Proxy Error]', err.message);
      res.statusCode = 502;
      res.end(`Proxy error: ${err.message}`);
    });

    if (['GET', 'HEAD', 'DELETE', 'OPTIONS'].includes(req.method)) {
      proxyReq.end();
    } else {
      req.pipe(proxyReq);
    }
    return;
  }

  if (pathname === '/' || pathname === '/index.html') {
    pathname = '/preview/index.html';
  }
  let filePath;
  if (pathname.startsWith('/scratch-blocks/')) {
    const rel = pathname.replace('/scratch-blocks/', '');
    filePath = normalize(join(aliasScratchBlocks, rel));
  } else if (pathname.startsWith('/static/scratch-blocks/')) {
    const rel = pathname.replace('/static/scratch-blocks/', '');
    filePath = normalize(join(aliasStaticScratchBlocks, rel));
  } else if (pathname === '/static/blockly-styles.css') {
    filePath = normalize(join(root, '../learnwell-platform/public/static/blockly-styles.css'));
  } else {
    filePath = normalize(join(root, pathname));
    if (!filePath.startsWith(root)) {
      res.statusCode = 403; res.end('Forbidden'); return;
    }
  }
  if (!existsSync(filePath)) {
    res.statusCode = 404; res.end('Not Found'); return;
  }
  const ext = filePath.slice(filePath.lastIndexOf('.'));
  const type = mime[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', type);
  const stream = createReadStream(filePath);
  stream.pipe(res);
});

server.listen(port, () => {
  console.log(`Preview server running at http://localhost:${port}/`);
  console.log(`Proxy for Judge0 active: /api/judge0 -> ${JUDGE0_TARGET}`);
  console.log(`Proxy for Piston active: /api/piston -> ${PISTON_TARGET}`);
});