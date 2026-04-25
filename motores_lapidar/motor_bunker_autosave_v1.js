/*
  Lapidar — Motor Bunker Autosave v1
  Motor central leve para salvamento automático real da obra.

  Função:
  - salvar por intervalo;
  - salvar por evento;
  - salvar ao trocar módulo;
  - salvar ao trocar capítulo;
  - salvar antes de sair/atualizar a página;
  - criar snapshots incrementais leves;
  - recuperar último estado da obra.

  Dependência opcional:
  - LapidarMotorProjeto v1, se existir.
*/

(function(){
  const CHAVE_ESTADO = "lapidar_bunker_estado_v1";
  const CHAVE_SNAPSHOTS = "lapidar_bunker_snapshots_v1";
  const LIMITE_SNAPSHOTS = 12;
  let timer = null;
  let coletorAtual = null;
  let ultimoHash = "";

  function agora(){ return new Date().toISOString(); }

  function gerarId(){
    return "BUNKER-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2,6).toUpperCase();
  }

  function hashLeve(obj){
    try{
      const s = JSON.stringify(obj || {});
      let h = 0;
      for(let i=0;i<s.length;i++) h = ((h<<5)-h) + s.charCodeAt(i) | 0;
      return String(h);
    }catch(e){ return String(Date.now()); }
  }

  function normalizarEstado(dados={}, motivo="autosave"){
    const anterior = carregarEstado(false) || {};
    return {
      id:dados.id || anterior.id || gerarId(),
      titulo:dados.titulo || anterior.titulo || "Obra sem título",
      autor:dados.autor || anterior.autor || "Autor não informado",
      texto: typeof dados.texto === "string" ? dados.texto : (anterior.texto || ""),
      moduloAtual:dados.moduloAtual || anterior.moduloAtual || "indefinido",
      capituloAtual:dados.capituloAtual || anterior.capituloAtual || "",
      formato:dados.formato || anterior.formato || "16x23",
      tipoEstrutural:dados.tipoEstrutural || anterior.tipoEstrutural || "indefinido",
      configuracoes:Object.assign({}, anterior.configuracoes || {}, dados.configuracoes || {}),
      metadados:Object.assign({}, anterior.metadados || {}, dados.metadados || {}),
      estatisticas:Object.assign({}, anterior.estatisticas || {}, dados.estatisticas || {}),
      criadoEm:anterior.criadoEm || dados.criadoEm || agora(),
      atualizadoEm:agora(),
      ultimoMotivo:motivo,
      motor:"Lapidar.MotorBunkerAutosave.v1"
    };
  }

  function salvarEstado(dados={}, motivo="autosave"){
    const estado = normalizarEstado(dados, motivo);
    const h = hashLeve(estado);
    if(h === ultimoHash && motivo === "autosave_intervalo") return estado;
    ultimoHash = h;

    try{
      localStorage.setItem(CHAVE_ESTADO, JSON.stringify(estado));
      criarSnapshot(estado, motivo);
      if(window.LapidarMotorProjeto && typeof window.LapidarMotorProjeto.salvarProjeto === "function"){
        window.LapidarMotorProjeto.salvarProjeto(estado, motivo);
      }
      emitir("lapidar:bunker-salvo", estado);
      return estado;
    }catch(e){
      console.error("Erro no Bunker Autosave", e);
      emitir("lapidar:bunker-erro", { erro:String(e), motivo });
      return null;
    }
  }

  function carregarEstado(disparar=true){
    try{
      const bruto = localStorage.getItem(CHAVE_ESTADO);
      if(!bruto) return null;
      const estado = JSON.parse(bruto);
      if(disparar) emitir("lapidar:bunker-carregado", estado);
      return estado;
    }catch(e){ return null; }
  }

  function criarSnapshot(estado, motivo){
    if(!estado) return;
    if(!["mudou_modulo","mudou_capitulo","saida_pagina","salvamento_manual","importacao"].includes(motivo)) return;
    try{
      const bruto = localStorage.getItem(CHAVE_SNAPSHOTS);
      const lista = bruto ? JSON.parse(bruto) : [];
      lista.unshift({
        id:estado.id,
        titulo:estado.titulo,
        moduloAtual:estado.moduloAtual,
        capituloAtual:estado.capituloAtual,
        tipoEstrutural:estado.tipoEstrutural,
        formato:estado.formato,
        texto:estado.texto,
        configuracoes:estado.configuracoes,
        metadados:estado.metadados,
        estatisticas:estado.estatisticas,
        motivo,
        criadoEm:agora()
      });
      localStorage.setItem(CHAVE_SNAPSHOTS, JSON.stringify(lista.slice(0,LIMITE_SNAPSHOTS)));
    }catch(e){}
  }

  function listarSnapshots(){
    try{ return JSON.parse(localStorage.getItem(CHAVE_SNAPSHOTS) || "[]"); }
    catch(e){ return []; }
  }

  function restaurarSnapshot(indice=0){
    const lista = listarSnapshots();
    const item = lista[indice];
    if(!item) return null;
    return salvarEstado(item, "restaurar_snapshot");
  }

  function iniciar(coletor, intervaloMs=20000){
    parar();
    if(typeof coletor !== "function"){
      console.warn("Motor Bunker: coletor ausente.");
      return null;
    }
    coletorAtual = coletor;
    salvarEstado(coletorAtual(), "inicio_autosave");
    timer = setInterval(()=>{
      try{ salvarEstado(coletorAtual(), "autosave_intervalo"); }catch(e){}
    }, intervaloMs);
    prepararSaidaPagina();
    return timer;
  }

  function parar(){
    if(timer){ clearInterval(timer); timer = null; }
  }

  function salvarAgora(motivo="salvamento_manual"){
    if(typeof coletorAtual === "function") return salvarEstado(coletorAtual(), motivo);
    return salvarEstado({}, motivo);
  }

  function mudouModulo(moduloAtual, dados={}){
    return salvarEstado(Object.assign({}, dados, { moduloAtual }), "mudou_modulo");
  }

  function mudouCapitulo(capituloAtual, dados={}){
    return salvarEstado(Object.assign({}, dados, { capituloAtual }), "mudou_capitulo");
  }

  function prepararSaidaPagina(){
    if(window.__lapidarBunkerSaidaRegistrada) return;
    window.__lapidarBunkerSaidaRegistrada = true;
    window.addEventListener("beforeunload", ()=>{
      try{
        if(typeof coletorAtual === "function") salvarEstado(coletorAtual(), "saida_pagina");
        else salvarEstado({}, "saida_pagina");
      }catch(e){}
    });
    document.addEventListener("visibilitychange", ()=>{
      if(document.visibilityState === "hidden"){
        try{ salvarAgora("pagina_oculta"); }catch(e){}
      }
    });
  }

  function exportarBunker(){
    const estado = carregarEstado(false);
    if(!estado){ alert("Nenhuma obra salva no Bunker."); return; }
    const pacote = {
      estado,
      snapshots:listarSnapshots(),
      exportadoEm:agora(),
      motor:"Lapidar.MotorBunkerAutosave.v1"
    };
    const blob = new Blob([JSON.stringify(pacote,null,2)], {type:"application/json;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const nome = (estado.titulo || "bunker_lapidar").replace(/[^a-z0-9\-_]+/gi,"_").toLowerCase();
    a.href = url;
    a.download = nome + "_bunker.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function emitir(nome, detalhe){
    try{ window.dispatchEvent(new CustomEvent(nome,{detail:detalhe})); }catch(e){}
  }

  window.LapidarMotorBunkerAutosave = {
    iniciar,
    parar,
    salvarAgora,
    salvarEstado,
    carregarEstado,
    mudouModulo,
    mudouCapitulo,
    listarSnapshots,
    restaurarSnapshot,
    exportarBunker
  };
})();
