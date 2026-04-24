/*
  Motor de Polimento de Imagens — Celeiro Literário
  Barracão de Polimento das Imagens

  Função:
  - preparar imagens para capa, miolo, cordel, Hércules e futuras saídas visuais;
  - manter processamento pesado fora dos capistas/diagramadores;
  - gerar diagnóstico editorial da imagem antes do uso.

  Observação:
  Esta primeira versão é leve e segura: trabalha com metadados, proporção,
  destino editorial e instruções de preparo. O tratamento visual profundo entra
  depois em camada própria do Barracão.
*/

(function(){
  const destinos = {
    capa_fisica: {
      nome:"Capa física",
      proporcaoLivre:true,
      exigeSangria:true,
      exigeAreaSegura:true,
      recomendacao:"Usar imagem com folga lateral e vertical para sangria, lombada e corte."
    },
    capa_epub: {
      nome:"Capa ePub",
      proporcao:"1:1.6",
      larguraMin:1600,
      alturaMin:2560,
      exigeSangria:false,
      exigeAreaSegura:true,
      recomendacao:"Priorizar leitura clara do título em miniatura."
    },
    miolo: {
      nome:"Imagem interna de miolo",
      proporcaoLivre:true,
      exigeSangria:false,
      exigeAreaSegura:true,
      recomendacao:"Evitar detalhes finos demais; manter contraste confortável."
    },
    cordel: {
      nome:"Cordel / xilogravura",
      proporcaoLivre:true,
      exigeSangria:true,
      exigeAreaSegura:true,
      recomendacao:"Converter para alto contraste preto e branco em etapa futura."
    },
    hercules: {
      nome:"Hércules / material visual",
      proporcaoLivre:true,
      exigeSangria:false,
      exigeAreaSegura:true,
      recomendacao:"Preparar imagem conforme tipo do material: infantil, receita, fotografia ou didático."
    },
    fotografia: {
      nome:"Livro de fotografia",
      proporcaoLivre:true,
      exigeSangria:true,
      exigeAreaSegura:true,
      recomendacao:"Preservar qualidade, foco e proporção original sempre que possível."
    }
  };

  function destino(nome){
    return destinos[nome] || destinos.miolo;
  }

  function numero(valor, fallback = 0){
    const n = Number(valor);
    return Number.isFinite(n) ? n : fallback;
  }

  function detectarOrientacao(largura, altura){
    largura = numero(largura);
    altura = numero(altura);
    if(!largura || !altura) return "indefinida";
    if(Math.abs(largura - altura) <= Math.max(largura, altura) * 0.05) return "quadrada";
    return largura > altura ? "horizontal" : "vertical";
  }

  function calcularProporcao(largura, altura){
    largura = numero(largura);
    altura = numero(altura);
    if(!largura || !altura) return null;
    return largura / altura;
  }

  function diagnosticarImagem(opcoes = {}){
    const largura = numero(opcoes.larguraPx);
    const altura = numero(opcoes.alturaPx);
    const destinoInfo = destino(opcoes.destino || "miolo");
    const orientacao = detectarOrientacao(largura, altura);
    const proporcao = calcularProporcao(largura, altura);
    const alertas = [];

    if(!largura || !altura){
      alertas.push("Informe largura e altura da imagem para diagnóstico técnico.");
    }

    if(opcoes.destino === "capa_epub"){
      if(largura && largura < destinoInfo.larguraMin) alertas.push(`Largura abaixo do recomendado para ePub (${destinoInfo.larguraMin}px).`);
      if(altura && altura < destinoInfo.alturaMin) alertas.push(`Altura abaixo do recomendado para ePub (${destinoInfo.alturaMin}px).`);
      if(proporcao && Math.abs(proporcao - 0.625) > 0.08) alertas.push("Proporção distante do padrão ePub 1:1.6; pode exigir corte ou margem.");
    }

    if(opcoes.destino === "cordel" && orientacao === "horizontal"){
      alertas.push("Imagem horizontal pode perder força em capa de cordel vertical; avaliar recorte.");
    }

    if(opcoes.destino === "fotografia" && (largura < 2000 || altura < 2000)){
      alertas.push("Livro de fotografia recomenda imagem maior para evitar perda de qualidade.");
    }

    return {
      destino: destinoInfo,
      larguraPx: largura,
      alturaPx: altura,
      orientacao,
      proporcao,
      alertas,
      recomendacao: destinoInfo.recomendacao
    };
  }

  function prepararParaDestino(opcoes = {}){
    const diagnostico = diagnosticarImagem(opcoes);
    const passos = [];

    if(diagnostico.destino.exigeSangria) passos.push("Reservar área de sangria antes de posicionar a imagem.");
    if(diagnostico.destino.exigeAreaSegura) passos.push("Manter rostos, títulos e elementos importantes dentro da área segura.");

    if(opcoes.destino === "cordel"){
      passos.push("Preparar versão de alto contraste para estética de xilogravura.");
      passos.push("Evitar excesso de cinza intermediário na saída final.");
    }

    if(opcoes.destino === "hercules"){
      passos.push("Identificar se a imagem será dominante, lateral, legenda ou apoio didático.");
      passos.push("Enviar metadados para o adaptador Hércules quando houver legenda.");
    }

    if(opcoes.destino === "capa_fisica"){
      passos.push("Conferir se a imagem cobre frente, contracapa ou capa aberta completa.");
      passos.push("Evitar elementos importantes próximos à lombada e ao corte.");
    }

    if(opcoes.destino === "capa_epub"){
      passos.push("Gerar frente vertical limpa, sem lombada e sem contracapa.");
      passos.push("Testar leitura do título em miniatura.");
    }

    return {
      diagnostico,
      passos,
      status: diagnostico.alertas.length ? "revisar" : "aprovavel"
    };
  }

  function gerarResumo(preparo){
    const d = preparo.diagnostico;
    return [
      `Destino: ${d.destino.nome}`,
      `Dimensões: ${d.larguraPx || "?"} x ${d.alturaPx || "?"} px`,
      `Orientação: ${d.orientacao}`,
      `Status: ${preparo.status}`,
      `Recomendação: ${d.recomendacao}`,
      ...(d.alertas.length ? ["Alertas:", ...d.alertas.map(a => `- ${a}`)] : ["Sem alertas críticos."])
    ].join("\n");
  }

  window.CeleiroMotorPolimentoImagem = {
    destinos,
    destino,
    detectarOrientacao,
    calcularProporcao,
    diagnosticarImagem,
    prepararParaDestino,
    gerarResumo
  };
})();
