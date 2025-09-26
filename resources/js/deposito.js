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
            <td>Marca: ${alimento.marca}</td>
            <td>Data do Registro: ${alimento.dataCriacao}</td>
            <td>Validade: ${alimento.validade || "não informada"}</td>
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