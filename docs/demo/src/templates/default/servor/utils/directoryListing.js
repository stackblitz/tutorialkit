const fs = require('fs');
const path = require('path');

module.exports = (uri) => {
  const dir = (name) => fs.statSync(path.join(uri, name)).isDirectory();
  const size = (name) => fs.statSync(path.join(uri, name)).size;

  const link = (name) =>
    dir(name)
      ? `
        <div>
          <span>🗂</span>
          <a href=${`${name}/`}>${name}</a>
          <small>${size(name)}B</small>
        </div>
      `
      : `
        <div>
          <span>📄</span>
          <a href=${name}>${name}</a>
          <small>${size(name)}B</small>
        </div>
      `;

  return `
    <html>
      <head>
        <style>
          html {
            font-size: calc(12px + 1vw);
          }
          body {
            display:flex;
            flex-direction:column;
            min-height:100vh;
            font-family:sans-serif;
            background:#222;
            margin:0;
          }
          main {
            margin:auto;
            width:100%;
            max-width:30rem;
            padding:6rem 2rem;
            box-sizing:border-box;
          }
          div {
            display:flex;
            align-items:center;
            padding:0.5rem;
          }
          a {
            color:#f2f2f2;
            flex: 1 1 100%;
          }
          small {
            color:#b6b6b6;
          }
          span {
            margin-right: 1rem;
          }
        </style>
      </head>
      <body>
        <main>
          ${fs.readdirSync(uri).map(link).join('')}
        </main>
      </body>
    </html>
  `;
};
