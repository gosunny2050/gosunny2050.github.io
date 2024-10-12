const axios = require('axios');
const fs = require('fs');

// 替换为你的 GitHub 用户名
const username = 'gosunny2050';

// 获取用户的所有公开仓库
axios.get(`https://api.github.com/users/${username}/repos`)
  .then(response => {
    const repos = response.data;
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GitHub Repositories</title>
      </head>
      <body>
        <h1>Repositories of ${username}</h1>
        <ul>
    `;

    repos.forEach(repo => {
      htmlContent += `
        <li>
          <a href="${repo.html_url}" target="_blank">${repo.name}</a>
          - ${repo.description ? repo.description : 'No description'}
        </li>
      `;
    });

    htmlContent += `
        </ul>
      </body>
      </html>
    `;

    // 将 HTML 内容写入 index.html 文件
    fs.writeFileSync('index.html', htmlContent);
    console.log('index.html has been generated.');
  })
  .catch(error => {
    console.error('Error fetching repositories:', error);
  });

