const form = document.getElementById("alimento-form");
const tableBody = document.getElementById("alimento-table-body");

const API_URL = "http://localhost:8080/api/v1/alimento"; // ajuste para o endpoint do seu back
const DEPOSITO_URL = "http://localhost:8080/api/v1/deposito/1";

// Buscar lista de alimentos ao carregar a página
const filtroInput = document.getElementById("filtro-alimento"); // input criado no HTML

async function carregarAlimentos() {
  try {
    const response = await fetch(DEPOSITO_URL);
    const deposito = await response.json();
    const alimentos = Array.isArray(deposito.alimentos) ? deposito.alimentos : [];

    // Agrupar por nome
    const grupos = {};
    alimentos.forEach(a => {
      const nome = a.nome.toLowerCase();
      if (!grupos[nome]) {
        grupos[nome] = [a];
      } else {
        grupos[nome].push(a);
      }
    });

    // Aplicar filtro
    const filtro = filtroInput ? filtroInput.value.toLowerCase() : "";
    const nomesFiltrados = Object.keys(grupos).filter(nome => nome.includes(filtro));

    // Renderizar tabela
    tableBody.innerHTML = "";
    if (nomesFiltrados.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='4'>Nenhum alimento encontrado.</td></tr>";
      return;
    }

    nomesFiltrados.forEach(nome => {
      const grupo = grupos[nome];

      // Linha principal resumida
      const mainRow = document.createElement("tr");
      mainRow.className = "grupo-resumido";
      mainRow.style.cursor = "pointer";
      mainRow.innerHTML = `
        <td>${grupo[0].nome}</td>
        <td>${grupo[0].tipoDoAlimento}</td>
        <td>${grupo[0].marca}</td>
        <td>${grupo.length}</td>
      `;

      // Adiciona evento de click para expandir/colapsar detalhes
      mainRow.addEventListener("click", () => {
        const expanded = mainRow.nextElementSibling && mainRow.nextElementSibling.classList.contains("detalhes-grupo");
        if (expanded) {
          // Remove linhas de detalhes
          while (mainRow.nextElementSibling && mainRow.nextElementSibling.classList.contains("detalhes-grupo")) {
            tableBody.removeChild(mainRow.nextElementSibling);
          }
        } else {
          // Adiciona linhas de detalhes
          grupo.forEach(alimento => {
            const detailRow = document.createElement("tr");
            detailRow.className = "detalhes-grupo";
            detailRow.innerHTML = `
              <td colspan="1" style="padding-left:2rem;">ID: ${alimento.id}</td>
              <td>${alimento.tipoDoAlimento}</td>
              <td>${alimento.marca}</td>
              <td>Data: ${alimento.dataCriacao}</td>
            `;
            tableBody.insertBefore(detailRow, mainRow.nextSibling);
          });
        }
      });

      tableBody.appendChild(mainRow);
    });

  } catch (error) {
    console.error("Erro ao carregar alimentos:", error);
    tableBody.innerHTML = "<tr><td colspan='4' style='color:red;'>Erro ao carregar alimentos.</td></tr>";
  }
}



// Enviar novo alimento
form.addEventListener("submit", async (e) => {
  e.preventDefault();

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

  form.reset();
  carregarAlimentos(); // atualiza a lista
});

// Inicializa carregando alimentos
carregarAlimentos();


// familias
const familiaList = document.getElementById("familia-list");
const formFamilia = document.getElementById("familia-form");
const FAMILIA_URL = "http://localhost:8080/api/v1/familia"; // ajuste para o seu backend

// Função para carregar famílias
async function carregarFamilias() {
  try {
    const response = await fetch(FAMILIA_URL);
    const familias = await response.json();

    // Limpa a lista antes de atualizar
    familiaList.innerHTML = '<h2 id="familias-title" style="grid-column:1/-1;margin-bottom:12px">Lista de Famílias</h2>';

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

// Evento para cadastrar nova família
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

    formFamilia.reset();           // limpa o formulário
    carregarFamilias();     // atualiza a lista
  } catch (error) {
    console.error("Erro ao cadastrar família:", error);
    alert("Não foi possível cadastrar a família. Tente novamente.");
  }
});

// Inicializa carregando as famílias
carregarFamilias();


//

