const fs = require("fs/promises");

async function main() {
  const data = await fs.readFile("json.json", "utf8");
  const jsonData = JSON.parse(data);
  const jsonString = JSON.stringify(jsonData[0], null, 2);
  fs.writeFile("json.txt", jsonString);
}

main();
