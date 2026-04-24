/*
  Motor de Cálculo de Lombada — Celeiro Literário
  Mantido fora dos capistas para preservar leveza.
*/

(function(){
  const fatoresPadrao = {
    offset75: 0.0021,
    offset90: 0.0025,
    polen80: 0.0023,
    polen90: 0.0027,
    couche115: 0.0030,
    couche150: 0.0038,
    manual: 0.0021
  };

  const formatosPadrao = {
    a5: { largura: 14.8, altura: 21 },
    "16x23": { largura: 16, altura: 23 },
    "6x9": { largura: 15.24, altura: 22.86 },
    "14x21": { largura: 14, altura: 21 }
  };

  function numeroSeguro(valor, fallback = 0){
    const n = Number(valor);
    return Number.isFinite(n) ? n : fallback;
  }

  function obterFatorPapel(papel, fatorManual){
    if(papel === "manual") return numeroSeguro(fatorManual, fatoresPadrao.manual);
    return fatoresPadrao[papel] || fatoresPadrao.manual;
  }

  function obterFormato(formato, larguraManual, alturaManual){
    if(formato === "personalizado"){
      return {
        largura: numeroSeguro(larguraManual, 14.8),
        altura: numeroSeguro(alturaManual, 21)
      };
    }
    return formatosPadrao[formato] || formatosPadrao.a5;
  }

  function calcularCapaFisica(opcoes){
    const formato = obterFormato(opcoes.formato, opcoes.larguraManual, opcoes.alturaManual);
    const paginas = Math.max(0, numeroSeguro(opcoes.paginas, 0));
    const fator = obterFatorPapel(opcoes.papel, opcoes.fatorManual);
    const sangria = numeroSeguro(opcoes.sangria, 0.3);
    const orelha = numeroSeguro(opcoes.orelha, 0);

    const lombada = paginas * fator;
    const larguraAberta = (formato.largura * 2) + lombada + (sangria * 2) + (orelha * 2);
    const alturaAberta = formato.altura + (sangria * 2);

    return {
      formato,
      paginas,
      fator,
      sangria,
      orelha,
      lombada,
      larguraAberta,
      alturaAberta
    };
  }

  window.CeleiroMotorLombada = {
    fatoresPadrao,
    formatosPadrao,
    obterFatorPapel,
    obterFormato,
    calcularCapaFisica
  };
})();
