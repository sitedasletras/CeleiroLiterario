/*
  Motor Raio‑X de Progressão da Obra — Lapidar / Celeiro Literário

  Função:
  - identificar potencial de continuidade narrativa;
  - sugerir trilogia, série longa ou obra única;
  - detectar ganchos dramáticos e núcleos expansíveis;
  - alimentar Avaliação Literária (versões 8 e 11 páginas);
  - dialogar com Silo Cinematográfico e Silo Sonoro.

  Não gera conteúdo criativo.
  Apenas detecta estrutura potencial.
*/

(function(){

  function normalizar(texto){
    return String(texto || "")
      .replace(/\r\n/g,"\n")
      .replace(/\r/g,"\n")
      .trim();
  }

  function contarOcorrencias(texto, termos){
    const t = normalizar(texto).toLowerCase();
    return termos.reduce((s, termo)=>{
      const regex = new RegExp("\\b"+termo+"\\b","g");
      return s + ((t.match(regex) || []).length);
    },0);
  }

  function detectarGanchos(texto){
    const termos = [
      "segredo",
      "profecia",
      "linhagem",
      "antes que tudo terminasse",
      "ainda não sabia",
      "continua",
      "retornaria",
      "descobriria",
      "herança",
      "mistério"
    ];

    const pontos = contarOcorrencias(texto, termos);

    return {
      pontos,
      nivel: pontos >= 5 ? "alto" : pontos >= 2 ? "medio" : "baixo"
    };
  }

  function detectarNucleosNarrativos(texto){
    const termos = [
      "família",
      "cidade",
      "reino",
      "grupo",
      "irmãos",
      "amigos",
      "ordem",
      "comunidade",
      "clã",
      "tripulação"
    ];

    const pontos = contarOcorrencias(texto, termos);

    return {
      pontos,
      expansivel: pontos >= 3
    };
  }

  function detectarPersonagensExpansiveis(texto){
    const termos = [
      "antigo",
      "mestre",
      "mentor",
      "desconhecido",
      "mensageiro",
      "viajante",
      "estranho",
      "capitão",
      "general",
      "professor"
    ];

    const pontos = contarOcorrencias(texto, termos);

    return {
      pontos,
      potencialSpinOff: pontos >= 2
    };
  }

  function sugerirFormatoSerie(dados){
    const score =
      dados.ganchos.pontos +
      dados.nucleos.pontos +
      dados.personagens.pontos;

    if(score >= 8)
      return "universo expandido";

    if(score >= 5)
      return "trilogia";

    if(score >= 3)
      return "duologia";

    return "obra unica";
  }

  function analisarProgressao(texto){
    const ganchos = detectarGanchos(texto);
    const nucleos = detectarNucleosNarrativos(texto);
    const personagens = detectarPersonagensExpansiveis(texto);

    const formato = sugerirFormatoSerie({
      ganchos,
      nucleos,
      personagens
    });

    return {
      tipo:"raio_x_progressao",
      ganchos,
      nucleos,
      personagens,
      formatoSugerido: formato,
      observacao:
        formato === "universo expandido"
          ? "Há sinais consistentes de franquia narrativa." :
        formato === "trilogia"
          ? "Estrutura compatível com trilogia." :
        formato === "duologia"
          ? "Possível expansão em dois volumes." :
          "Estrutura adequada como obra independente."
    };
  }

  window.CeleiroMotorRaioXProgressao = {
    analisarProgressao
  };

})();
