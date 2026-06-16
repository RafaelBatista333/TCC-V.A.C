const STORAGE_KEY = "vac.animais";
const ORDER_STORAGE_KEY = "vac.pedidos";
const ADMIN_STORAGE_KEY = "vac.colaboradores.admin";
const ADMIN_SESSION_STORAGE_KEY = "vac.colaboradores.admin.session";

const DEFAULT_ANIMAIS = [
  {
    nome: "Mel",
    especie: "Cachorro",
    local: "Praça Central",
    saude: "Saudável",
    descricao: "Recebe alimentação diária de moradores da região.",
    criadoEm: "2026-03-25T10:30:00.000Z"
  },
  {
    nome: "Lua",
    especie: "Gato",
    local: "Rua das Palmeiras",
    saude: "Ferido",
    descricao: "Precisa de avaliação em uma das patas traseiras.",
    criadoEm: "2026-03-26T15:00:00.000Z"
  }
];

const state = {
  animais: [],
  pedidos: [],
  pedidoAdmin: null,
  pedidoAdminSession: "",
  activeRequester: null,
  mapa: null
};

document.addEventListener("DOMContentLoaded", () => {
  state.animais = loadAnimals();
  state.pedidos = loadOrders();
  state.pedidoAdmin = loadAdminCredential();
  state.pedidoAdminSession = loadAdminSession();

  bindEvent("loginForm", "submit", handleLogin);
  bindEvent("entrarDireto", "click", handleQuickEntry);
  bindEvent("formAnimal", "submit", handleAnimalSubmit);
  bindEvent("pedido-access-form", "submit", handleRequesterAccess);
  bindEvent("pedido-clear-requester", "click", clearRequester);
  bindEvent("pedido-form", "submit", handleOrderSubmit);
  bindEvent("pedido-admin-setup-form", "submit", handleAdminSetup);
  bindEvent("pedido-admin-login-form", "submit", handleAdminLogin);
  bindEvent("pedido-admin-logout", "click", handleAdminLogout);
  bindEvent("pedido-admin-list", "change", handleOrderStatusChange);

  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => openTab(button.dataset.tab));
  });

  renderAnimals();
  syncRequesterUI();
  syncPedidoAdminUI();
  renderOrders();
});

function bindEvent(id, eventName, handler) {
  const element = document.getElementById(id);

  if (element) {
    element.addEventListener(eventName, handler);
  }
}

function handleLogin(event) {
  event.preventDefault();

  const form = event.currentTarget;

  if (!form.reportValidity()) {
    return;
  }

  const nome = document.getElementById("nomeUsuario").value.trim();
  const tipo = document.getElementById("tipoUsuario").value;

  enterApp(nome || "Visitante", tipo);
}

function handleQuickEntry() {
  enterApp("Visitante", "cliente");
}

function enterApp(nome, tipo) {
  document.body.classList.add("is-app-open");
  document.getElementById("loginTela").classList.add("is-hidden");
  document.getElementById("app").classList.remove("is-hidden");
  document.getElementById("mensagemBoasVindas").textContent =
    `Usuário ativo: ${nome} | Perfil: ${capitalize(tipo)}.`;

  openTab("inicio");
  initMap();
}

function openTab(tabId) {
  const app = document.getElementById("app");

  document.querySelectorAll(".aba").forEach((section) => {
    section.classList.toggle("is-active", section.id === tabId);
  });

  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === tabId);
  });

  if (app) {
    app.dataset.activeTab = tabId;
  }

  if (tabId === "inicio" && state.mapa) {
    setTimeout(() => {
      state.mapa.invalidateSize();
    }, 120);
  }
}

function handleAnimalSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;

  if (!form.reportValidity()) {
    return;
  }

  const animal = {
    nome: document.getElementById("nomeAnimal").value.trim(),
    especie: document.getElementById("especie").value,
    local: document.getElementById("localAnimal").value.trim(),
    saude: document.getElementById("saudeAnimal").value,
    descricao: document.getElementById("descAnimal").value.trim(),
    criadoEm: new Date().toISOString()
  };

  state.animais.unshift(animal);
  saveAnimals();
  renderAnimals();

  form.reset();

  const status = document.getElementById("statusCadastro");
  status.textContent = `${animal.nome} foi registrado com sucesso.`;
  status.classList.add("is-success");

  openTab("inicio");
}

