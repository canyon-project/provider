import {buildPullRequestRequest,fetchPullRequest} from '../dist/index.js'

import { fetchPullRequest } from '@canyonjs/provider';

const data = await fetchPullRequest({
  provider: 'gitlab',
  privateToken: 'YOUR_GITLAB_TOKEN',
  baseUrl: 'https://gitlab.com',
  repoID: 123456, // 或 'group%2Fproject'（已在内部做 URL 编码）
  pullID: 789
});
// data 为 MR/PR 的响应 JSON（GitLab/GitHub/Gitea/Bitbucket）