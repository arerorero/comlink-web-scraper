const fs = require("fs");

var reJson;

fs.readFile("json.json", "utf8", (err, data) => {
  if (err) {
    console.error("error: ", err);
  } else {
    reJson = data[0][0];
    reJson += data[0][1];
    reJson += data[0][2];
    fs.writeFile("jsonLimpo.json", reJson, "utf8", (err) => {
      if (err) {
        console.error("error: ", err);
      } else {
        console.log(`arquivo jsonLimpo criado`);
      }
    });
  }
});
