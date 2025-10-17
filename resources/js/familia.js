// ==============================
// ELEMENTOS DE FAMÍLIAS
// ==============================
const familiaList = document.getElementById("familia-list"); // container das famílias
const formFamilia = document.getElementById("familia-form"); // formulário de cadastro
const tableBody = document.getElementById("familia-table-body"); 
const filtroInput = document.getElementById("filtro-familia");

const FAMILIA_URL = "http://localhost:8080/api/v1/familia"; // endpoint das famílias

// ==============================
// FUNÇÃO PARA CARREGAR FAMÍLIAS
// ==============================
let listaDeFamilias = {};

async function carregarFamilias() {
  try {
    const response = await fetch(FAMILIA_URL);
    const familias = await response.json();
    const lista = Array.isArray(familias) ? familias : [];

    // agrupar por nome
    listaDeFamilias = {}; 
    lista.forEach(familia => {
      const nome = familia.nome.toLowerCase();
      if (!listaDeFamilias[nome]) 
          listaDeFamilias[nome] = [];
      listaDeFamilias[nome].push(familia);
    });

    renderizarTabela(Object.keys(listaDeFamilias));

  } catch (error) {
    console.error("Erro ao carregar famílias:", error);
    tableBody.innerHTML = "<tr><td colspan='3' style='color:red;'>Não foi possível carregar a lista de famílias.</td></tr>";
  }
}

// ==============================
// EVENTO PARA CADASTRAR NOVA FAMÍLIA
// ==============================
formFamilia.addEventListener("submit", async (e) => {
  e.preventDefault();

  const familiaDto = {
    nome: document.getElementById("nome").value,
    endereco: document.getElementById("endereco").value
  };

  try {
    await fetch(FAMILIA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(familiaDto)
    });

    formFamilia.reset();    
    carregarFamilias();     
  } catch (error) {
    console.error("Erro ao cadastrar família:", error);
    alert("Não foi possível cadastrar a família. Tente novamente.");
  }
});

// ==============================
// RENDERIZAR TABELA
// ==============================
function renderizarTabela(nomesFiltrados) {
  tableBody.innerHTML = ""; // limpa a tabela

  if (nomesFiltrados.length === 0) {
    tableBody.innerHTML = "<tr><td colspan='3'>Nenhuma família encontrada.</td></tr>";
    return;
  }

  nomesFiltrados.forEach(nome => {
    const grupo = listaDeFamilias[nome];

    const mainRow = document.createElement("tr");
    mainRow.className = "grupo-resumido";
    mainRow.style.cursor = "pointer";
    mainRow.innerHTML = `
      <td>${grupo[0].nome}</td>
      <td>${grupo[0].endereco}</td>
      <td>${grupo[0].telefone ||"não registrado"}</td>
      <td>${grupo[0].cestaDoMesRecebido ? "recebido": "pendente"}</td>
    `;

    // expandir detalhes da família
    mainRow.addEventListener("click", () => {
      let next = mainRow.nextElementSibling;
      while (next && next.classList.contains("detalhes-grupo")) {
        const tmp = next.nextElementSibling;
        next.remove();
        next = tmp;
      }

      if (!mainRow.dataset.expanded) {
        grupo.forEach(familia => {
          const detailRow = document.createElement("tr");
          detailRow.className = "detalhes-grupo";
          detailRow.innerHTML = `
            <td colspan="4" style="padding-left:2rem;">
              <strong>Endereço:</strong> ${familia.endereco} — 
              <strong>Total de Cesta recebidas:</strong> ${familia.cestasRecebidas ? familia.cestasRecebidas.length : 0}
              — <strong>Data Registro:</strong> ${familia.dataCriacao}
              — <strong>Registrado por:</strong> ${familia.criadoPor}

            </td>
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
  const nomesFiltrados = Object.keys(listaDeFamilias).filter(nome => nome.includes(filtro));
  renderizarTabela(nomesFiltrados);
});

// ==============================
// CHAMADA INICIAL
// ==============================
carregarFamilias();