function handleRequesterAccess(event) {
  event.preventDefault();

  const form = event.currentTarget;

  if (!form.reportValidity()) {
    return;
  }

  state.activeRequester = {
    nome: document.getElementById("pedido-requester-name").value.trim(),
    email: document.getElementById("pedido-requester-email").value.trim()
  };

  syncRequesterUI();
  setStatusMessage(
    "pedido-access-feedback",
    `Colaborador ${state.activeRequester.nome} liberado para registrar pedidos.`,
    "success"
  );
  setStatusMessage("pedido-feedback", "");
}

function clearRequester() {
  state.activeRequester = null;

  const accessForm = document.getElementById("pedido-access-form");
  const orderForm = document.getElementById("pedido-form");

  if (accessForm) {
    accessForm.reset();
  }

  if (orderForm) {
    orderForm.reset();
  }

  syncRequesterUI();
  setStatusMessage("pedido-access-feedback", "");
  setStatusMessage("pedido-feedback", "");
}

function syncRequesterUI() {
  const accessForm = document.getElementById("pedido-access-form");
  const summary = document.getElementById("pedido-requester-summary");
  const summaryText = document.getElementById("pedido-requester-text");
  const orderForm = document.getElementById("pedido-form");
  const hasRequester = Boolean(state.activeRequester);

  if (!accessForm || !summary || !summaryText || !orderForm) {
    return;
  }

  accessForm.classList.toggle("is-hidden", hasRequester);
  summary.classList.toggle("is-hidden", !hasRequester);
  orderForm.classList.toggle("is-hidden", !hasRequester);

  if (hasRequester) {
    summaryText.textContent =
      `${state.activeRequester.nome} | ${state.activeRequester.email}`;
  } else {
    summaryText.textContent = "";
  }
}

function handleOrderSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;

  if (!state.activeRequester) {
    setStatusMessage(
      "pedido-feedback",
      "Identifique primeiro o colaborador responsável pelo pedido.",
      "error"
    );
    return;
  }

  if (!form.reportValidity()) {
    return;
  }

  const pedido = {
    id: createId(),
    colaboradorNome: state.activeRequester.nome,
    colaboradorEmail: state.activeRequester.email,
    animalNome: document.getElementById("pedido-animal-name").value.trim(),
    animalEspecie: document.getElementById("pedido-animal-species").value,
    item: document.getElementById("pedido-item").value,
    quantidade: document.getElementById("pedido-quantity").value.trim(),
    prioridade: document.getElementById("pedido-priority").value,
    localEntrega: document.getElementById("pedido-location").value.trim(),
    observacoes: document.getElementById("pedido-notes").value.trim(),
    status: "Recebido",
    criadoEm: new Date().toISOString()
  };

  state.pedidos.unshift(pedido);
  saveOrders();
  renderOrders();

  form.reset();
  setStatusMessage(
    "pedido-feedback",
    `Pedido de ração registrado para ${pedido.animalNome}.`,
    "success"
  );
}

function handleAdminSetup(event) {
  event.preventDefault();

  const form = event.currentTarget;

  if (!form.reportValidity()) {
    return;
  }

  const nome = document.getElementById("pedido-admin-setup-name").value.trim();
  const senha = document.getElementById("pedido-admin-setup-password").value;
  const confirmacao = document.getElementById("pedido-admin-setup-password-confirm").value;

  if (senha !== confirmacao) {
    setStatusMessage(
      "pedido-admin-setup-feedback",
      "A confirmação da senha precisa ser igual à senha administrativa.",
      "error"
    );
    return;
  }

  state.pedidoAdmin = { nome, senha };
  state.pedidoAdminSession = "";

  saveAdminCredential();
  saveAdminSession("");

  form.reset();
  syncPedidoAdminUI();

  const loginInput = document.getElementById("pedido-admin-username");

  if (loginInput) {
    loginInput.value = nome;
  }

  setStatusMessage(
    "pedido-admin-setup-feedback",
    "Acesso administrativo criado. Use as credenciais para entrar no painel.",
    "success"
  );
  setStatusMessage("pedido-admin-login-feedback", "");
}

