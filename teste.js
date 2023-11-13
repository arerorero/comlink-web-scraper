const jsonFinal = [];

// Algum conte�do j� existente no jsonFinal, por exemplo:
jsonFinal.push({ nome: 'Antonio', idade: 30, cidade: 'Rio de Janeiro' });

// Se voc� estiver em um loop e quiser adicionar novas linhas ao jsonFinal:
for (let i = 0; i < 5; i++) {
  const novaLinha = { nome: `Pessoa ${i}`, idade: 25 + i, cidade: 'S�o Paulo' };
  jsonFinal.push(novaLinha);
}

// Agora, jsonFinal cont�m o conte�do existente e as novas linhas adicionadas no loop.
console.log('JSON Final:', jsonFinal);
