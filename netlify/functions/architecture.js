// Netlify Function：代理 GitHub Contents API，把 token 藏在服务端
// GET  /.netlify/functions/architecture        → 读取 architecture.json
// PUT  /.netlify/functions/architecture        → 覆盖写入（body: { nodes, edges, positions, sha }）

const GH_TOKEN = process.env.GITHUB_TOKEN;
const GH_OWNER = process.env.GITHUB_OWNER;
const GH_REPO  = process.env.GITHUB_REPO;
const GH_PATH  = process.env.GITHUB_FILE_PATH || 'ea-architect/architecture.json';
const GH_API   = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${GH_PATH}`;

const GH_HEADERS = {
  Authorization: `Bearer ${GH_TOKEN}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS };
  }

  try {
    if (event.httpMethod === 'GET') {
      const res = await fetch(GH_API, { headers: GH_HEADERS });
      if (res.status === 404) {
        return { statusCode: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
          body: JSON.stringify({ nodes: [], edges: [], positions: {}, sha: null }) };
      }
      if (!res.ok) throw new Error(`GitHub GET ${res.status}`);
      const json = await res.json();
      const data = JSON.parse(Buffer.from(json.content, 'base64').toString('utf-8'));
      data.sha = json.sha;
      if (!data.positions) data.positions = {};
      return { statusCode: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
        body: JSON.stringify(data) };
    }

    if (event.httpMethod === 'PUT') {
      const { nodes, edges, positions, sha } = JSON.parse(event.body);
      if (!Array.isArray(nodes) || !Array.isArray(edges)) {
        return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid body' }) };
      }
      const content = Buffer.from(JSON.stringify(
        { nodes, edges, positions: positions || {} }, null, 2
      )).toString('base64');
      const body = { message: 'Update architecture data', content };
      if (sha) body.sha = sha;

      let res = await fetch(GH_API, {
        method: 'PUT',
        headers: { ...GH_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.status === 409) {
        const latest = await fetch(GH_API, { headers: GH_HEADERS });
        const latestJson = await latest.json();
        body.sha = latestJson.sha;
        res = await fetch(GH_API, {
          method: 'PUT',
          headers: { ...GH_HEADERS, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) throw new Error(`GitHub PUT ${res.status}: ${await res.text()}`);
      const result = await res.json();
      return { statusCode: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: true, sha: result.content.sha }) };
    }

    return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) };
  }
};
