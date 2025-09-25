// ==============================
// ELEMENTOS DO DOM
// ==============================
const form = document.getElementById("alimento-form");     // cadastro de alimentos
const tableBody = document.getElementById("alimento-table-body"); // tabela de alimentos
const filtroInput = document.getElementById("filtro-alimento");   // Input para filtro por nome

// URLs da API
const API_URL = "http://localhost:8080/api/v1/alimento";         
const DEPOSITO_URL = "http://localhost:8080/api/v1/deposito/1"; 


// ==============================
// FUNÇÃO PARA CARREGAR ALIMENTOS
// ==============================

let gruposAlimentos = {}; 

async function carregarAlimentos() {
  try {
    const response = await fetch(DEPOSITO_URL);
    const deposito = await response.json();
    const alimentos = Array.isArray(deposito.alimentos) ? deposito.alimentos : [];

    // Agrupar por nome
    gruposAlimentos = {};
    alimentos.forEach(a => {
      const nome = a.nome.toLowerCase();
      if (!gruposAlimentos[nome]) gruposAlimentos[nome] = [];
      gruposAlimentos[nome].push(a);
    });

    renderizarTabela(Object.keys(gruposAlimentos));

  } catch (error) {
    console.error("Erro ao carregar alimentos:", error);
    tableBody.innerHTML = "<tr><td colspan='4' style='color:red;'>Erro ao carregar alimentos.</td></tr>";
  }
}

// ==============================
// FUNÇÃO PARA RENDERIZAR TABELA
// ==============================
function renderizarTabela(nomesFiltrados) {
  tableBody.innerHTML = ""; // limpa a tabela

  if (nomesFiltrados.length === 0) {
    tableBody.innerHTML = "<tr><td colspan='4'>Nenhum alimento encontrado.</td></tr>";
    return;
  }

  nomesFiltrados.forEach(nome => {
    const grupo = gruposAlimentos[nome];

    const mainRow = document.createElement("tr");
    mainRow.className = "grupo-resumido";
    mainRow.style.cursor = "pointer";
    mainRow.innerHTML = `
      <td>${grupo[0].nome}</td>
      <td>${grupo[0].tipoDoAlimento}</td>
      <td>${grupo[0].marca}</td>
      <td>${grupo.length}</td>
    `;

    mainRow.addEventListener("click", () => {
      // Remove linhas de detalhes já existentes
      let next = mainRow.nextElementSibling;
      while (next && next.classList.contains("detalhes-grupo")) {
        const tmp = next.nextElementSibling;
        next.remove();
        next = tmp;
      }

      // Se não estava expandido, adiciona detalhes
      if (!mainRow.dataset.expanded) {
        grupo.forEach(alimento => {
          const detailRow = document.createElement("tr");
          detailRow.className = "detalhes-grupo";
          detailRow.innerHTML = `
            <td colspan="1" style="padding-left:2rem;">ID: ${alimento.id}</td>
            <td>${alimento.tipoDoAlimento}</td>
            <td>${alimento.marca}</td>
            <td>Data: ${alimento.dataCriacao}</td>
          `;
          mainRow.after(detailRow);
        });
        mainRow.dataset.expanded = "true";
      } else {
        delete mainRow.dataset.expanded;
      }
    });

    tableBody.appendChild(mainRow);
  });
}

// ==============================
// FILTRO EM TEMPO REAL
// ==============================
filtroInput.addEventListener("input", () => {
  const filtro = filtroInput.value.toLowerCase();
  const nomesFiltrados = Object.keys(gruposAlimentos).filter(nome => nome.includes(filtro));
  renderizarTabela(nomesFiltrados);
});

// ==============================
// CHAMADA INICIAL
// ==============================
carregarAlimentos();

// ==============================
// EVENTO PARA CADASTRAR NOVO ALIMENTO
// ==============================
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // previne envio padrão do formulário

  const alimento = {
    nome: document.getElementById("nome").value,
    tipoDoAlimento: document.getElementById("tipo").value,
    marca: document.getElementById("marca").value
  };

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(alimento)
  });

  form.reset();         // limpa o formulário
  carregarAlimentos();  // atualiza lista de alimentos
});

// Inicializa carregando alimentos ao abrir a página
carregarAlimentos();

// ==============================
// ELEMENTOS DE FAMÍLIAS
// ==============================
const familiaList = document.getElementById("familia-list"); // container das famílias
const formFamilia = document.getElementById("familia-form"); // formulário de cadastro
const FAMILIA_URL = "http://localhost:8080/api/v1/familia"; // endpoint das famílias

// ==============================
// FUNÇÃO PARA CARREGAR FAMÍLIAS
// ==============================
async function carregarFamilias() {
  try {
    const response = await fetch(FAMILIA_URL);
    const familias = await response.json();

    // Limpa a lista antes de atualizar
    familiaList.innerHTML = '<h2 id="familias-title" style="grid-column:1/-1;margin-bottom:12px">Lista de Famílias</h2>';

    // Cria card para cada família
    familias.forEach(familia => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${familia.nome}</h3>
        <p><strong>Responsável:</strong> ${familia.responsavel}</p>
        <p><strong>Endereço:</strong> ${familia.endereco}</p>
        <p><strong>Telefone:</strong> ${familia.telefone}</p>
        <p><strong>Observações:</strong> ${familia.observacoes || 'Nenhuma'}</p>
      `;
      familiaList.appendChild(card);
    });

  } catch (error) {
    console.error("Erro ao carregar famílias:", error);
    familiaList.innerHTML += "<p style='color:red;'>Não foi possível carregar a lista de famílias.</p>";
  }
}

// ==============================
// EVENTO PARA CADASTRAR NOVA FAMÍLIA
// ==============================
formFamilia.addEventListener("submit", async (e) => {
  e.preventDefault();

  const novaFamilia = {
    nome: document.getElementById("nome").value,
    responsavel: document.getElementById("responsavel").value,
    endereco: document.getElementById("endereco").value,
    telefone: document.getElementById("telefone").value,
    observacoes: document.getElementById("observacoes").value
  };

  try {
    await fetch(FAMILIA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novaFamilia)
    });

    formFamilia.reset();    // limpa formulário
    carregarFamilias();     // atualiza lista
  } catch (error) {
    console.error("Erro ao cadastrar família:", error);
    alert("Não foi possível cadastrar a família. Tente novamente.");
  }
});

// Inicializa carregando as famílias ao abrir a página
carregarFamilias();
