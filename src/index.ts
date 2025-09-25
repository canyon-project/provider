export const squared = (n: number): number => n * n;

export type SupportedProvider = 'github' | 'gitlab' | 'gitea' | 'bitbucket';

export interface ProviderCommonParams {
  provider: SupportedProvider | string;
  privateToken: string;
  baseUrl: string;
}

export interface PullBusinessParams {
  repoID: string | number;
  pullID: string | number;
}

export interface RequestConfig {
  url: string;
  method: 'GET';
  headers: Record<string, string>;
}

function trimTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function getAuthHeaders(provider: string, token: string): Record<string, string> {
  switch (provider.toLowerCase()) {
    case 'github':
    case 'gitea':
      return { Authorization: `token ${token}` };
    case 'gitlab':
      return { 'PRIVATE-TOKEN': token };
    case 'bitbucket':
      return { Authorization: `Bearer ${token}` };
    default:
      return { Authorization: `Bearer ${token}` };
  }
}

function buildEndpoint(provider: string, baseUrl: string, repoID: string | number, pullID: string | number): string {
  const root = trimTrailingSlash(baseUrl);
  const repo = String(repoID);
  const pull = String(pullID);
  switch (provider.toLowerCase()) {
    case 'github':
      return `${root}/repos/${repo}/pulls/${pull}`;
    case 'gitlab':
      return `${root}/api/v4/projects/${encodeURIComponent(repo)}/merge_requests/${pull}`;
    case 'gitea':
      return `${root}/api/v1/repos/${repo}/pulls/${pull}`;
    case 'bitbucket':
      return `${root}/2.0/repositories/${repo}/pullrequests/${pull}`;
    default:
      return `${root}/repos/${repo}/pulls/${pull}`;
  }
}

export function buildPullRequestRequest(
  params: ProviderCommonParams & PullBusinessParams,
): RequestConfig {
  const { provider, privateToken, baseUrl, repoID, pullID } = params;
  const url = buildEndpoint(provider, baseUrl, repoID, pullID);
  const headers = getAuthHeaders(provider, privateToken);
  return { url, method: 'GET', headers };
}

export interface FetchInitOptions {
  signal?: AbortSignal;
}

export async function fetchPullRequest(
  params: ProviderCommonParams & PullBusinessParams,
  init?: FetchInitOptions,
): Promise<unknown> {
  const request = buildPullRequestRequest(params);
  const response = await fetch(request.url, {
    method: request.method,
    headers: request.headers,
    signal: init?.signal,
  });

  if (!response.ok) {
    let body = '';
    try {
      body = await response.text();
    } catch {}
    throw new Error(`Request failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ''}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}
