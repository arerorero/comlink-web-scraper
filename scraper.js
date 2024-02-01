const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const { login } = require("./login");

const fs = require("fs");

const url = "http://comlink.com.br";

// async function login(page) {
//   await page.click("a.showModal.login");

//   await page.type('input[name="txtCodigo"]', "6316617");
//   await page.type('input[name="txtUsuario"]', "wilson.sartori");
//   await page.type('input[name="txtSenha"]', "CIARAMA2022");

//   await page.evaluate(() => {
//     const buttons = document.querySelectorAll('input[type="submit"]');
//     for (const button of buttons) {
//       if (button.value === "Login") {
//         button.click();
//       }
//     }
//   });

//   await new Promise((r) => setTimeout(r, 2000));
// }

async function collect1(page) {
  const data = await page.evaluate(() => {
    const table = document.querySelector(
      "table.table.table-striped.table-hover"
    );
    const rows = table.querySelectorAll("tbody tr");

    const result = [];

    rows.forEach((row) => {
      const columns = row.querySelectorAll("td");
      const rowData = {};

      columns.forEach((column, index) => {
        if (index == 0) {
          rowData[`Pedido`] = column.textContent.trim();
        } else if (index == 5) {
          rowData[`Itens`] = column.textContent.trim();
        } else if (index == 6) {
          rowData[`Publicacao`] = column.textContent.trim();
        } else if (index == 7) {
          rowData[`Prazo Entrega`] = column.textContent.trim();
        }
      });

      result.push(rowData);
    });

    return result;
  });

  return data;
}

async function collect2(tabela, page) {
  jsonFinal = [];
  for (var linha of tabela) {
    var Pedido = linha.Pedido;
    await page.evaluate((text) => {
      const elements = Array.from(document.querySelectorAll("a.ng-binding"));
      const elementToClick = elements.find(
        (element) => element.textContent.trim() === text
      );

      if (elementToClick) {
        elementToClick.click();
      } else {
        console.error(`Elemento com texto "${text}" n�o encontrado.`);
      }
    }, Pedido);

    await new Promise((r) => setTimeout(r, 2500));

    linha.codigo_pedido = await page.evaluate(() => {
      var elementos = document.querySelectorAll(
        "p.form-control-static.ng-binding"
      );
      return elementos[23].textContent.trim();
    });

    codigo = linha.codigo_pedido.split(":");
    var dados = await page.evaluate(() => {
      const titulos = Array.from(
        document.querySelectorAll("h3.panel-title.ng-binding")
      );
      const linhas = Array.from(
        document.querySelectorAll(
          "table.table-bordered.table-striped.table-hover tbody tr"
        )
      );
      return linhas.map((linha, index) => {
        const colunas = Array.from(linha.querySelectorAll("td, th"));
        var code = titulos[index].textContent.trim().split("-");
        code = code[1].split(":");
        code = code[1];
        return {
          Codigo: code.trim(),
          Unidade: colunas[0].textContent.trim(),
          Prazo: colunas[1].textContent.trim(),
          Quantidade: colunas[2].textContent.trim(),
          ValorUnitario: colunas[3].textContent.trim(),
          Desconto: colunas[4].textContent.trim(),
          ICMS: colunas[5].textContent.trim(),
          IPI: colunas[6].textContent.trim(),
          ValorTotal: colunas[7].textContent.trim(),
        };
      });
    });

    linha.cotacao = await collect3(codigo[2].trim(), page);

    linha.itens = dados;

    jsonFinal.push(linha);

    await new Promise((r) => setTimeout(r, 3000));

    await page.evaluate(() => {
      const elementos = document.querySelectorAll(
        "a.navbar-left-link.ng-binding"
      );
      elementos[3].click();
      new Promise((r) => setTimeout(r, 500));
    });
    await new Promise((r) => setTimeout(r, 2000));
  }
  return jsonFinal;
}

