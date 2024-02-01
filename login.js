module.exports.login = async function login(page) {
  await page.click("a.showModal.login");

  await page.type('input[name="txtCodigo"]', "6316617");
  await page.type('input[name="txtUsuario"]', "wilson.sartori");
  await page.type('input[name="txtSenha"]', "CIARAMA2022");

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