function handleAdminLogin(event) {
  event.preventDefault();

  const form = event.currentTarget;

  if (!form.reportValidity()) {
    return;
  }

  if (!state.pedidoAdmin) {
    setStatusMessage(
      "pedido-admin-login-feedback",
      "Crie primeiro o acesso administrativo para liberar a área.",
      "error"
    );
    return;
  }

  const nome = document.getElementById("pedido-admin-username").value.trim();
  const senha = document.getElementById("pedido-admin-password").value;

  if (nome !== state.pedidoAdmin.nome || senha !== state.pedidoAdmin.senha) {
    setStatusMessage(
      "pedido-admin-login-feedback",
      "Nome ou senha administrativos inválidos.",
      "error"
    );
    return;
  }

  state.pedidoAdminSession = nome;
  saveAdminSession(nome);
  syncPedidoAdminUI();

  form.reset();
  setStatusMessage(
    "pedido-admin-login-feedback",
    `Painel liberado para ${nome}.`,
    "success"
  );
}

function handleAdminLogout() {
  state.pedidoAdminSession = "";
  saveAdminSession("");
  syncPedidoAdminUI();
  setStatusMessage("pedido-admin-login-feedback", "Sessão administrativa encerrada.", "success");
}

function syncPedidoAdminUI() {
  const accessTitle = document.getElementById("pedido-admin-access-title");
  const accessDescription = document.getElementById("pedido-admin-access-description");
  const statusText = document.getElementById("pedido-admin-status-text");
  const panelTitle = document.getElementById("pedido-admin-panel-title");
  const panelDescription = document.getElementById("pedido-admin-panel-description");
  const setupForm = document.getElementById("pedido-admin-setup-form");
  const loginForm = document.getElementById("pedido-admin-login-form");
  const dashboard = document.getElementById("pedido-admin-dashboard");
  const sessionText = document.getElementById("pedido-admin-session");
  const loginInput = document.getElementById("pedido-admin-username");
  const isAuthenticated = hasAdminSession();

  if (!accessTitle || !accessDescription || !statusText || !panelTitle || !panelDescription) {
    return;
  }

  if (!state.pedidoAdmin) {
    accessTitle.textContent = "Criar acesso administrativo";
    accessDescription.textContent =
      "Defina um nome e uma senha exclusivos para o administrador dos pedidos.";
    statusText.textContent = "Nenhum administrador cadastrado.";
    panelTitle.textContent = "Criar acesso administrativo";
    panelDescription.textContent =
      "O primeiro acesso cria a credencial administrativa. Depois disso, apenas esse perfil pode abrir a planilha de acompanhamento.";

    toggleHidden(setupForm, false);
    toggleHidden(loginForm, true);
    toggleHidden(dashboard, true);

    if (sessionText) {
      sessionText.textContent = "";
    }

    return;
  }

  if (loginInput) {
    loginInput.value = state.pedidoAdmin.nome;
  }

  accessTitle.textContent = isAuthenticated ? "Painel administrativo ativo" : "Acesso administrativo criado";
  accessDescription.textContent = isAuthenticated
    ? "Os pedidos estão prontos para acompanhamento, atualização de status e conferências."
    : "Use o nome e a senha cadastrados para liberar a área administrativa dos pedidos.";
  statusText.textContent = isAuthenticated
    ? `Administrador ativo: ${state.pedidoAdmin.nome}.`
    : `Administrador cadastrado: ${state.pedidoAdmin.nome}.`;
  panelTitle.textContent = isAuthenticated ? "Painel administrativo liberado" : "Entrar como administrador";
  panelDescription.textContent = isAuthenticated
    ? "A equipe pode acompanhar a fila abaixo e atualizar o status de cada entrega."
    : "Somente o nome e a senha cadastrados conseguem abrir a planilha de acompanhamento.";

  toggleHidden(setupForm, true);
  toggleHidden(loginForm, isAuthenticated);
  toggleHidden(dashboard, !isAuthenticated);

  if (sessionText) {
    sessionText.textContent = isAuthenticated
      ? `Acompanhando os pedidos como ${state.pedidoAdmin.nome}.`
      : "";
  }
}

