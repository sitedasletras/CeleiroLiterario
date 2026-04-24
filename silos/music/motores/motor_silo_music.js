/*
  Motor Silo Music — Celeiro Literário / Lapidar

  Funções:
  - sugerir trilha sonora editorial baseada no campo emocional da obra;
  - definir perfil musical para audiobook, vídeo e web rádio;
  - estimar duração musical necessária;
  - estruturar uso de trilha em domínio público ou gerada.

  NÃO gera áudio diretamente.
  Prepara o projeto musical narrativo.
*/

(function(){

  const estilosPorCampo = {
    contemplativo:"piano leve, ambient lento",
    dramático:"cordas tensas, crescendos progressivos",
    épico:"orquestral amplo cinematográfico",
    lírico:"flauta, cordas suaves e textura aérea",
    cotidiano:"violão leve e ambiente natural",
    suspense:"pads escuros e pulsação discreta",
    espiritual:"coral etéreo e órgão suave",
    neutro:"ambiente instrumental equilibrado"
  };

  const bpmPorCampo = {
    contemplativo:60,
    dramático:95,
    épico:110,
    lírico:70,
    cotidiano:85,
    suspense:75,
    espiritual:65,
    neutro:90
  };

  function normalizar(texto){
    return String(texto || "")
      .replace(/\r\n/g,"\n")
      .replace(/\r/g,"\n")
      .trim();
  }

  function contarPalavras(texto){
    const limpo = normalizar(texto).replace(/\n/g," ");
    if(!limpo) return 0;
    return limpo.split(/\s+/).filter(Boolean).length;
  }

  function obterCampoEmocional(texto, opcoes = {}){
    if(opcoes.campoEmocional) return opcoes.campoEmocional;

    if(window.CeleiroMotorAvaliadorEmocional){
      return window.CeleiroMotorAvaliadorEmocional
        .analisarImpactoEmocional(texto)
        .dominante;
    }

    return "neutro";
  }

  function estimarDuracaoMusical(texto){
    const palavras = contarPalavras(texto);

    const minutos = Math.max(1, Math.round(palavras / 140));

    return {
      minutos,
      loopsSugeridos: Math.ceil(minutos / 3)
    };
  }

  function sugerirEstilo(campo){
    return estilosPorCampo[campo] || estilosPorCampo.neutro;
  }

  function sugerirBPM(campo){
    return bpmPorCampo[campo] || bpmPorCampo.neutro;
  }

  function analisarProjetoMusical(texto, opcoes = {}){

    const campo = obterCampoEmocional(texto, opcoes);

    const estilo = sugerirEstilo(campo);

    const bpm = sugerirBPM(campo);

    const duracao = estimarDuracaoMusical(texto);

    return {
      tipo:"silo_music",
      campoEmocional:campo,
      estiloSugerido:estilo,
      bpmSugerido:bpm,
      duracaoEstimada:duracao,
      observacao:"Projeto musical preparado para trilha narrativa editorial ou web rádio Celeiro Literário."
    };

  }

  window.CeleiroMotorSiloMusic = {
    estilosPorCampo,
    bpmPorCampo,
    estimarDuracaoMusical,
    sugerirEstilo,
    sugerirBPM,
    analisarProjetoMusical
  };

})();
