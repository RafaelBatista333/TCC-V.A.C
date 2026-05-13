<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>V.A.C. | Vanguarda de Animais Comunitarios</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css">
  <link rel="stylesheet" href="./Style.css">
  <script defer src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
  <script defer src="./script.js"></script>
</head>
<body>
  <main class="layout">
    <section id="loginTela" class="painel auth-panel">
      <div class="hero">
        <p class="hero__tag">Atendimento comunitario para animais domesticos e silvestres</p>
        <h1>V.A.C.</h1>
        <p class="hero__descricao">
          Registre ocorrencias, acompanhe o fluxo de atendimento e mantenha a
          comunidade informada sobre os animais que precisam de ajuda.
        </p>
      </div>

<!--Login-->

      <form id="loginForm" class="formulario">
        <h2>Entrar no aplicativo</h2>

        <label class="campo">
          <span>Tipo de usuario</span>
          <select id="tipoUsuario" name="tipoUsuario" required>
            <option value="cliente">Cliente</option>
            <option value="funcionario">Funcionario</option>
          </select>
        </label>

        <label class="campo">
          <span>Nome</span>
          <input id="nomeUsuario" name="nomeUsuario" type="text" placeholder="Seu nome" required>
        </label>

        <label class="campo">
          <span>E-mail</span>
          <input id="emailUsuario" name="emailUsuario" type="email" placeholder="voce@exemplo.com" required>
        </label>

        <label class="campo">
          <span>Senha</span>
          <input id="senhaUsuario" name="senhaUsuario" type="password" placeholder="Digite sua senha" required>
        </label>

        <div class="acoes">
          <button type="submit">Entrar</button>
          <button id="entrarDireto" type="button" class="button-secundario">Entrar sem cadastro</button>
        </div>
      </form>
    </section>

    <section id="app" class="painel app-panel is-hidden" data-active-tab="inicio">
      <header class="app-header">
        <div>
          <p class="hero__tag">Painel operacional</p>
          <h2>V.A.C.</h2>
          <p id="mensagemBoasVindas" class="hero__descricao"></p>
        </div>

        <!--Página inicial-->

        <nav class="tabs" aria-label="Navegacao principal">
          <button type="button" class="tab-button is-active" data-tab="inicio">Inicio</button>
          <button type="button" class="tab-button" data-tab="servicos">Servicos</button>
          <button type="button" class="tab-button" data-tab="colaboradores">Colaboradores</button>
          <button type="button" class="tab-button" data-tab="contato">Contato</button>
          <button type="button" class="tab-button" data-tab="cadastro">Registrar animal</button>
        </nav>
      </header>

      <section id="inicio" class="aba is-active">
        <div class="grid">
          <article class="card card-destaque">
            <div class="card__topo">
              <div>
                <p class="card__label">Monitoramento</p>
                <h3>Mapa da comunidade</h3>
              </div>
            </div>
            <div id="mapa" aria-label="Mapa de atendimento do V.A.C."></div>
            <p class="nota">
              Se o mapa online nao carregar, o painel mostra um resumo do ponto
              central de atendimento.
            </p>
          </article>

          <article class="card">
            <div class="card__topo">
              <div>
                <p class="card__label">Registros recentes</p>
                <h3>Animais cadastrados</h3>
              </div>
              <span id="contadorAnimais" class="badge">0</span>
            </div>
            <ul id="listaAnimais" class="lista-animais"></ul>
          </article>
        </div>
      </section>

      <section id="servicos" class="aba">
        <article class="card">
          <p class="card__label">Fluxo do atendimento</p>
          <h3>Como o processo funciona</h3>
          <ol class="lista-passos">
            <li>O cliente registra o animal e informa localizacao e estado de saude.</li>
            <li>A equipe do V.A.C. recebe a notificacao e prioriza o chamado.</li>
            <li>Um colaborador se desloca ate o local para avaliar a situacao.</li>
            <li>O animal recebe atendimento, encaminhamento ou acompanhamento.</li>
          </ol>
        </article>
      </section>

      <section id="colaboradores" class="aba">
        <div class="colaboradores-grid">
          <article class="card">
            <p class="card__label">Rede de apoio</p>
            <h3>ONGs e parceiros sugeridos</h3>
            <ul class="lista-colaboradores">
              <li>Clinicas veterinarias de plantao do bairro</li>
              <li>Protetores independentes e lares temporarios</li>
              <li>Secretaria municipal de meio ambiente</li>
              <li>Voluntarios para transporte e resgate</li>
            </ul>
            <p class="nota">
              Os colaboradores tambem podem registrar pedidos de racao para os animais atendidos
              pela rede, centralizando solicitacoes e acompanhamento em um unico lugar.
            </p>
          </article>

          <article class="card pedidos-card">
            <div class="pedidos-hero">
              <div>
                <p class="card__label">Pedidos de apoio</p>
                <h3>Sistema de pedidos de racao</h3>
                <p class="nota">
                  Separe o fluxo de solicitacao e administracao para que cada colaborador registre
                  rapidamente o que cada animal precisa, enquanto a equipe acompanha tudo em
                  formato de planilha.
                </p>
                <div class="pedido-tags">
                  <span>Racao seca</span>
                  <span>Racao umida</span>
                  <span>Entrega por ponto de apoio</span>
                </div>
              </div>

              <aside class="credential-box">
                <h4 id="pedido-admin-access-title">Criar acesso administrativo</h4>
                <p id="pedido-admin-access-description" class="nota">
                  Defina um nome e uma senha exclusivos para o administrador dos pedidos.
                </p>
                <div id="pedido-admin-access-status" class="credential-box__status">
                  <strong>Situacao atual:</strong>
                  <span id="pedido-admin-status-text">Nenhum administrador cadastrado.</span>
                </div>
              </aside>
            </div>

            <div class="pedido-grid">
              <section class="pedido-column">
                <div class="panel-heading">
                  <p class="card__label">Area do colaborador</p>
                  <h4>Registrar novo pedido</h4>
                  <p class="nota">
                    Primeiro identifique o colaborador responsavel. Depois disso, o formulario de
                    pedido fica liberado para registrar o tipo de racao, quantidade e observacoes.
                  </p>
                </div>

                <form id="pedido-access-form" class="formulario">
                  <label class="campo">
                    <span>Nome do colaborador</span>
                    <input id="pedido-requester-name" name="pedidoRequesterName" type="text" placeholder="Ex.: Mariana Costa" required>
                  </label>

                  <label class="campo">
                    <span>E-mail</span>
                    <input id="pedido-requester-email" name="pedidoRequesterEmail" type="email" placeholder="colaborador@exemplo.com" required>
                  </label>

                  <button type="submit">Continuar para o pedido</button>
                </form>

                <p id="pedido-access-feedback" class="status" aria-live="polite"></p>

                <div id="pedido-requester-summary" class="requester-summary is-hidden">
                  <p id="pedido-requester-text"></p>
                  <button id="pedido-clear-requester" type="button" class="button-secundario">Trocar colaborador</button>
                </div>

                <form id="pedido-form" class="formulario pedido-form is-hidden">
                  <label class="campo">
                    <span>Nome do animal</span>
                    <input id="pedido-animal-name" name="pedidoAnimalName" type="text" placeholder="Ex.: Mel" required>
                  </label>

                  <label class="campo">
                    <span>Especie</span>
                    <select id="pedido-animal-species" name="pedidoAnimalSpecies" required>
                      <option value="Cachorro">Cachorro</option>
                      <option value="Gato">Gato</option>
                      <option value="Silvestre">Silvestre</option>
                    </select>
                  </label>

                  <label class="campo">
                    <span>Tipo de racao</span>
                    <select id="pedido-item" name="pedidoItem" required>
                      <option value="Racao seca">Racao seca</option>
                      <option value="Racao umida">Racao umida</option>
                      <option value="Racao terapeutica">Racao terapeutica</option>
                      <option value="Kit misto">Kit misto</option>
                    </select>
                  </label>

                  <label class="campo">
                    <span>Quantidade</span>
                    <input id="pedido-quantity" name="pedidoQuantity" type="text" placeholder="Ex.: 3 sacos de 15 kg" required>
                  </label>

                  <label class="campo">
                    <span>Prioridade</span>
                    <select id="pedido-priority" name="pedidoPriority" required>
                      <option value="Alta">Alta</option>
                      <option value="Media">Media</option>
                      <option value="Baixa">Baixa</option>
                    </select>
                  </label>

                  <label class="campo">
                    <span>Local de entrega</span>
                    <input id="pedido-location" name="pedidoLocation" type="text" placeholder="Rua, bairro ou ponto de apoio" required>
                  </label>

                  <label class="campo">
                    <span>Observacoes</span>
                    <textarea id="pedido-notes" name="pedidoNotes" rows="4" placeholder="Necessidades do animal, horario ou contato adicional" required></textarea>
                  </label>

                  <button type="submit">Registrar pedido de racao</button>
                </form>

                <p id="pedido-feedback" class="status" aria-live="polite"></p>
              </section>

              <section class="pedido-column">
                <div class="panel-heading">
                  <p class="card__label">Area administrativa</p>
                  <h4 id="pedido-admin-panel-title">Criar acesso administrativo</h4>
                  <p id="pedido-admin-panel-description" class="nota">
                    O primeiro acesso cria a credencial administrativa. Depois disso, apenas esse
                    perfil pode abrir a planilha de acompanhamento.
                  </p>
                </div>

                <form id="pedido-admin-setup-form" class="formulario">
                  <label class="campo">
                    <span>Nome do administrador</span>
                    <input id="pedido-admin-setup-name" name="pedidoAdminSetupName" type="text" placeholder="Ex.: Rafael Batista" autocomplete="username" required>
                  </label>

                  <label class="campo">
                    <span>Senha administrativa</span>
                    <input id="pedido-admin-setup-password" name="pedidoAdminSetupPassword" type="password" placeholder="Crie uma senha segura" autocomplete="new-password" required>
                  </label>

                  <label class="campo">
                    <span>Confirmar senha</span>
                    <input id="pedido-admin-setup-password-confirm" name="pedidoAdminSetupPasswordConfirm" type="password" placeholder="Repita a senha criada" autocomplete="new-password" required>
                  </label>

                  <button type="submit" class="button-admin">Criar acesso do administrador</button>
                </form>

                <p id="pedido-admin-setup-feedback" class="status" aria-live="polite"></p>

                <form id="pedido-admin-login-form" class="formulario is-hidden">
                  <label class="campo">
                    <span>Nome do administrador</span>
                    <input id="pedido-admin-username" name="pedidoAdminUsername" type="text" placeholder="Digite o nome cadastrado" autocomplete="username" required>
                  </label>

                  <label class="campo">
                    <span>Senha</span>
                    <input id="pedido-admin-password" name="pedidoAdminPassword" type="password" placeholder="Digite a senha cadastrada" autocomplete="current-password" required>
                  </label>

                  <button type="submit" class="button-admin">Entrar como administrador</button>
                </form>

                <p id="pedido-admin-login-feedback" class="status" aria-live="polite"></p>

                <div id="pedido-admin-dashboard" class="pedido-dashboard is-hidden">
                  <div class="pedido-dashboard__header">
                    <div>
                      <p class="card__label">Acompanhamento</p>
                      <h4>Fila de pedidos</h4>
                      <p id="pedido-admin-session" class="nota"></p>
                    </div>
                    <button id="pedido-admin-logout" type="button" class="button-secundario">Sair</button>
                  </div>

                  <div class="pedido-summary">
                    <article class="summary-chip">
                      <strong id="pedido-total-count">0</strong>
                      <span>Pedidos</span>
                    </article>
                    <article class="summary-chip">
                      <strong id="pedido-open-count">0</strong>
                      <span>Em aberto</span>
                    </article>
                    <article class="summary-chip">
                      <strong id="pedido-high-count">0</strong>
                      <span>Alta prioridade</span>
                    </article>
                  </div>

                  <p id="pedido-empty-state" class="empty-state">Nenhum pedido cadastrado ate o momento.</p>

                  <div class="pedido-table-wrap">
                    <table class="pedido-table">
                      <thead>
                        <tr>
                          <th>Solicitante</th>
                          <th>Animal</th>
                          <th>Pedido</th>
                          <th>Entrega</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody id="pedido-admin-list"></tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>
          </article>
        </div>
      </section>

      <section id="contato" class="aba">
        <article class="card">
          <p class="card__label">Central</p>
          <h3>Contato do atendimento</h3>
          <p class="contato-linha"><strong>Telefone:</strong> (11) 4002-8922</p>
          <p class="contato-linha"><strong>E-mail:</strong> contato@vac-app.local</p>
          <p class="contato-linha"><strong>Horario:</strong> atendimento comunitario 24 horas</p>
        </article>
      </section>

      <section id="cadastro" class="aba">
        <article class="card">
          <p class="card__label">Novo registro</p>
          <h3>Relatar animal</h3>

          <form id="formAnimal" class="formulario formulario-animal">
            <label class="campo">
              <span>Nome do animal</span>
              <input id="nomeAnimal" name="nomeAnimal" type="text" placeholder="Ex.: Mel" required>
            </label>

            <label class="campo">
              <span>Especie</span>
              <select id="especie" name="especie" required>
                <option value="Cachorro">Cachorro</option>
                <option value="Gato">Gato</option>
                <option value="Silvestre">Silvestre</option>
              </select>
            </label>

            <label class="campo">
              <span>Local onde vive</span>
              <input id="localAnimal" name="localAnimal" type="text" placeholder="Rua, bairro ou ponto de referencia" required>
            </label>

            <label class="campo">
              <span>Estado de saude</span>
              <select id="saudeAnimal" name="saudeAnimal" required>
                <option value="Saudavel">Saudavel</option>
                <option value="Ferido">Ferido</option>
                <option value="Doente">Doente</option>
              </select>
            </label>

            <label class="campo">
              <span>Descricao</span>
              <textarea id="descAnimal" name="descAnimal" rows="4" placeholder="Detalhes importantes sobre o animal" required></textarea>
            </label>

            <button type="submit">Registrar animal</button>
          </form>

          <p id="statusCadastro" class="status" aria-live="polite"></p>
        </article>
      </section>
    </section>
  </main>
</body>
</html>

