/*
  Motor Avaliador Emocional — Lapidar / Celeiro Literário

  Função:
  - medir impacto emocional predominante da obra;
  - identificar variações de intensidade afetiva;
  - sugerir voz narrativa para Silo Sonoro;
  - sugerir trilha/clima para Silo Cinematográfico;
  - apoiar Lapidação Literária e Avaliação da Obra.

  NÃO altera texto.
  NÃO escreve narrativa.
  Apenas detecta padrão emocional.
*/

(function(){

  const camposEmocionais = {
    contemplativo:["silêncio","memória","tempo","alma","lembrança","saudade","espera"],
    dramático:["dor","grito","perda","medo","sangue","queda","urgente"],
    épico:["destino","batalha","jornada","herói","reino","profecia","vitória"],
    lírico:["vento","lua","mar","luz","flor","sonho","canto"],
    cotidiano:["casa","rua","mesa","cidade","janela","trabalho","manhã"],
    suspense:["segredo","mistério","sombra","desapareceu","escuro","passos"],
    espiritual:["fé","eterno","espírito","oração","transcendente","sagrado"]
  };

  function normalizar(texto){
    return String(texto || "")
      .replace(/\r\n/g,"\n")
      .replace(/\r/g,"\n")
      .toLowerCase()
      .trim();
  }

  function contarOcorrencias(texto, termos){
    return termos.reduce((s,t)=>{
      const r = new RegExp("\\b"+t+"\\b","g");
      return s + ((texto.match(r)||[]).length);
    },0);
  }

  function medirCampos(texto){
    const t = normalizar(texto);

    const placar = {};

    Object.keys(camposEmocionais).forEach(campo=>{
      placar[campo] = contarOcorrencias(t, camposEmocionais[campo]);
    });

    return placar;
  }

  function detectarDominante(placar){
    const ordenado = Object.entries(placar)
      .sort((a,b)=>b[1]-a[1]);

    if(!ordenado.length || ordenado[0][1] === 0)
      return { dominante:"neutro", intensidade:0 };

    return {
      dominante:ordenado[0][0],
      intensidade:ordenado[0][1]
    };
  }

  function sugerirNarracao(campo){
    const mapa = {
      contemplativo:"voz calma, pausada, com silêncio respirado",
      dramático:"voz intensa, dinâmica e com pausas fortes",
      épico:"voz ampla, grave e solene",
      lírico:"voz suave e musical",
      cotidiano:"voz natural e próxima",
      suspense:"voz contida e progressiva",
      espiritual:"voz reverente e profunda",
      neutro:"voz neutra equilibrada"
    };

    return mapa[campo] || mapa.neutro;
  }

  function sugerirTrilha(campo){
    const mapa = {
      contemplativo:"piano leve / ambiência lenta",
      dramático:"cordas tensas / crescendos",
      épico:"orquestral amplo",
      lírico:"flauta / cordas suaves",
      cotidiano:"violão leve / ambiente urbano",
      suspense:"pads escuros / pulsação discreta",
      espiritual:"coral etéreo / órgão leve",
      neutro:"ambiente discreto"
    };

    return mapa[campo] || mapa.neutro;
  }

  function analisarImpactoEmocional(texto){

    const placar = medirCampos(texto);

    const dominante = detectarDominante(placar);

    const narracao = sugerirNarracao(dominante.dominante);

    const trilha = sugerirTrilha(dominante.dominante);

    return {
      tipo:"avaliacao_emocional",
      dominante:dominante.dominante,
      intensidade:dominante.intensidade,
      placar,
      sugestaoNarracao:narracao,
      sugestaoTrilha:trilha,
      observacao:"Resultado preliminar baseado em campo emocional lexical predominante."
    };

  }

  window.CeleiroMotorAvaliadorEmocional = {
    camposEmocionais,
    analisarImpactoEmocional
  };

})();
