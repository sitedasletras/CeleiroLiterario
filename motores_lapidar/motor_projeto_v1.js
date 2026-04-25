/*
  Lapidar — Motor de Projeto v1
  Salvamento automático leve para obra editorial.

  Função:
  - salvar projeto no navegador;
  - autosave por intervalo;
  - autosave por evento;
  - exportar/importar .json;
  - servir de base para o Bunker da Obra.

  Compatível com:
  - Bolsão
  - Pólux
  - Castor
  - Centauro
  - Qui(RON)xadá
  - Faça Kapa
*/

(function(){
  const CHAVE_ATUAL = "lapidar_projeto_atual_v1";
  const CHAVE_HISTORICO = "lapidar_historico_projetos_v1";
  let intervaloAutosave = null;

  function agora(){
    return new Date().toISOString();
  }

  function gerarId(){
    return "LAP-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2,7).toUpperCase();
  }

  function projetoBase(dados={}){
    const existente = carregarProjeto(false) || {};
    return {
      id: dados.id || existente.id || gerarId(),
      titulo: dados.titulo || existente.titulo || "Obra sem título",
      autor: dados.autor || existente.autor || "Autor não informado",
      texto: typeof dados.texto === "string" ? dados.texto : (existente.texto || ""),
      tipoEstrutural: dados.tipoEstrutural || existente.tipoEstrutural || "indefinido",
      moduloAtual: dados.moduloAtual || existente.moduloAtual || "bolsao",
      capituloAtual: dados.capituloAtual || existente.capituloAtual || "",
      formato: dados.formato || existente.formato || "16x23",
      configuracoes: Object.assign({}, existente.configuracoes || {}, dados.configuracoes || {}),
      metadados: Object.assign({}, existente.metadados || {}, dados.metadados || {}),
      estatisticas: Object.assign({}, existente.estatisticas || {}, dados.estatisticas || {}),
      criadoEm: existente.criadoEm || dados.criadoEm || agora(),
      atualizadoEm: agora(),
      historicoEventos: Array.isArray(existente.historicoEventos) ? existente.historicoEventos.slice(-80) : []
    };
  }

  function salvarProjeto(dados={}, motivo="salvamento_manual"){
    const projeto = projetoBase(dados);
    projeto.historicoEventos.push({ motivo, em: agora(), modulo: projeto.moduloAtual });
    projeto.historicoEventos = projeto.historicoEventos.slice(-100);

    try{
      localStorage.setItem(CHAVE_ATUAL, JSON.stringify(projeto));
      salvarNoHistorico(projeto);
      dispararEvento("lapidar:projeto-salvo", projeto);
      return projeto;
    }catch(e){
      console.error("Erro ao salvar projeto", e);
      dispararEvento("lapidar:erro-salvamento", { erro:String(e) });
      return null;
    }
  }

  function carregarProjeto(disparar=true){
    try{
      const bruto = localStorage.getItem(CHAVE_ATUAL);
      if(!bruto) return null;
      const projeto = JSON.parse(bruto);
      if(disparar) dispararEvento("lapidar:projeto-carregado", projeto);
      return projeto;
    }catch(e){
      console.error("Erro ao carregar projeto", e);
      return null;
    }
  }

  function salvarNoHistorico(projeto){
    try{
      const bruto = localStorage.getItem(CHAVE_HISTORICO);
      const lista = bruto ? JSON.parse(bruto) : [];
      const resumo = {
        id: projeto.id,
        titulo: projeto.titulo,
        autor: projeto.autor,
        tipoEstrutural: projeto.tipoEstrutural,
        moduloAtual: projeto.moduloAtual,
        atualizadoEm: projeto.atualizadoEm
      };
      const filtrada = lista.filter(p=>p.id !== projeto.id);
      filtrada.unshift(resumo);
      localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(filtrada.slice(0,20)));
    }catch(e){}
  }

  function listarHistorico(){
    try{
      return JSON.parse(localStorage.getItem(CHAVE_HISTORICO) || "[]");
    }catch(e){ return []; }
  }

  function iniciarAutosave(coletor, intervaloMs=20000){
    pararAutosave();
    if(typeof coletor !== "function"){
      console.warn("LapidarMotorProjeto: coletor de dados ausente. Autosave não iniciado.");
      return;
    }
    intervaloAutosave = setInterval(()=>{
      const dados = coletor();
      salvarProjeto(dados, "autosave_intervalo");
    }, intervaloMs);
    return intervaloAutosave;
  }

  function pararAutosave(){
    if(intervaloAutosave){
      clearInterval(intervaloAutosave);
      intervaloAutosave = null;
    }
  }

  function registrarEvento(motivo, dados={}){
    return salvarProjeto(dados, motivo || "evento");
  }

  function exportarProjetoJSON(nomeArquivo){
    const projeto = carregarProjeto(false);
    if(!projeto){ alert("Nenhum projeto salvo para exportar."); return; }
    const blob = new Blob([JSON.stringify(projeto,null,2)], {type:"application/json;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const nomeSeguro = (nomeArquivo || projeto.titulo || "projeto-lapidar").replace(/[^a-z0-9\-_]+/gi,"_").toLowerCase();
    a.href = url;
    a.download = nomeSeguro + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importarProjetoJSON(arquivo, callback){
    if(!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = function(){
      try{
        const projeto = JSON.parse(leitor.result);
        if(!projeto || !projeto.id){ projeto.id = gerarId(); }
        projeto.atualizadoEm = agora();
        localStorage.setItem(CHAVE_ATUAL, JSON.stringify(projeto));
        salvarNoHistorico(projeto);
        dispararEvento("lapidar:projeto-importado", projeto);
        if(typeof callback === "function") callback(projeto);
      }catch(e){
        alert("Não foi possível importar este arquivo de projeto.");
        console.error(e);
      }
    };
    leitor.readAsText(arquivo, "utf-8");
  }

  function limparProjetoAtual(){
    localStorage.removeItem(CHAVE_ATUAL);
    dispararEvento("lapidar:projeto-limpo", {});
  }

  function dispararEvento(nome, detalhe){
    try{
      window.dispatchEvent(new CustomEvent(nome,{detail:detalhe}));
    }catch(e){}
  }

  window.LapidarMotorProjeto = {
    salvarProjeto,
    carregarProjeto,
    listarHistorico,
    iniciarAutosave,
    pararAutosave,
    registrarEvento,
    exportarProjetoJSON,
    importarProjetoJSON,
    limparProjetoAtual,
    gerarId
  };
})();