async function collect3(code, page) {
  await page.evaluate(() => {
    const elementos = document.querySelectorAll(
      "a.navbar-left-link.ng-binding"
    );
    elementos[1].click();
  });
  await new Promise((r) => setTimeout(r, 500));

  await page.evaluate(() => {
    const elementos = document.querySelectorAll(
      "a.navbar-filho-link.ng-binding"
    );
    elementos[0].click();
  });
  await new Promise((r) => setTimeout(r, 500));

  await page.evaluate(() => {
    const botao = document.querySelector(
      "button.btn.btn-default.botao-filtro-responsivo.ng-binding"
    );
    botao.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  await page.$eval(
    'input[ng-model="frn_cot.mdl.buscarCotacao.cotCliNum"]',
    (input) => (input.value = "")
  );

  await page.type(
    'input[ng-model="frn_cot.mdl.buscarCotacao.cotCliNum"]',
    code
  ); // Escreve o Filtro

  await page.evaluate(() => {
    // Aplica o Filtro
    const botao = document.querySelector("button.btn.btn-success.ng-binding");
    if (botao) {
      botao.click();
    } else {
      console.error("Bot�o n�o encontrado.");
    }
  });

  await new Promise((r) => setTimeout(r, 2000));

  const divVigentes = await page.$("#vigentes");

  if (divVigentes) {
    const divBuscaNaoRetornouResultados = await divVigentes.$(
      ".alert.alert-info.ng-binding.ng-scope"
    );

    if (divBuscaNaoRetornouResultados) {
      // Buscar em ENCERRADAS
      await page.waitForSelector(".nav-tabs li:nth-child(2) a");
      await page.click(".nav-tabs li:nth-child(2) a");
      await new Promise((r) => setTimeout(r, 2000));

      await page.$eval(
        'input[ng-model="frn_cot.mdl.buscarCotacao.cotCliNum"]',
        (input) => (input.value = "")
      );
      await page.type(
        'input[ng-model="frn_cot.mdl.buscarCotacao.cotCliNum"]',
        code
      ); // Escreve o Filtro

      await page.evaluate(() => {
        // Aplica o Filtro
        const botao = document.querySelector(
          "button.btn.btn-success.ng-binding"
        );
        if (botao) {
          botao.click();
        } else {
          console.error("Bot�o n�o encontrado.");
        }
      });

      await new Promise((r) => setTimeout(r, 2000));

      const itens = await collect4(page);
      dados = await page.evaluate((itens) => {
        const linhas = Array.from(
          document.querySelectorAll(
            "table.table-hover.table-striped.ng-scope tbody tr"
          )
        );
        return linhas.map((linha) => {
          const colunas = Array.from(linha.querySelectorAll("td"));
          return {
            Indicado: colunas[3].textContent.trim(),
            Cliente: colunas[4].textContent.trim(),
            Publicacao: colunas[6].textContent.trim(),
            Vencimento: colunas[7].textContent.trim(),
            // Itens: itens,
          };
        });
      }, itens);
    } else {
      // Coletar dados em Vigentes
      const itens = await collect4(page);
      dados = await page.evaluate((itens) => {
        const linhas = Array.from(
          document.querySelectorAll(
            "table.table-hover.table-striped.ng-scope tbody tr"
          )
        );
        return linhas.map((linha) => {
          const colunas = Array.from(linha.querySelectorAll("td"));
          return {
            Indicado: colunas[3].textContent.trim(),
            Cliente: colunas[4].textContent.trim(),
            Publicacao: colunas[6].textContent.trim(),
            Vencimento: colunas[7].textContent.trim(),
            Itens: itens,
          };
        });
      }, itens);
    }
  } else {
    console.log("Div Vigentes Não Encontrada");
  }
  dados = dados[0];
  await new Promise((r) => setTimeout(r, 2000));

  // ############################
  // Retornar a Pagina de Pedidos
  await page.evaluate(() => {
    const elementos = document.querySelectorAll(
      "a.navbar-left-link.ng-binding"
    );
    elementos[3].click();
    new Promise((r) => setTimeout(r, 500));
  });
  await new Promise((r) => setTimeout(r, 2000));

  return dados;
}

async function collect4(page) {
  await page.evaluate(() => {
    const botao = document.querySelector(
      "span.label.label-qtd-itens.ng-binding"
    );
    botao.click();
  });
  await new Promise((r) => setTimeout(r, 2000));

  const dados = await page.evaluate(() => {
    const rowData = [];

    const linhas = Array.from(
      document.querySelectorAll(
        "table.table.table-condensed.table-hover.table-striped tbody tr"
      )
    );

    return linhas.map((linha) => {
      const colunas = Array.from(linha.querySelectorAll("td"));

      var final = "";

      colunas.forEach((coluna, index) => {
        if (index % 2 == 1) {
          coluna.textContent.split("-").forEach((palavra) => {
            if (palavra != coluna.textContent.split("-")[0]) {
              if (final == "") {
                final = palavra;
              } else {
                final = final + " - " + palavra;
              }
            }
          });
          var item = `${coluna.textContent.split("-")[0].trim()}: ${final}`;
          rowData.push(item);
        }
      });
      return rowData;
    });
  });

  return dados[0];
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--start-maximized"],
  });
  const page = await browser.newPage();

  await page.goto(url);

  login(page);

  // aqui vc est� logado

  await new Promise((r) => setTimeout(r, 2000));

  await page.goto("https://comlink.com.br/b2b/fornecedor/pedidos");

  await new Promise((r) => setTimeout(r, 1000));
  await page.evaluate(() => {
    const botao = document.querySelector(
      "button.btn.btn-default.botao-filtro-responsivo.ng-binding"
    );
    botao.click();
  });

  await new Promise((r) => setTimeout(r, 500));
  await page.evaluate(() => {
    const elemento = document.querySelector(
      'a.filtro-item-link.ng-binding.ng-isolate-scope[filtro-item="status"]'
    );
    if (elemento) {
      elemento.click();
    } else {
      console.error("Elemento n�o encontrado");
    }
  });

  await page.evaluate(() => {
    const elementos = document.querySelectorAll("i.checkbox-custom-i");
    elementos[3].click();
    new Promise((r) => setTimeout(r, 500));
  });
  await page.evaluate(() => {
    const elementos = document.querySelectorAll("i.checkbox-custom-i");
    elementos[4].click();
    new Promise((r) => setTimeout(r, 500));
  });

  await page.evaluate(() => {
    const botao = document.querySelector("button.btn.btn-success.ng-binding");
    if (botao) {
      botao.click();
    } else {
      console.error("Bot�o n�o encontrado.");
    }
  });

  await new Promise((r) => setTimeout(r, 500));

  await page.evaluate(() => {
    const botao = document.querySelector(
      "button.btn.btn-default.botao-filtro-responsivo.ng-binding"
    );
    botao.click();
  });

  await new Promise((r) => setTimeout(r, 500));

  json = [];
  var collect = await collect1(page);
  console.log(collect);
  json.push(await collect2(collect, page));
  for (x = 2; x != 4; x++) {
    await new Promise((r) => setTimeout(r, 3000));
    await page.evaluate((text) => {
      const elements = Array.from(document.querySelectorAll("a.ng-binding"));
      const elementToClick = elements.find(
        (element) => element.textContent.trim() === text
      );

      if (elementToClick) {
        elementToClick.click();
      } else {
        console.error(`Elemento com texto "${text}" n�o encontrado.`);
      }
    }, x);
    collect = await collect1(page);
    json.push(await collect2(collect, page));
  }

  console.log(json);
  const nomeDoArquivo = "json.json";
  const caminhoDoArquivo = `./${nomeDoArquivo}`;
  const jsonString = JSON.stringify(json, null, 2);

  fs.writeFile(caminhoDoArquivo, jsonString, "utf8", (err) => {
    if (err) {
      console.error("error: ", err);
    } else {
      console.log(`arquivo ${nomeDoArquivo} criado`);
    }
  });

  await browser.close();
})();
