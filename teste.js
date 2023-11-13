const jsonFinal = [];

// Algum conteúdo já existente no jsonFinal, por exemplo:
jsonFinal.push({ nome: 'Antonio', idade: 30, cidade: 'Rio de Janeiro' });

// Se você estiver em um loop e quiser adicionar novas linhas ao jsonFinal:
for (let i = 0; i < 5; i++) {
  const novaLinha = { nome: `Pessoa ${i}`, idade: 25 + i, cidade: 'São Paulo' };
  jsonFinal.push(novaLinha);
}

// Agora, jsonFinal contém o conteúdo existente e as novas linhas adicionadas no loop.
console.log('JSON Final:', jsonFinal);
