/*
  Motor Silo HQ — Celeiro Literário / Lapidar

  Função:
  - preparar adaptação editorial para HQ / Mangá / Graphic Novel;
  - dividir texto em quadros narrativos;
  - sugerir ritmo visual sequencial;
  - estimar páginas de HQ;
  - preparar integração com Barracão de Polimento das Imagens.

  Este motor NÃO desenha HQ automaticamente.
  Ele estrutura o roteiro sequencial visual.
*/

(function(){

  const formatosHQ = {
    tirinha:{ nome:"Tirinha", quadrosPorPagina:3 },
    revista:{ nome:"Revista HQ", quadrosPorPagina:5 },
    graphicNovel:{ nome:"Graphic Novel", quadrosPorPagina:6 },
    manga:{ nome:"Mangá", quadrosPorPagina:7 }
  };

  function normalizar(texto){
    return String(texto || "")
      .replace(/\r\n/g,"\n")
      .replace(/\r/g,"\n")
      .trim();
  }

  function dividirBlocosNarrativos(texto){
    const limpo = normalizar(texto);
    if(!limpo) return [];

    return limpo
      .split(/\n{2,}/)
      .map((b,i)=>({ id:`bloco-${i+1}`, texto:b.trim() }))
      .filter(b=>b.texto);
  }

  function estimarQuadros(texto){
    const blocos = dividirBlocosNarrativos(texto);

    return blocos.map((b,i)=>({
      quadro:i+1,
      baseNarrativa:b.texto.slice(0,160),
      funcao:"quadro sequencial sugerido",
      observacao:"Refinar diálogo e enquadramento na etapa visual."
    }));
  }

  function estimarPaginasHQ(texto, formato="revista"){
    const blocos = dividirBlocosNarrativos(texto);

    const quadrosPorPagina =
      formatosHQ[formato]
      ? formatosHQ[formato].quadrosPorPagina
      : formatosHQ.revista.quadrosPorPagina;

    const paginas = Math.ceil(blocos.length / quadrosPorPagina);

    return paginas;
  }

  function sugerirLeituraVisual(campoEmocional){

    const mapa = {
      contemplativo:"quadros amplos e silenciosos",
      dramático:"cortes rápidos e close emocional",
      épico:"planos abertos e movimento sequencial",
      lírico:"quadros simbólicos e composição poética",
      cotidiano:"sequência naturalista",
      suspense:"sombras progressivas e enquadramentos fechados",
      espiritual:"quadros verticais e luz simbólica",
      neutro:"sequência equilibrada"
    };

    return mapa[campoEmocional] || mapa.neutro;

  }

  function obterCampoEmocional(texto, opcoes={}){

    if(opcoes.campoEmocional)
      return opcoes.campoEmocional;

    if(window.CeleiroMotorAvaliadorEmocional)
      return window
        .CeleiroMotorAvaliadorEmocional
        .analisarImpactoEmocional(texto)
        .dominante;

    return "neutro";

  }

  function analisarProjetoHQ(texto, opcoes={}){

    const formato = opcoes.formato || "revista";

    const quadros = estimarQuadros(texto);

    const paginas = estimarPaginasHQ(texto, formato);

    const campo = obterCampoEmocional(texto, opcoes);

    const linguagemVisual = sugerirLeituraVisual(campo);

    return {
      tipo:"silo_hq",
      formatoHQ:formatosHQ[formato] || formatosHQ.revista,
      paginasEstimadas:paginas,
      quadrosSugeridos:quadros.slice(0,12),
      campoEmocional:campo,
      linguagemVisual,
      observacao:"Projeto preparado para adaptação sequencial HQ dentro do Silo HQ."
    };

  }

  window.CeleiroMotorSiloHQ = {
    formatosHQ,
    dividirBlocosNarrativos,
    estimarQuadros,
    estimarPaginasHQ,
    sugerirLeituraVisual,
    analisarProjetoHQ
  };

})();
