/*
  Celeiro Literário — Webhook Administrativo Interno
  Fase atual: fila local em navegador para ambiente estático.
  Fase futura: trocar persistência por POST para endpoint real sem mudar os departamentos.

  Regras:
  - Comum e cortesia não veem e não sabem que existe.
  - Heterônimo e Wagner podem acompanhar quando estiverem no Console Privado.
  - Somente Admin recebe/responde/interfere.
*/
(function(){
  const EVENTOS_KEY = 'celeiro_webhook_eventos_admin';
  const RESPOSTAS_KEY = 'celeiro_webhook_respostas_admin';

  function normalizarPerfil(valor){
    return String(valor||'comum').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  }

  function perfilAtual(){
    const bruto = localStorage.getItem('celeiro_perfil_usuario') || localStorage.getItem('celeiro_perfil') || 'comum';
    const p = normalizarPerfil(bruto);
    const mapa = {
      usuario:'comum', user:'comum', autor:'comum', comum:'comum', cortesia:'cortesia',
      heteronimo:'heteronimo', admin:'admin', administrador:'admin',
      wagner:'wagner', wagnerplanas:'wagner', wagner_planas:'wagner', 'wagner planas':'wagner'
    };
    return mapa[p] || 'comum';
  }

  function podeVerFila(){
    return ['admin','heteronimo','wagner'].includes(perfilAtual());
  }

  function podeResponder(){
    return perfilAtual() === 'admin';
  }

  function lerJson(chave, fallback){
    try{return JSON.parse(localStorage.getItem(chave)||JSON.stringify(fallback));}
    catch(e){return fallback;}
  }

  function salvarJson(chave, valor){
    localStorage.setItem(chave, JSON.stringify(valor));
  }

  function criarId(){
    return 'evt_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);
  }

  function registrarEvento(evento){
    const fila = lerJson(EVENTOS_KEY, []);
    const novo = {
      id: criarId(),
      criadoEm: new Date().toISOString(),
      status: 'pendente_admin',
      destino: 'perfil_admin',
      origem: evento.origem || 'Celeiro Literário',
      agente: evento.agente || 'CICILE',
      tipo: evento.tipo || 'registro_institucional',
      titulo: evento.titulo || 'Evento institucional',
      mensagem: evento.mensagem || '',
      dados: evento.dados || {},
      visivelPara: ['admin','heteronimo','wagner'],
      somenteAdminResponde: true
    };
    fila.unshift(novo);
    salvarJson(EVENTOS_KEY, fila.slice(0,500));
    return novo;
  }

  function listarEventos(){
    if(!podeVerFila()) return [];
    return lerJson(EVENTOS_KEY, []);
  }

  function responderEvento(id, resposta){
    if(!podeResponder()){
      throw new Error('Apenas o perfil Admin pode responder eventos institucionais.');
    }
    const fila = lerJson(EVENTOS_KEY, []);
    const respostas = lerJson(RESPOSTAS_KEY, []);
    const idx = fila.findIndex(e=>e.id===id);
    if(idx<0) throw new Error('Evento não encontrado.');
    const registroResposta = {
      id:'rsp_' + Date.now(),
      eventoId:id,
      respondidoEm:new Date().toISOString(),
      por:'Admin',
      resposta:String(resposta||'').trim()
    };
    fila[idx].status='respondido_admin';
    fila[idx].respondidoEm=registroResposta.respondidoEm;
    respostas.unshift(registroResposta);
    salvarJson(EVENTOS_KEY, fila);
    salvarJson(RESPOSTAS_KEY, respostas.slice(0,500));
    return registroResposta;
  }

  function eventoTesteCorsi(){
    return registrarEvento({
      origem:'CORSI',
      agente:'CORSI → CICILE',
      tipo:'teste_webhook_canais',
      titulo:'Teste de webhook institucional — criação de canais',
      mensagem:'CORSI informa à CICILE que o fluxo de criação/registro de canais de Rádio, WebTV e redes sociais foi inicializado. Evento destinado ao Admin; Heterônimo/Wagner apenas acompanham.',
      dados:{
        canais:['Web Rádio Celeiro Literário','Web TV Celeiro Literário','Redes sociais institucionais'],
        respostaPermitida:'Admin',
        etapa:'implantacao_inicial'
      }
    });
  }

  window.CeleiroWebhookAdmin = {
    registrarEvento,
    listarEventos,
    responderEvento,
    eventoTesteCorsi,
    podeVerFila,
    podeResponder,
    perfilAtual,
    chaves:{EVENTOS_KEY,RESPOSTAS_KEY}
  };
})();
