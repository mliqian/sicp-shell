const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const hostname = "127.0.0.1";
const port = 3100;

const baseUrl =
  "https://mitpress.mit.edu/sites/default/files/sicp/full-text/book";
const homeUrl = `/book-Z-H-4.html`;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  let url = req.url;
  if (url === "/") {
    url = homeUrl;
  }
  if (url === "/style.css") {
    fs.readFile(path.resolve(__dirname, "style.css"), "utf8", (err, data) => {
      res.setHeader("Content-Type", "text/css");
      res.end(data);
    });
    return;
  }

  // Prepare cache file
  let cacheFileName = url.slice(1);
  let cacheDirName = url.slice(url.indexOf(".") + 1); // html/gif...
  let cacheDirPath = path.resolve(__dirname, `cache/${cacheDirName}`);
  if (!fs.existsSync(cacheDirPath)) {
    fs.mkdirSync(cacheDirPath);
  }
  let cachePath = path.resolve(cacheDirPath, cacheFileName);
  //////////

  fs.readFile(cachePath, (err, data) => {
    let contentType = getContentTypeByUrl(url);
    res.setHeader("Content-Type", contentType);
    if (!err) {
      // Serve from cache
      res.write(data);
      res.end();
    } else {
      // No cache. Fetch from source
      https
        .get(baseUrl + url, resp => {
          resp.on("data", data => {
            if (contentType === "text/html") {
              let content = data.toString();
              let styleIndex = data.indexOf("</head>");
              if (styleIndex !== -1) {
                let styleTag = `<link rel="stylesheet" type="text/css" href="style.css">`;
                let part1 = content.slice(0, styleIndex);
                let part2 = content.slice(styleIndex);
                content = `${part1}${styleTag}${part2}`;
                data = Buffer.from(content, "utf8");
              }
            }
            res.write(data);
            fs.writeFile(cachePath, data, { flag: "a" }, e => {
              if (e) console.log(e);
            });
          });
          resp.on("end", () => res.end());
        })
        .on("error", e => {});
    }
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

function getContentTypeByUrl(url) {
  switch (url.slice(url.lastIndexOf("."))) {
    case ".html":
      return "text/html";
    case ".gif":
      return "image/gif";
    case ".css":
      return "text/css";
    default:
      return "text/plain";
  }
}
