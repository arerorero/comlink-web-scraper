const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer')

const url = 'http://comlink.com.br';

async function login(page) {

    await page.click('a.showModal.login');

    await page.type('input[name="txtCodigo"]', '6316617');
    await page.type('input[name="txtUsuario"]', 'wilson.sartori');
    await page.type('input[name="txtSenha"]', 'CIARAMA2022');

    await page.evaluate(() => {
        const buttons = document.querySelectorAll('input[type="submit"]');
        for (const button of buttons) {
            if (button.value === 'Login') {
                button.click();
            }
        }
    });

    await new Promise(r => setTimeout(r, 2000));
}

async function collect(page) {
    const data = await page.evaluate(() => {
        const table = document.querySelector('table.table.table-striped.table-hover');
        const rows = table.querySelectorAll('tbody tr');

        const result = [];

        rows.forEach(row => {
            const columns = row.querySelectorAll('td');
            const rowData = {};

            columns.forEach((column, index) => {
                rowData[`column_${index}`] = column.textContent.trim();
            });

            result.push(rowData);
        });

        return result;
    });

    return data;
}

async function collect2(tabela, page) {
    for (const linha of tabela) {
        var column_0 = linha.column_0;
        await page.evaluate((text) => {
            const elements = Array.from(document.querySelectorAll('a.ng-binding'));
            const elementToClick = elements.find(element => element.textContent.trim() === text);

            if (elementToClick) {
                elementToClick.click();
            } else {
                console.error(`Elemento com texto "${text}" não encontrado.`);
            }
        }, column_0);

        await new Promise(r => setTimeout(r, 1000));

        linha.column_11 = await page.evaluate(() => {
            var elementos = document.querySelectorAll('p.form-control-static.ng-binding');
            return elementos[23].textContent.trim();
        });
        const dados = await page.evaluate(() => {
            const titulos = Array.from(document.querySelectorAll('h3.panel-title.ng-binding'));
            const linhas = Array.from(document.querySelectorAll('table.table-bordered.table-striped.table-hover tbody tr'));
            return linhas.map((linha, index) => {
                const colunas = Array.from(linha.querySelectorAll('td, th'));
                var code = titulos[index].textContent.trim().split('-');
                code = code[1].split(':');
                code = code[1];
                return {
                    'Codigo': code,
                    'Unidade': colunas[0].textContent.trim(),
                    'Prazo': colunas[1].textContent.trim(),
                    'Quantidade': colunas[2].textContent.trim(),
                    'ValorUnitario': colunas[3].textContent.trim(),
                    'Desconto': colunas[4].textContent.trim(),
                    'ICMS': colunas[5].textContent.trim(),
                    'IPI': colunas[6].textContent.trim(),
                    'ValorTotal': colunas[7].textContent.trim(),
                };
            });
        });
        console.log(linha.column_11,dados);
        await new Promise(r => setTimeout(r, 3000));
        await page.goto('https://comlink.com.br/b2b/fornecedor/pedidos');
        await new Promise(r => setTimeout(r, 2000));

    }
}


(async () => {
    const browser = await puppeteer.launch({ headless: false, args: ['--start-maximized'] });
    const page = await browser.newPage();

    await page.goto(url);

    login(page);

    // aqui vc está logado

    await new Promise(r => setTimeout(r, 2000));

    await page.goto('https://comlink.com.br/b2b/fornecedor/pedidos');

    await new Promise(r => setTimeout(r, 1000));
    await page.evaluate(() => {
        const botao = document.querySelector('button.btn.btn-default.botao-filtro-responsivo.ng-binding');
        botao.click();
    });

    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
        const elemento = document.querySelector('a.filtro-item-link.ng-binding.ng-isolate-scope[filtro-item="status"]');
        if (elemento) {
            elemento.click();
        } else {
            console.error('Elemento não encontrado');
        }
    });

    await page.evaluate(() => {
        const elementos = document.querySelectorAll('i.checkbox-custom-i');
        elementos[3].click();
        new Promise(r => setTimeout(r, 500));
    });
    await page.evaluate(() => {
        const elementos = document.querySelectorAll('i.checkbox-custom-i');
        elementos[4].click();
        new Promise(r => setTimeout(r, 500));
    });

    await page.evaluate(() => {
        const botao = document.querySelector('button.btn.btn-success.ng-binding');
        if (botao) {
            botao.click();
        } else {
            console.error('Botão não encontrado.');
        }
    });

    await new Promise(r => setTimeout(r, 500));

    await page.evaluate(() => {
        const botao = document.querySelector('button.btn.btn-default.botao-filtro-responsivo.ng-binding');
        botao.click();
    });

    await new Promise(r => setTimeout(r, 500));


    COLLECT = await collect(page);

    // console.log(COLLECT.length)
    // for (var x in COLLECT) {
    //     console.log(COLLECT[x].column_0)
    // }

    collect2(COLLECT, page);


    //   await browser.close();
})();


// axios.get(url)
//   .then(response => {
//     const $ = cheerio.load(response.data);
//     const titles = [];

//     $('').each((index, element) => {
//       titles.push($(element).text());
//     });

//     console.log(titles);
//   })
//   .catch(error => {
//     console.error(error);
//   });






