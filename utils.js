const https = require("https");
const fs = require("fs");

function sendResponse(response, contentType, data) {
  response.statusCode = 200;
  response.setHeader("Content-Type", contentType);
  response.end(data);
}

function sendFile(filepath, response, contentType) {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, "utf8", (err, data) => {
      if (!err) {
        sendResponse(response, contentType, data);
        resolve(data);
      } else {
        reject(err);
      }
    });
  });
}

function fetchHTML(url, response) {
  return new Promise((resolve, reject) => {
    https.get(url, resp => {
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
        sendResponse(response, "text/html", data);
        resolve(data);
      });
    });
  });
}

module.exports = {
  sendFile,
  fetchHTML
};
