const fs = require("fs");

module.exports.login = async function login(page) {
  let login = fs.readFileSync("login.json", "utf8");
  login = await JSON.parse(login);

  await page.click("a.showModal.login");

  await page.type('input[name="txtCodigo"]', login.code);
  await page.type('input[name="txtUsuario"]', login.login);
  await page.type('input[name="txtSenha"]', login.password);

  await page.evaluate(() => {
    const buttons = document.querySelectorAll('input[type="submit"]');
    for (const button of buttons) {
      if (button.value === "Login") {
        button.click();
      }
    }
  });

  await new Promise((r) => setTimeout(r, 2000));
};
