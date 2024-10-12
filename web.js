const axios = require('axios');
const fs = require('fs');

// 替换为你的 GitHub 用户名
const username = 'gosunny2050';
const perPage = 100; // 每页最多返回 100 个仓库
let allRepos = [];   // 存储所有仓库

// 获取用户所有公开仓库，处理分页
async function fetchRepos(page = 1) {
  try {
    const response = await axios.get(`https://api.github.com/users/${username}/repos`, {
      params: {
        per_page: perPage, // 每页的仓库数量
        page: page        // 当前页码
      }
    });

    const repos = response.data;
    allRepos = allRepos.concat(repos); // 将当前页的仓库加入到数组中

    // 如果当前页仓库数量等于每页返回最大数量，可能有下一页，递归获取下一页
    if (repos.length === perPage) {
      await fetchRepos(page + 1);
    } else {
      checkGhPagesBranches();
    }

  } catch (error) {
    console.error('Error fetching repositories:', error);
  }
}

// 检查每个仓库是否有 gh-pages 分支
async function checkGhPagesBranches() {
  const reposWithGhPages = [];

  for (const repo of allRepos) {
    try {
      // 获取仓库的分支列表
      const branchesResponse = await axios.get(`https://api.github.com/repos/${username}/${repo.name}/branches`);
      const branches = branchesResponse.data.map(branch => branch.name);

      // 如果有 gh-pages 分支，保存该仓库信息
      if (branches.includes('gh-pages')) {
        const repoInfo = {
          name: repo.name,
          description: repo.description || 'No description',
          url: `https://${username}.github.io/${repo.name}/`
        };
        reposWithGhPages.push(repoInfo);
      }

    } catch (error) {
      console.error(`Error fetching branches for ${repo.name}:`, error);
    }
  }

  // 生成 HTML 页面
  generateHTML(reposWithGhPages);
}

// 生成 HTML 并保存到文件
function generateHTML(reposWithGhPages) {
  let htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>GitHub Pages of ${username}</title>
    </head>
    <body>
      <h1>GitHub Pages of ${username}</h1>
      <ul>
  `;

  reposWithGhPages.forEach(repo => {
    htmlContent += `
      <li>
        <a href="${repo.url}" target="_blank">${repo.name}</a>
        - ${repo.description}
      </li>
    `;
  });

  htmlContent += `
      </ul>
    </body>
    </html>
  `;

  // 将 HTML 内容写入 index.html 文件
  fs.writeFileSync('web.html', htmlContent);
  console.log('gh-pages-index.html has been generated with', reposWithGhPages.length, 'repositories.');
}

// 开始获取仓库数据
fetchRepos();

