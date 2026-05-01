/*
  Motor de Progressão Pedagógica — Caminho das Pedras
  Instituto Cultural Celeiro Literário / Site das Letras

  REGRAS INSTITUCIONAIS:
  - Motor invisível para comum/cortesia.
  - Visível apenas para Admin, Wagner Planas, Heterônimo e engenharia técnica.
  - Execução pedagógica só após confirmação Hotmart.
  - Curso completo = 8 módulos.
  - Pagamento integral libera 8 módulos.
  - Pagamento em 4 etapas libera 2 módulos por etapa.
  - Certificado só após conclusão dos 8 módulos + pagamento total + nota mínima.
  - Segunda tentativa é dirigida apenas aos pontos em que o aluno errou.
*/
(function(){
  const STORAGE_KEY = 'celeiro_cdp_estado';
  const EVENTOS_KEY = 'celeiro_cdp_eventos';
  const NOTA_MINIMA = 7;
  const TOTAL_MODULOS = 8;
  const MODULOS_POR_PARCELA = 2;
  const MAX_TENTATIVAS = 2;

  const trilhas = {
    prosa: {
      agente: 'Senhorita Kaneta',
      titulo: 'Trilha de Prosa',
      descricao: 'Da história infantil à ficção científica, fantasia, terror, conto, romance e formas contemporâneas de prosa.',
      modulos: [
        {id:'prosa_01', titulo:'Fundamentos da narrativa', criterios:['clareza','personagem','conflito','estrutura']},
        {id:'prosa_02', titulo:'Cena, ritmo e conflito', criterios:['cena','ritmo','conflito_interno','progressao']},
        {id:'prosa_03', titulo:'Personagens e mundo narrativo', criterios:['motivacao','ambientacao','coerencia','voz']},
        {id:'prosa_04', titulo:'Gêneros narrativos', criterios:['genero','tom','originalidade','adequacao']},
        {id:'prosa_05', titulo:'Diálogo e imersão', criterios:['dialogo','naturalidade','subtexto','fluidez']},
        {id:'prosa_06', titulo:'Revisão autoral', criterios:['coesao','clareza','estilo','acabamento']},
        {id:'prosa_07', titulo:'Projeto literário', criterios:['unidade','forca_autoral','estrutura_final','leitor']},
        {id:'prosa_08', titulo:'Conclusão e publicação', criterios:['prontidao','apresentacao','sinopse','trajetoria']}
      ]
    },
    poesia: {
      agente: 'Mestre Pena',
      titulo: 'Trilha de Poesia',
      descricao: 'Da cantiga infantil ao haicai, pantum, ghazal, formas clássicas e Novo Movimento Estrofista.',
      modulos: [
        {id:'poesia_01', titulo:'Fundamentos poéticos', criterios:['imagem','ritmo','musicalidade','unidade']},
        {id:'poesia_02', titulo:'Formas breves', criterios:['concisão','imagem','cadencia','impacto']},
        {id:'poesia_03', titulo:'Formas clássicas e internacionais', criterios:['forma','repeticao','metro','coerencia']},
        {id:'poesia_04', titulo:'Haicai, pantum e ghazal', criterios:['estrutura','tradicao','efeito','precisao']},
        {id:'poesia_05', titulo:'Voz poética', criterios:['voz','tom','identidade','densidade']},
        {id:'poesia_06', titulo:'Novo Movimento Estrofista', criterios:['estrutura_estrofica','progressao','identidade','forca']},
        {id:'poesia_07', titulo:'Livro de poemas', criterios:['sequencia','unidade','respiro','curadoria']},
        {id:'poesia_08', titulo:'Conclusão e publicação poética', criterios:['acabamento','apresentacao','biografia','trajetoria']}
      ]
    }
  };

  function perfil(){
    const bruto = (localStorage.getItem('celeiro_perfil_usuario') || localStorage.getItem('celeiro_perfil') || 'comum').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const mapa = {usuario:'comum',user:'comum',autor:'comum',comum:'comum',cortesia:'cortesia',heteronimo:'heteronimo',admin:'admin',administrador:'admin',wagner:'wagner',wagnerplanas:'wagner','wagner planas':'wagner'};
    return mapa[bruto] || 'comum';
  }

  function podeVerMotor(){ return ['admin','heteronimo','wagner'].includes(perfil()); }

  function ler(chave, fallback){ try{return JSON.parse(localStorage.getItem(chave)||JSON.stringify(fallback));}catch(e){return fallback;} }
  function salvar(chave, valor){ localStorage.setItem(chave, JSON.stringify(valor)); }
  function agora(){ return new Date().toISOString(); }

  function hotmart(){
    const integral = localStorage.getItem('hotmart_cdp_integral_confirmado') === 'sim' || localStorage.getItem('celeiro_hotmart_integral') === 'confirmado';
    const parcelas = Number(localStorage.getItem('hotmart_cdp_parcelas_confirmadas') || localStorage.getItem('celeiro_hotmart_parcelas_confirmadas') || 0);
    const modulosLiberados = integral ? TOTAL_MODULOS : Math.min(TOTAL_MODULOS, parcelas * MODULOS_POR_PARCELA);
    return {integral, parcelasConfirmadas: parcelas, modulosLiberados, confirmado: integral || parcelas > 0};
  }

  function estadoInicial(){ return {criadoEm:agora(), trilha:null, moduloIndice:0, historico:[], revisoesPendentes:[], certificado:null}; }
  function estado(){ return ler(STORAGE_KEY, estadoInicial()); }
  function salvarEstado(e){ salvar(STORAGE_KEY, e); return e; }
  function evento(tipo,dados){ const eventos=ler(EVENTOS_KEY,[]); const evt={id:'cdp_evt_'+Date.now(),tipo,criadoEm:agora(),dados:dados||{}}; eventos.unshift(evt); salvar(EVENTOS_KEY,eventos.slice(0,500)); return evt; }

  function escolherTrilha(trilha){
    if(!trilhas[trilha]) throw new Error('Trilha inválida.');
    const acesso = hotmart();
    if(!acesso.confirmado) return {bloqueado:true, motivo:'hotmart_nao_confirmado', mensagem:'A trilha só inicia após confirmação Hotmart.'};
    const e = estado(); e.trilha = trilha; e.moduloIndice = 0; e.revisoesPendentes = []; evento('trilha_escolhida',{trilha,agente:trilhas[trilha].agente}); return salvarEstado(e);
  }

  function moduloAtual(){
    const e = estado(); if(!e.trilha) return null;
    return trilhas[e.trilha].modulos[e.moduloIndice] || null;
  }

  function acessoModulo(){
    const e = estado(); const acesso = hotmart();
    const liberado = e.trilha && acesso.confirmado && e.moduloIndice < acesso.modulosLiberados;
    return {...acesso, moduloIndice:e.moduloIndice, liberado};
  }

  function calcularNota(av){ const vals=Object.values(av||{}).map(Number).filter(n=>!Number.isNaN(n)); return vals.length ? Number((vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2)) : 0; }
  function pontosFracos(av){ return Object.entries(av||{}).filter(([,n])=>Number(n)<NOTA_MINIMA).map(([criterio,nota])=>({criterio,nota:Number(nota),minimo:NOTA_MINIMA})); }

  function avaliar(payload){
    const e = estado(); const acesso = acessoModulo();
    if(!acesso.liberado) return {bloqueado:true, motivo:'modulo_nao_liberado_ou_hotmart_pendente', acesso};
    const modulo = moduloAtual();
    const tentativa = e.historico.filter(h=>h.moduloId===modulo.id).length + 1;
    const av = payload.avaliacaoPorCriterio || {};
    const fracos = pontosFracos(av);
    const nota = calcularNota(av);
    const aprovado = nota >= NOTA_MINIMA && fracos.length === 0;
    const registro = {id:'avaliacao_'+Date.now(), criadoEm:agora(), trilha:e.trilha, agente:trilhas[e.trilha].agente, moduloId:modulo.id, moduloTitulo:modulo.titulo, tentativa, nota, notaMinima:NOTA_MINIMA, avaliacaoPorCriterio:av, pontosFracos:fracos, aprovado, textoAluno:payload.textoAluno||''};
    e.historico.push(registro);
    if(aprovado){ e.revisoesPendentes=[]; e.moduloIndice += 1; evento('modulo_aprovado',registro); }
    else { e.revisoesPendentes = fracos.map(f=>({...f, moduloId:modulo.id, status:'revisao_pendente'})); evento('revisao_dirigida',registro); }
    if(e.moduloIndice >= TOTAL_MODULOS && hotmart().modulosLiberados >= TOTAL_MODULOS){ e.certificado = {status:'liberado_para_emissao', liberadoEm:agora(), trilha:e.trilha, titulo:'Certificado de Conclusão — '+trilhas[e.trilha].titulo}; evento('certificado_liberado',e.certificado); }
    salvarEstado(e); return registro;
  }

  function segundaTentativa(payload){
    const e = estado(); if(!e.revisoesPendentes.length) return {bloqueado:true, motivo:'sem_revisao_pendente'};
    const modulo = moduloAtual(); const tentativas=e.historico.filter(h=>h.moduloId===modulo.id).length;
    if(tentativas >= MAX_TENTATIVAS) return {bloqueado:true, motivo:'limite_de_tentativas'};
    const permitidos = e.revisoesPendentes.map(r=>r.criterio); const recebido=payload.avaliacaoPorCriterio||{}; const filtrado={};
    permitidos.forEach(c=>{ if(Object.prototype.hasOwnProperty.call(recebido,c)) filtrado[c]=recebido[c]; });
    return avaliar({...payload, avaliacaoPorCriterio:filtrado, segundaTentativaDirigida:true});
  }

  function proximaAcao(){
    const e=estado(); const acesso=acessoModulo();
    if(!hotmart().confirmado) return {tipo:'hotmart', mensagem:'Apresentar curso e encaminhar para Hotmart antes de liberar o motor.'};
    if(!e.trilha) return {tipo:'escolher_trilha', mensagem:'Diretor Lápiz apresenta Prosa e Poesia.'};
    if(e.revisoesPendentes.length) return {tipo:'revisao_dirigida', pontos:e.revisoesPendentes, mensagem:'Revisar somente os pontos indicados.'};
    if(e.certificado) return {tipo:'certificado', certificado:e.certificado};
    if(!acesso.liberado) return {tipo:'aguardar_pagamento', acesso, mensagem:'Próximos módulos serão liberados após nova confirmação Hotmart.'};
    return {tipo:'atividade', modulo:moduloAtual(), agente:trilhas[e.trilha].agente};
  }

  function resetar(){ salvarEstado(estadoInicial()); evento('reset',{}); }

  window.MotorCaminhoDasPedras = {trilhas,podeVerMotor,perfil,hotmart,estado,escolherTrilha,moduloAtual,acessoModulo,avaliar,segundaTentativa,proximaAcao,resetar,config:{TOTAL_MODULOS,MODULOS_POR_PARCELA,MAX_TENTATIVAS,NOTA_MINIMA}};
})();
