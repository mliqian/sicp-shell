const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const hostname = "127.0.0.1";
const port = 3000;

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
    https.get(baseUrl + url, resp => {
      let data = "";
      resp.on("data", chunk => {
        data += chunk;
      });

      resp.on("end", () => {
        const styleTag = `<link rel="stylesheet" type="text/css" href="style.css">`;
        const styleIndex = data.indexOf("</head>");
        if (styleIndex !== -1) {
          data = `${data.slice(0, styleIndex)}${styleTag}${data.slice(
            styleIndex
          )}`;
        }

        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        res.end(data);
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
