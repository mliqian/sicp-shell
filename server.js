const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { sendFile, fetchHTML } = require("./utils");

const hostname = "127.0.0.1";
const port = 3100;

const baseUrl =
  "https://mitpress.mit.edu/sites/default/files/sicp/full-text/book";
const homeUrl = `/book-Z-H-4.html`;

const server = http.createServer((req, res) => {
  let url = req.url;
  if (url === "/") {
    url = homeUrl;
  }
  if (url === "/style.css") {
    fs.readFile(path.resolve(__dirname, "style.css"), "utf8", (err, data) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/css");
      res.end(data);
    });
    return;
  }

  if (url.startsWith("/book")) {
    let cacheKey = url.slice(1, url.indexOf("."));
    let filePath = path.resolve(__dirname, `cache/${cacheKey}`);
    sendFile(filePath, res, "text/html").catch(e => {
      fetchHTML(baseUrl + url, res).then(data => {
        fs.writeFile(filePath, data, () => {
          console.log("New file: ", filePath);
        });
      });
    });
    return;
  }
  res.statusCode = 404;
  res.end("Not Found");
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
