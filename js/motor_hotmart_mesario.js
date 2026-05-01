/*
  Motor Universal Hotmart + Mesário
  Instituto Cultural Celeiro Literário / Site das Letras / SIGMAL / Lapidar

  Regra institucional:
  - Todo departamento, sessão ou módulo que use Mesário, Mesário Mor, CVR/CVMI,
    contribuição, pagamento, pacote, curso, módulo pago ou entrega final
    precisa de confirmação Hotmart antes de liberar execução/entrega.
  - Sem confirmação Hotmart: mostra apenas apresentação institucional, orçamento/convite
    e encaminhamento seguro para pagamento.
  - Com confirmação Hotmart: libera módulos correspondentes ao produto/plano confirmado.
  - Motores continuam invisíveis para comum/cortesia; a interface mostra só o necessário.
*/
(function(){
  const CHAVE_PEDIDOS = 'celeiro_hotmart_pedidos';
  const CHAVE_LIBERACOES = 'celeiro_hotmart_liberacoes';
  const CHAVE_EVENTOS = 'celeiro_hotmart_eventos_mesario';

  const MODULOS_COM_MESARIO = {
    caminho_das_pedras: {nome:'Caminho das Pedras', tipo:'curso', exigeHotmart:true},
    lapidar: {nome:'Lapidar', tipo:'editorial', exigeHotmart:true},
    polux: {nome:'Polux', tipo:'diagramacao', exigeHotmart:true},
    castor: {nome:'Castor', tipo:'diagramacao', exigeHotmart:true},
    centauro: {nome:'Centauro', tipo:'diagramacao', exigeHotmart:true},
    quiron_xada: {nome:'Quiron Xadá', tipo:'cordel', exigeHotmart:true},
    hercules: {nome:'Hércules', tipo:'infantil_visual', exigeHotmart:true},
    capista: {nome:'Capista', tipo:'capa', exigeHotmart:true},
    barracao: {nome:'Barracão de Polimento', tipo:'imagem', exigeHotmart:true},
    traducao: {nome:'Segunda Língua(s)', tipo:'traducao', exigeHotmart:true},
    avaliacao_literaria: {nome:'Avaliação Literária', tipo:'avaliacao', exigeHotmart:true},
    lapidacao_literaria: {nome:'Lapidação Literária', tipo:'lapidacao', exigeHotmart:true},
    silo_sonoro: {nome:'Silo Sonoro', tipo:'audio', exigeHotmart:true},
    silo_music: {nome:'Silo Music', tipo:'musica', exigeHotmart:true},
    silo_cinematografico: {nome:'Silo Cinematográfico', tipo:'video', exigeHotmart:true},
    silo_hq: {nome:'Silo HQ', tipo:'hq', exigeHotmart:true}
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
  function id(prefixo){ return prefixo + '_' + Date.now() + '_' + Math.random().toString(36).slice(2,8); }

  function evento(tipo, dados){
    const eventos = ler(CHAVE_EVENTOS, []);
    const evt = {id:id('hm_evt'), tipo, criadoEm:agora(), dados:dados||{}};
    eventos.unshift(evt);
    salvar(CHAVE_EVENTOS, eventos.slice(0,500));
    if(window.CeleiroWebhookAdmin && typeof window.CeleiroWebhookAdmin.registrarEvento === 'function'){
      window.CeleiroWebhookAdmin.registrarEvento({
        origem:'Motor Hotmart + Mesário',
        agente:'CICILE / Mesário Mor',
        tipo:'hotmart_mesario_'+tipo,
        titulo:'Evento Hotmart/Mesário registrado',
        mensagem:'O Motor Hotmart + Mesário registrou um evento operacional para acompanhamento administrativo.',
        dados:evt
      });
    }
    return evt;
  }

  function registrarPedido(payload){
    const pedidos = ler(CHAVE_PEDIDOS, []);
    const pedido = {
      id: payload.id || id('pedido'),
      criadoEm: agora(),
      modulo: payload.modulo,
      produtoHotmart: payload.produtoHotmart || '',
      plano: payload.plano || 'avulso',
      parcelasTotais: Number(payload.parcelasTotais || 1),
      parcelasConfirmadas: Number(payload.parcelasConfirmadas || 0),
      valor: payload.valor || null,
      status: payload.status || 'aguardando_hotmart',
      comprador: payload.comprador || {},
      metadados: payload.metadados || {}
    };
    pedidos.unshift(pedido);
    salvar(CHAVE_PEDIDOS, pedidos.slice(0,500));
    evento('pedido_registrado', pedido);
    return pedido;
  }

  function confirmarPagamento(payload){
    const pedidos = ler(CHAVE_PEDIDOS, []);
    const liberacoes = ler(CHAVE_LIBERACOES, {});
    let pedido = pedidos.find(p=>p.id===payload.pedidoId);
    if(!pedido){
      pedido = registrarPedido({
        id: payload.pedidoId || id('pedido'),
        modulo: payload.modulo,
        produtoHotmart: payload.produtoHotmart,
        plano: payload.plano,
        parcelasTotais: payload.parcelasTotais || 1,
        comprador: payload.comprador || {},
        status:'confirmado'
      });
    }
    pedido.status = 'confirmado';
    pedido.confirmadoEm = agora();
    pedido.parcelasConfirmadas = Number(payload.parcelasConfirmadas || pedido.parcelasTotais || 1);
    pedido.hotmartTransacao = payload.hotmartTransacao || pedido.hotmartTransacao || '';

    const modulo = payload.modulo || pedido.modulo;
    const integral = pedido.parcelasConfirmadas >= Number(pedido.parcelasTotais || 1);
    liberacoes[modulo] = {
      modulo,
      liberado:true,
      atualizadoEm:agora(),
      origem:'hotmart',
      plano:pedido.plano,
      integral,
      parcelasTotais:Number(pedido.parcelasTotais || 1),
      parcelasConfirmadas:pedido.parcelasConfirmadas,
      pedidoId:pedido.id,
      hotmartTransacao:pedido.hotmartTransacao || ''
    };

    salvar(CHAVE_PEDIDOS, pedidos);
    salvar(CHAVE_LIBERACOES, liberacoes);

    // Compatibilidade com motores já criados.
    if(modulo === 'caminho_das_pedras'){
      if(integral) localStorage.setItem('hotmart_cdp_integral_confirmado','sim');
      localStorage.setItem('hotmart_cdp_parcelas_confirmadas', String(pedido.parcelasConfirmadas));
    }
    localStorage.setItem('celeiro_hotmart_confirmado_'+modulo, 'sim');
    localStorage.setItem('celeiro_mesario_final_'+modulo, 'confirmado');

    evento('pagamento_confirmado', liberacoes[modulo]);
    return liberacoes[modulo];
  }

  function liberacao(modulo){
    const liberacoes = ler(CHAVE_LIBERACOES, {});
    return liberacoes[modulo] || null;
  }

  function estaLiberado(modulo){
    const config = MODULOS_COM_MESARIO[modulo];
    if(!config || !config.exigeHotmart) return true;
    const lib = liberacao(modulo);
    return !!(lib && lib.liberado);
  }

  function exigirHotmart(modulo, contexto){
    const config = MODULOS_COM_MESARIO[modulo] || {nome:modulo, exigeHotmart:true};
    if(!config.exigeHotmart) return {liberado:true, modulo, mensagem:'Módulo sem exigência Hotmart.'};
    const lib = liberacao(modulo);
    if(lib && lib.liberado) return {liberado:true, modulo, liberacao:lib, mensagem:'Acesso liberado por confirmação Hotmart.'};
    evento('acesso_bloqueado_sem_hotmart', {modulo, contexto:contexto||{}, config});
    return {
      liberado:false,
      modulo,
      nome:config.nome,
      motivo:'hotmart_nao_confirmado',
      mensagem:'Este módulo será liberado após confirmação de pagamento pela Hotmart.',
      acao:'encaminhar_para_hotmart'
    };
  }

  function simularConfirmacaoAdmin(modulo, parcelasConfirmadas, parcelasTotais){
    if(!podeVerMotor()) throw new Error('Simulação restrita ao núcleo interno.');
    return confirmarPagamento({
      pedidoId:id('sim_hotmart'),
      modulo,
      produtoHotmart:'SIMULACAO_ADMIN',
      plano:parcelasTotais && parcelasTotais>1 ? 'parcelado' : 'integral',
      parcelasTotais:parcelasTotais || 1,
      parcelasConfirmadas:parcelasConfirmadas || parcelasTotais || 1,
      hotmartTransacao:'SIMULADA_'+Date.now()
    });
  }

  window.MotorHotmartMesario = {
    MODULOS_COM_MESARIO,
    perfil,
    podeVerMotor,
    registrarPedido,
    confirmarPagamento,
    exigirHotmart,
    estaLiberado,
    liberacao,
    simularConfirmacaoAdmin,
    chaves:{CHAVE_PEDIDOS,CHAVE_LIBERACOES,CHAVE_EVENTOS}
  };
})();
