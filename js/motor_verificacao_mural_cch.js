/*
  Motor CCH — Verificação de Apoios, Elogios e Materiais Públicos
  CCH = CICILE + CORSI + HARMONY

  Escopo:
  - texto escrito
  - rádio / material sonoro
  - TV / audiovisual
  - análise combinada

  Regra institucional:
  - público e cortesia podem ver materiais e enviar apoio/elogios;
  - não há interação direta;
  - baixo calão, contatos pessoais, links e spam são barrados ou reservados ao Admin;
  - CICILE, CORSI e HARMONY analisam em profundidades diferentes.
*/
(function(){
  const FILA_KEY = 'celeiro_mural_cch_fila';
  const APROVADOS_KEY = 'celeiro_mural_cch_aprovados';
  const RESERVADOS_KEY = 'celeiro_mural_cch_reservados_admin';

  const palavrasBloqueadas = [
    'puta','puto','caralho','porra','merda','bosta','desgraçado','desgracado','fdp','vai tomar','cacete',
    'idiota','imbecil','burro','otário','otario','lixo','golpe','fraude'
  ];

  const regexEmail = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
  const regexTelefone = /(\+?55\s?)?(\(?\d{2}\)?\s?)?9?\d{4}[-\s]?\d{4}/;
  const regexLink = /(https?:\/\/|www\.|\.com\b|\.br\b|\.net\b|\.org\b)/i;
  const regexRedeSocial = /(@[a-z0-9_.]{3,}|instagram|whatsapp|zap|telegram|tiktok|youtube\.com|youtu\.be)/i;

  function ler(chave, fallback){
    try{return JSON.parse(localStorage.getItem(chave)||JSON.stringify(fallback));}
    catch(e){return fallback;}
  }

  function salvar(chave, valor){
    localStorage.setItem(chave, JSON.stringify(valor));
  }

  function id(prefixo){
    return prefixo + '_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);
  }

  function limparTexto(texto){
    return String(texto||'').replace(/\s+/g,' ').trim();
  }

  function contemBaixoCalao(texto){
    const base = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    return palavrasBloqueadas.some(p=>base.includes(p.normalize('NFD').replace(/[\u0300-\u036f]/g,'')));
  }

  function detectarContato(texto){
    return regexEmail.test(texto) || regexTelefone.test(texto) || regexRedeSocial.test(texto);
  }

  function detectarLink(texto){
    return regexLink.test(texto);
  }

  function cicileAnalisa(entrada){
    const texto = limparTexto(entrada.texto || entrada.transcricao || entrada.descricao || '');
    const problemas = [];
    if(texto.length < 3) problemas.push('mensagem_vazia_ou_curta');
    if(contemBaixoCalao(texto)) problemas.push('baixo_calao_ou_agressao');
    if(detectarContato(texto)) problemas.push('contato_pessoal_detectado');
    if(detectarLink(texto)) problemas.push('link_externo_detectado');
    return {
      agente:'CICILE',
      profundidade:'acolhimento_institucional_e_limpeza_basica',
      aprovado: !problemas.includes('baixo_calao_ou_agressao') && !problemas.includes('mensagem_vazia_ou_curta'),
      reservarAdmin: problemas.includes('contato_pessoal_detectado') || problemas.includes('link_externo_detectado'),
      problemas
    };
  }

  function corsiAnalisa(entrada){
    const tipo = entrada.tipoMidia || 'escrito';
    const problemas = [];
    if(['radio','sonoro','audio','todos'].includes(tipo) && entrada.duracaoSegundos && entrada.duracaoSegundos > 600){
      problemas.push('audio_longo_para_apreciacao_publica');
    }
    if(['tv','video','audiovisual','todos'].includes(tipo) && entrada.duracaoSegundos && entrada.duracaoSegundos > 900){
      problemas.push('video_longo_para_apreciacao_publica');
    }
    if(entrada.autorizacaoDifusao === false || entrada.autorizacaoDifusao === 'nao'){
      problemas.push('sem_autorizacao_de_difusao');
    }
    return {
      agente:'CORSI',
      profundidade:'circulacao_publica_radio_tv_redes',
      aprovado: !problemas.includes('sem_autorizacao_de_difusao'),
      reservarAdmin: problemas.length > 0,
      problemas
    };
  }

  function harmonyAnalisa(entrada){
    const texto = limparTexto(entrada.texto || entrada.transcricao || entrada.descricao || '');
    const problemas = [];
    const tags = [];
    if(/parab[eé]ns|adorei|apoio|excelente|bonito|emocionante|incr[ií]vel/i.test(texto)) tags.push('apoio_positivo');
    if(/publicar|parceria|convite|proposta|contrato|evento/i.test(texto)){
      tags.push('potencial_oportunidade');
      problemas.push('avaliar_oportunidade_com_admin');
    }
    return {
      agente:'HARMONY',
      profundidade:'memoria_catalogo_reputacao_e_acervo',
      aprovado: true,
      reservarAdmin: problemas.length > 0,
      problemas,
      tags
    };
  }

  function verificar(entrada){
    const registro = {
      id:id('cch'),
      criadoEm:new Date().toISOString(),
      origemPerfil:entrada.origemPerfil || 'publico',
      tipoMidia:entrada.tipoMidia || 'escrito',
      destino:entrada.destino || 'mural_publico',
      texto:limparTexto(entrada.texto || entrada.transcricao || entrada.descricao || ''),
      metadados:entrada.metadados || {},
      analises:[]
    };
    const a1 = cicileAnalisa(entrada);
    const a2 = corsiAnalisa(entrada);
    const a3 = harmonyAnalisa(entrada);
    registro.analises = [a1,a2,a3];

    const bloqueado = registro.analises.some(a=>a.problemas.includes('baixo_calao_ou_agressao') || a.problemas.includes('mensagem_vazia_ou_curta') || a.problemas.includes('sem_autorizacao_de_difusao'));
    const reservado = registro.analises.some(a=>a.reservarAdmin);

    if(bloqueado){
      registro.status='bloqueado_cch';
      registro.visibilidade='invisivel_publico';
    }else if(reservado){
      registro.status='reservado_admin';
      registro.visibilidade='somente_admin_destinatario_autorizado';
    }else{
      registro.status='aprovado_mural';
      registro.visibilidade='mural_publico_sem_interacao';
    }

    const fila = ler(FILA_KEY, []);
    fila.unshift(registro);
    salvar(FILA_KEY, fila.slice(0,500));

    if(registro.status==='aprovado_mural'){
      const aprovados = ler(APROVADOS_KEY, []);
      aprovados.unshift(registro);
      salvar(APROVADOS_KEY, aprovados.slice(0,300));
    }

    if(registro.status==='reservado_admin' || registro.status==='bloqueado_cch'){
      const reservados = ler(RESERVADOS_KEY, []);
      reservados.unshift(registro);
      salvar(RESERVADOS_KEY, reservados.slice(0,300));
      if(window.CeleiroWebhookAdmin && typeof window.CeleiroWebhookAdmin.registrarEvento === 'function'){
        window.CeleiroWebhookAdmin.registrarEvento({
          origem:'Motor CCH',
          agente:'CICILE + CORSI + HARMONY',
          tipo:'verificacao_mural_publico',
          titulo:'Mensagem/material público exige análise administrativa',
          mensagem:'O Motor CCH classificou uma mensagem ou material como reservado/bloqueado. Apenas Admin pode responder ou liberar ação.',
          dados:registro
        });
      }
    }

    return registro;
  }

  function listarAprovados(){return ler(APROVADOS_KEY, []);}
  function listarFila(){return ler(FILA_KEY, []);}
  function listarReservados(){return ler(RESERVADOS_KEY, []);}

  window.MotorCCH = {
    verificar,
    listarAprovados,
    listarFila,
    listarReservados,
    agentes:['CICILE','CORSI','HARMONY'],
    escopos:['escrito','radio','tv','todos']
  };
})();