function handleOrderStatusChange(event) {
  const select = event.target;

  if (!(select instanceof HTMLSelectElement) || select.dataset.orderStatus !== "true") {
    return;
  }

  if (!hasAdminSession()) {
    renderOrders();
    return;
  }

  const pedido = state.pedidos.find((item) => item.id === select.dataset.orderId);

  if (!pedido) {
    return;
  }

  pedido.status = select.value;
  saveOrders();
  renderOrders();
}

function renderAnimals() {
  const list = document.getElementById("listaAnimais");
  const counter = document.getElementById("contadorAnimais");

  if (!list || !counter) {
    return;
  }

  list.innerHTML = "";
  counter.textContent = String(state.animais.length);

  state.animais.forEach((animal) => {
    const item = document.createElement("li");
    item.className = "animal-item";

    const title = document.createElement("h4");
    title.textContent = `${animal.nome} - ${animal.especie}`;

    const meta = document.createElement("p");
    meta.className = "animal-item__meta";
    meta.textContent = `${animal.local} | ${animal.saude} | ${formatDate(animal.criadoEm)}`;

    const description = document.createElement("p");
    description.textContent = animal.descricao;

    item.append(title, meta, description);
    list.appendChild(item);
  });
}

function renderOrders() {
  const list = document.getElementById("pedido-admin-list");
  const emptyState = document.getElementById("pedido-empty-state");
  const totalCount = document.getElementById("pedido-total-count");
  const openCount = document.getElementById("pedido-open-count");
  const highCount = document.getElementById("pedido-high-count");
  const tableWrap = document.querySelector("#pedido-admin-dashboard .pedido-table-wrap");

  if (!list || !emptyState || !totalCount || !openCount || !highCount || !tableWrap) {
    return;
  }

  list.innerHTML = "";
  totalCount.textContent = String(state.pedidos.length);
  openCount.textContent = String(state.pedidos.filter((pedido) => pedido.status !== "Entregue").length);
  highCount.textContent = String(state.pedidos.filter((pedido) => pedido.prioridade === "Alta").length);

  if (!state.pedidos.length) {
    emptyState.classList.remove("is-hidden");
    tableWrap.classList.add("is-hidden");
    return;
  }

  emptyState.classList.add("is-hidden");
  tableWrap.classList.remove("is-hidden");

  state.pedidos.forEach((pedido) => {
    const row = document.createElement("tr");

    row.append(
      createMetaCell(
        pedido.colaboradorNome,
        pedido.colaboradorEmail,
        formatDate(pedido.criadoEm)
      ),
      createMetaCell(
        `${pedido.animalNome} - ${pedido.animalEspecie}`,
        pedido.observacoes,
        `Prioridade: ${pedido.prioridade}`
      ),
      createMetaCell(
        pedido.item,
        `Quantidade: ${pedido.quantidade}`,
        `Status atual: ${pedido.status}`
      ),
      createMetaCell(
        pedido.localEntrega,
        "Ponto de apoio informado pelo colaborador"
      ),
      createStatusCell(pedido)
    );

    list.appendChild(row);
  });
}

function createMetaCell(titleText, metaText, detailText = "") {
  const cell = document.createElement("td");
  const wrapper = document.createElement("div");
  const title = document.createElement("strong");
  const meta = document.createElement("span");

  wrapper.className = "pedido-meta";
  title.textContent = titleText;
  meta.textContent = metaText;

  wrapper.append(title, meta);

  if (detailText) {
    const detail = document.createElement("small");
    detail.textContent = detailText;
    wrapper.appendChild(detail);
  }

  cell.appendChild(wrapper);
  return cell;
}

function createStatusCell(pedido) {
  const cell = document.createElement("td");
  const select = document.createElement("select");
  const statusOptions = ["Recebido", "Em separação", "Em rota", "Entregue"];

  select.className = "pedido-status-select";
  select.dataset.orderStatus = "true";
  select.dataset.orderId = pedido.id;

  statusOptions.forEach((status) => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    select.appendChild(option);
  });

  select.value = pedido.status;
  cell.appendChild(select);

  return cell;
}

