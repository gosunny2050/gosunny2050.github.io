const axios = require('axios');
const fs = require('fs');

const username = 'gosunny2050';
const perPage = 100; // GitHub API 每页最多返回 100 个仓库

// 获取所有仓库
async function fetchAllRepos() {
  let allRepos = [];
  let page = 1;
  let hasMore = true;

  try {
    while (hasMore) {
      const response = await axios.get(`https://api.github.com/users/${username}/repos`, {
        params: { per_page: perPage, page: page },
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });

      if (response.data.length > 0) {
        allRepos = allRepos.concat(response.data);
        page++;
      } else {
        hasMore = false;
      }
    }
  } catch (error) {
    console.error('Error fetching repositories:', error);
  }
  return allRepos
  .filter(repo => repo.name !== 'gosunny2050.github.io')
  .sort((a, b) => {
    // 定义优先显示的仓库名称列表
    const priorityNames = ['misc', 'image-processing', 'predict_function', 'fast-api-track', 'sisyphus', 'GitHubDaily', 'Chat2DB', 'backgroundremover'];
    const aIsPriority = priorityNames.includes(a.name);
    const bIsPriority = priorityNames.includes(b.name);

    // 如果两者都是优先项，按列表中的顺序排序
    if (aIsPriority && bIsPriority) {
      return priorityNames.indexOf(a.name) - priorityNames.indexOf(b.name);
    }
    // 如果只有一个是优先项，优先显示
    if (aIsPriority) return -1;
    if (bIsPriority) return 1;

    // 非优先项按时间排序
    return new Date(b.pushed_at) - new Date(a.pushed_at);
  });
}

// 生成 HTML 文件
function generateHTML(repos) {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>GitHub Repositories</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 20px;
        }
        h1 {
          color: #333;
          text-align: center;
        }
        ul {
          list-style-type: none;
          padding: 0;
        }
        li {
          background-color: #fff;
          margin: 10px 0;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease-in-out;
        }
        li:hover {
          transform: translateY(-5px);
        }
        a {
          text-decoration: none;
          color: #0366d6;
          font-weight: bold;
        }
        a:hover {
          text-decoration: underline;
        }
        .description {
          font-size: 0.9em;
          color: #555;
        }
        .repo-list {
          max-width: 800px;
          margin: 0 auto;
        }
      </style>
    </head>
    <body>
      <h1>Repositories of ${username}</h1>
      <ul class="repo-list">
        ${repos.map(repo => `
          <li>
            <a href="${repo.html_url}" target="_blank">${repo.name}</a>
            <p class="description">${repo.description ? repo.description : 'No description available'}</p>
          </li>
        `).join('')}
      </ul>
    </body>
    </html>
  `;

  fs.writeFileSync('index.html', htmlContent);
  console.log(`index.html has been generated with ${repos.length} repositories.`);
}

// 执行主逻辑
(async () => {
  const repositories = await fetchAllRepos();
  generateHTML(repositories);
})();
