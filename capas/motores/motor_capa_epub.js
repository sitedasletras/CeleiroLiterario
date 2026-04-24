/*
  Motor de Capa ePub — Celeiro Literário
  Mantido fora dos capistas para preservar leveza.
*/

(function(){
  const presets = {
    padrao: {
      nome: "ePub padrão editorial",
      larguraPx: 1600,
      alturaPx: 2560,
      proporcao: 1.6,
      areaSegura: 0.86
    },
    alta: {
      nome: "ePub alta resolução",
      larguraPx: 2560,
      alturaPx: 4096,
      proporcao: 1.6,
      areaSegura: 0.86
    }
  };

  const precos = {
    BRL: 2,
    USD: 2
  };

  function obterPreset(nomePreset){
    return presets[nomePreset] || presets.padrao;
  }

  function obterPreco(moeda){
    return precos[moeda] || precos.BRL;
  }

  function calcularCapaEpub(opcoes = {}){
    const moeda = opcoes.moeda || "BRL";
    const preset = obterPreset(opcoes.preset || "padrao");

    return {
      tipo: "epub",
      preset,
      larguraPx: preset.larguraPx,
      alturaPx: preset.alturaPx,
      proporcao: preset.proporcao,
      areaSegura: preset.areaSegura,
      moeda,
      valor: obterPreco(moeda),
      observacao: "Capa digital sem lombada, sem contracapa física e sem orelhas."
    };
  }

  window.CeleiroMotorCapaEpub = {
    presets,
    precos,
    obterPreset,
    obterPreco,
    calcularCapaEpub
  };
})();