function initMap() {
  const mapElement = document.getElementById("mapa");

  if (!mapElement || mapElement.dataset.ready === "true") {
    return;
  }

  if (typeof window.L === "undefined") {
    mapElement.innerHTML = `
      <div class="mapa-fallback">
        <div>
          <strong>Mapa online indisponível</strong>
          <p>Ponto de referência principal: Centro de São Paulo</p>
          <p>Latitude: -23.5505 | Longitude: -46.6333</p>
        </div>
      </div>
    `;
    mapElement.dataset.ready = "true";
    return;
  }

  state.mapa = window.L.map("mapa", {
    scrollWheelZoom: false
  }).setView([-23.5505, -46.6333], 12);

  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19
  }).addTo(state.mapa);

  window.L.marker([-23.5505, -46.6333])
    .addTo(state.mapa)
    .bindPopup("Ponto de apoio V.A.C.")
    .openPopup();

  mapElement.dataset.ready = "true";
}

function loadAnimals() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ANIMAIS));
      return DEFAULT_ANIMAIS.map(normalizeAnimalText);
    }

    return JSON.parse(stored).map(normalizeAnimalText);
  } catch (error) {
    return DEFAULT_ANIMAIS.map(normalizeAnimalText);
  }
}

function saveAnimals() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.animais));
  } catch (error) {
    console.error("Não foi possível salvar os registros localmente.", error);
  }
}

function loadOrders() {
  try {
    const stored = window.localStorage.getItem(ORDER_STORAGE_KEY);
    return stored ? JSON.parse(stored).map(normalizeOrderText) : [];
  } catch (error) {
    return [];
  }
}

function saveOrders() {
  try {
    window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(state.pedidos));
  } catch (error) {
    console.error("Não foi possível salvar os pedidos localmente.", error);
  }
}

function loadAdminCredential() {
  try {
    const stored = window.localStorage.getItem(ADMIN_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
}

function saveAdminCredential() {
  try {
    if (!state.pedidoAdmin) {
      window.localStorage.removeItem(ADMIN_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(state.pedidoAdmin));
  } catch (error) {
    console.error("Não foi possível salvar o acesso administrativo.", error);
  }
}

function loadAdminSession() {
  try {
    return window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY) || "";
  } catch (error) {
    return "";
  }
}

function saveAdminSession(sessionName) {
  try {
    if (!sessionName) {
      window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, sessionName);
  } catch (error) {
    console.error("Não foi possível salvar a sessão administrativa.", error);
  }
}

function normalizeAnimalText(animal) {
  return {
    ...animal,
    local: normalizePortugueseText(animal.local),
    saude: normalizePortugueseText(animal.saude),
    descricao: normalizePortugueseText(animal.descricao)
  };
}

function normalizeOrderText(pedido) {
  return {
    ...pedido,
    animalEspecie: normalizePortugueseText(pedido.animalEspecie),
    item: normalizePortugueseText(pedido.item),
    prioridade: normalizePortugueseText(pedido.prioridade),
    localEntrega: normalizePortugueseText(pedido.localEntrega),
    observacoes: normalizePortugueseText(pedido.observacoes),
    status: normalizePortugueseText(pedido.status)
  };
}

function normalizePortugueseText(value) {
  if (typeof value !== "string") {
    return value;
  }

  return value
    .replaceAll("Praca", "Praça")
    .replaceAll("Saudavel", "Saudável")
    .replaceAll("alimentacao", "alimentação")
    .replaceAll("diaria", "diária")
    .replaceAll("regiao", "região")
    .replaceAll("avaliacao", "avaliação")
    .replaceAll("Racao", "Ração")
    .replaceAll("umida", "úmida")
    .replaceAll("terapeutica", "terapêutica")
    .replaceAll("Media", "Média")
    .replaceAll("separacao", "separação");
}

function hasAdminSession() {
  if (!state.pedidoAdmin || !state.pedidoAdminSession) {
    return false;
  }

  const isValidSession = state.pedidoAdminSession === state.pedidoAdmin.nome;

  if (!isValidSession) {
    state.pedidoAdminSession = "";
    saveAdminSession("");
  }

  return isValidSession;
}

function toggleHidden(element, shouldHide) {
  if (element) {
    element.classList.toggle("is-hidden", shouldHide);
  }
}

function setStatusMessage(elementId, message, statusType = "") {
  const element = document.getElementById(elementId);

  if (!element) {
    return;
  }

  element.textContent = message;
  element.classList.remove("is-success", "is-error");

  if (statusType) {
    element.classList.add(`is-${statusType}`);
  }
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `pedido-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function formatDate(isoDate) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(isoDate));
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
