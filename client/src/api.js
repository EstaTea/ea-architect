const ENDPOINT = '/.netlify/functions/architecture';

export async function fetchArchitecture() {
  const res = await fetch(ENDPOINT);
  if (!res.ok) throw new Error('Failed to fetch architecture data');
  return res.json(); // { nodes, edges, sha }
}

export async function saveArchitecture(nodes, edges, sha) {
  const res = await fetch(ENDPOINT, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodes, edges, sha }),
  });
  if (!res.ok) throw new Error('Failed to save architecture data');
  return res.json(); // { ok, sha }
}
