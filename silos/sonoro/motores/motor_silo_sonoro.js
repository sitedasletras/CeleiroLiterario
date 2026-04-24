/*
  Motor Silo Sonoro — Celeiro Literário / Lapidar

  Função:
  - preparar configuração narrativa de áudio (audiobook, narração curta, reels);
  - escolher perfil de voz com base no avaliador emocional;
  - estimar duração do áudio;
  - organizar trilha sugerida;
  - estruturar exportação futura para plataformas.

  Este motor NÃO sintetiza áudio diretamente.
  Ele prepara o projeto sonoro editorial.
*/

(function(){

  const velocidadesNarracao = {
    lenta: 110,
    moderada: 150,
    rapida: 185
  };

  const perfisNarracao = {
    contemplativo: "voz calma e pausada",
    dramático: "voz intensa com pausas fortes",
    épico: "voz grave e ampla",
    lírico: "voz suave e musical",
    cotidiano: "voz natural e próxima",
    suspense: "voz contida progressiva",
    espiritual: "voz profunda reverente",
    neutro: "voz equilibrada"
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

  function estimarDuracao(palavras, velocidade = "moderada"){
    const wpm = velocidadesNarracao[velocidade] || velocidadesNarracao.moderada;
    const minutos = palavras / wpm;
    return {
      minutos: Math.round(minutos),
      horas: Number((minutos / 60).toFixed(2))
    };
  }

  function sugerirPerfilNarracao(campoEmocional){
    return perfisNarracao[campoEmocional] || perfisNarracao.neutro;
  }

  function sugerirFormato(duracaoMinutos){
    if(duracaoMinutos <= 3) return "short / reels";
    if(duracaoMinutos <= 12) return "narração curta";
    if(duracaoMinutos <= 60) return "conto narrado";
    return "audiobook";
  }

  function analisarProjetoSonoro(texto, opcoes = {}){

    const palavras = contarPalavras(texto);

    const campoEmocional =
      opcoes.campoEmocional ||
      (window.CeleiroMotorAvaliadorEmocional
        ? window.CeleiroMotorAvaliadorEmocional.analisarImpactoEmocional(texto).dominante
        : "neutro");

    const perfilNarracao = sugerirPerfilNarracao(campoEmocional);

    const duracao = estimarDuracao(palavras, opcoes.velocidade || "moderada");

    const formato = sugerirFormato(duracao.minutos);

    return {
      tipo:"silo_sonoro",
      palavras,
      campoEmocional,
      perfilNarracao,
      duracaoEstimada: duracao,
      formatoSugerido: formato,
      observacao:"Projeto preparado para geração futura de áudio dentro do Silo Sonoro."
    };

  }

  window.CeleiroMotorSiloSonoro = {
    velocidadesNarracao,
    perfisNarracao,
    estimarDuracao,
    sugerirPerfilNarracao,
    sugerirFormato,
    analisarProjetoSonoro
  };

})();
