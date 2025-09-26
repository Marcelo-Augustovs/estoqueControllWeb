const cestaForm = document.getElementById("cesta-form");
const cestaList = document.getElementById("cesta-list");
const API_CESTAS = "http://localhost:8080/api/v1/cesta";
const DEPOSITO_URL = "http://localhost:8080/api/v1/deposito/retirar"

const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const closeModal = document.querySelector(".close");

// Fechar modal
  closeModal.onclick = () => { modal.style.display = "none"; };
  window.onclick = (event) => { if(event.target == modal) modal.style.display = "none"; };

  cestaForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const mes = document.getElementById("mes").value;
    const novaCesta = { mes: parseInt(mes) };

    try {
      await fetch(API_CESTAS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novaCesta)
      });
      carregarCestas();
    } catch (err) {
      console.error("Erro ao criar cesta:", err);
    }
  });

// Carregar cestas existentes
  async function carregarCestas() {
    const response = await fetch(API_CESTAS);
    const cestas = await response.json();

    cestaList.innerHTML = '<h2 id="cestas-title" style="grid-column:1/-1;margin-bottom:12px">Cestas Disponíveis</h2>';

    cestas.forEach(cesta => {
      const card = document.createElement("div");
      card.className = "card";
      card.style.cursor = "pointer";
      card.innerHTML = `
        <h3>Cesta #${cesta.id}</h3>
        <p><strong>Mês:</strong> ${cesta.mes}</p>
        <p><strong>Alimentos:</strong> ${cesta.quantidadeDeAlimentos || 0}</p>
      `;

      card.addEventListener("click", () => {
        abrirModal(cesta);
      });

      cestaList.appendChild(card);
    });
  }

// Abrir modal com formulários
  function abrirModal(cesta) {
    modal.style.display = "block";
    modalBody.innerHTML = `
      <h3>Ações para Cesta #${cesta.id}</h3>
      <button id="guardarBtn">Guardar Alimento</button>
      <button id="entregarBtn">Entregar Cesta</button>
      <button id="adicionarBtn">Adicionar Alimento</button>
      <div id="formContainer"></div>
    `;

  // botao guardar alimento  
    document.getElementById("guardarBtn").addEventListener("click", () => {
      const container = document.getElementById("formContainer");
      container.innerHTML = `
        <form id="guardar-form">
          <label>ID do Alimento:</label>
          <input type="number" name="alimentoId" required>
          <button type="submit">Guardar</button>
        </form>
      `;

      const form = document.getElementById("guardar-form");
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const dto = { id: parseInt(form.alimentoId.value) };
        
        try {
          await fetch(`${API_CESTAS}/guardaralimento`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
          });
          alert("Alimento guardado com sucesso!");
          modal.style.display = "none";
          carregarCestas();
        } catch (err) {
          console.error(err);
        }
      });
    });

  // botao entregar cesta
  document.getElementById("entregarBtn").addEventListener("click", () => {
    const container = document.getElementById("formContainer");
    
    container.innerHTML = `
      <form id="entregar-form">
        <label>Nome da Família:</label>
        <input type="text" name="nomeDaFamilia" required>
        <button type="submit">Entregar</button>
      </form>
    `;

    
    const form = document.getElementById("entregar-form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const dto = { 
        nomeDaFamilia: form.nomeDaFamilia.value,
        cestaId: cesta.id };

      try {
        await fetch(`${API_CESTAS}/entregar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dto)
        });
        alert("Cesta entregue com sucesso!");
        modal.style.display = "none";
        carregarCestas();
      } catch (err) {
        console.error(err);
      }
    });
  });

  // Botao adicionar alimentos
  document.getElementById("adicionarBtn").addEventListener("click", () => {
    const container = document.getElementById("formContainer");
   
    container.innerHTML = `
      <form id="adicionar-form">
        <label>Nome do Alimento:</label>
        <input type="text" name="nomeAlimento" required>
        <button type="submit">Adicionar</button>
      </form>
    `;
  

    const form = document.getElementById("adicionar-form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const dto = {
        idDaCesta: cesta.id,
        nomeDoAlimento: form.nomeAlimento.value,
      };

      try {
        await fetch(`${DEPOSITO_URL}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dto)
        });
        alert("Alimento adicionado com sucesso!");
        modal.style.display = "none";
        carregarCestas();
      } catch (err) {
        console.error(err);
      }
    });
  });
}

carregarCestas();