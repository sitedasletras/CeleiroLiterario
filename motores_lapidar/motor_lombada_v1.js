/*
  Lapidar — Motor de Lombada v1
  Leve, sem backend.

  Função:
  - calcular lombada por número de páginas e tipo de papel;
  - calcular capa aberta completa;
  - preparar base para Faça Kapa / OKapista;
  - suportar presets UICLAP, Clube de Autores, Amazon KDP e personalizado.

  Observação técnica:
  - valores de espessura são estimativas editoriais iniciais em mm por página.
  - cada gráfica pode exigir ajuste fino posterior.
*/

(function(){
  const papeis = {
    offset70:{ nome:"Offset 70g", espessuraPorPagina:0.085 },
    offset75:{ nome:"Offset 75g", espessuraPorPagina:0.090 },
    offset90:{ nome:"Offset 90g", espessuraPorPagina:0.110 },
    polen80:{ nome:"Pólen 80g", espessuraPorPagina:0.105 },
    couche90:{ nome:"Couchê 90g", espessuraPorPagina:0.100 },
    couche115:{ nome:"Couchê 115g", espessuraPorPagina:0.130 },
    personalizado:{ nome:"Personalizado", espessuraPorPagina:0.090 }
  };

  const formatos = {
    A5:{ nome:"A5", largura:148, altura:210 },
    "14x21":{ nome:"14 x 21", largura:140, altura:210 },
    "16x23":{ nome:"16 x 23", largura:160, altura:230 },
    "6x9":{ nome:"6 x 9", largura:152.4, altura:228.6 },
    A4:{ nome:"A4", largura:210, altura:297 }
  };

  const graficas = {
    padrao:{ nome:"Padrão editorial", sangria:3, areaSegura:6, orelha:0 },
    uiclap:{ nome:"UICLAP", sangria:5, areaSegura:8, orelha:0 },
    clube:{ nome:"Clube de Autores", sangria:5, areaSegura:8, orelha:0 },
    amazon:{ nome:"Amazon KDP", sangria:3.2, areaSegura:6.4, orelha:0 },
    personalizada:{ nome:"Personalizada", sangria:3, areaSegura:6, orelha:0 }
  };

  function numeroSeguro(valor, fallback=0){
    const n = Number(valor);
    return Number.isFinite(n) ? n : fallback;
  }

  function arredondar(valor, casas=2){
    const f = Math.pow(10,casas);
    return Math.round((valor + Number.EPSILON) * f) / f;
  }

  function obterPapel(chave, espessuraPersonalizada){
    const papel = papeis[chave] || papeis.offset75;
    if(chave === "personalizado" && espessuraPersonalizada){
      return { ...papel, espessuraPorPagina:numeroSeguro(espessuraPersonalizada, papel.espessuraPorPagina) };
    }
    return papel;
  }

  function obterFormato(chave){
    return formatos[chave] || formatos["16x23"];
  }

  function obterGrafica(chave, ajustes={}){
    const base = graficas[chave] || graficas.padrao;
    return {
      ...base,
      sangria:numeroSeguro(ajustes.sangria, base.sangria),
      areaSegura:numeroSeguro(ajustes.areaSegura, base.areaSegura),
      orelha:numeroSeguro(ajustes.orelha, base.orelha)
    };
  }

  function calcularLombada(opcoes={}){
    const paginas = Math.max(1, Math.ceil(numeroSeguro(opcoes.paginas, 1)));
    const papel = obterPapel(opcoes.papel || "offset75", opcoes.espessuraPersonalizada);
    const formato = obterFormato(opcoes.formato || "16x23");
    const grafica = obterGrafica(opcoes.grafica || "padrao", opcoes.ajustes || {});

    const lombadaMm = paginas * papel.espessuraPorPagina;
    const larguraCapaFechada = formato.largura;
    const alturaCapaFechada = formato.altura;
    const orelha = grafica.orelha || 0;

    const larguraAbertaSemSangria = (larguraCapaFechada * 2) + lombadaMm + (orelha * 2);
    const alturaAbertaSemSangria = alturaCapaFechada;

    const larguraAbertaComSangria = larguraAbertaSemSangria + (grafica.sangria * 2);
    const alturaAbertaComSangria = alturaAbertaSemSangria + (grafica.sangria * 2);

    return {
      paginas,
      papel,
      formato,
      grafica,
      lombadaMm:arredondar(lombadaMm,2),
      lombadaCm:arredondar(lombadaMm/10,2),
      capa:{
        frente:{ larguraMm:formato.largura, alturaMm:formato.altura },
        contracapa:{ larguraMm:formato.largura, alturaMm:formato.altura },
        orelhaMm:orelha,
        larguraAbertaSemSangriaMm:arredondar(larguraAbertaSemSangria,2),
        alturaAbertaSemSangriaMm:arredondar(alturaAbertaSemSangria,2),
        larguraAbertaComSangriaMm:arredondar(larguraAbertaComSangria,2),
        alturaAbertaComSangriaMm:arredondar(alturaAbertaComSangria,2),
        sangriaMm:grafica.sangria,
        areaSeguraMm:grafica.areaSegura
      },
      instrucoes:[
        `Formato: ${formato.nome}`,
        `Papel: ${papel.nome}`,
        `Páginas: ${paginas}`,
        `Lombada estimada: ${arredondar(lombadaMm,2)} mm (${arredondar(lombadaMm/10,2)} cm)`,
        `Capa aberta com sangria: ${arredondar(larguraAbertaComSangria,2)} mm x ${arredondar(alturaAbertaComSangria,2)} mm`
      ],
      motor:"Lapidar.MotorLombada.v1",
      atualizadoEm:new Date().toISOString()
    };
  }

  function gerarResumoTexto(resultado){
    if(!resultado) return "Sem cálculo de lombada.";
    return resultado.instrucoes.join("\n");
  }

  function calcularPorProjeto(projeto={}, opcoes={}){
    const paginas = opcoes.paginas || projeto.paginas || projeto.estatisticas?.totalPaginas || projeto.metadados?.paginas || 1;
    return calcularLombada({
      paginas,
      papel:opcoes.papel || projeto.configuracoes?.papel || "offset75",
      formato:opcoes.formato || projeto.formato || "16x23",
      grafica:opcoes.grafica || projeto.configuracoes?.grafica || "padrao",
      ajustes:opcoes.ajustes || projeto.configuracoes?.ajustesCapa || {}
    });
  }

  window.LapidarMotorLombada = {
    papeis,
    formatos,
    graficas,
    calcularLombada,
    calcularPorProjeto,
    gerarResumoTexto
  };
})();
