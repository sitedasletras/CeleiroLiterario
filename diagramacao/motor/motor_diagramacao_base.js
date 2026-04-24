/*
  Motor de Diagramação Base — Celeiro Literário
  Cérebro compartilhado dos diagramadores: Pólux, Castor, Centauro, Qui(RON)xadá e Hércules.
  Mantido fora das interfaces para preservar leveza e evitar duplicação.
*/

(function(){
  const formatos = {
    a5: { nome: "A5", larguraCm: 14.8, alturaCm: 21, larguraPx: 420, alturaPx: 595 },
    "16x23": { nome: "16 x 23", larguraCm: 16, alturaCm: 23, larguraPx: 454, alturaPx: 652 },
    "6x9": { nome: "6 x 9", larguraCm: 15.24, alturaCm: 22.86, larguraPx: 432, alturaPx: 648 },
    a4: { nome: "A4", larguraCm: 21, alturaCm: 29.7, larguraPx: 595, alturaPx: 842 },
    cordel: { nome: "Cordel 11 x 16", larguraCm: 11, alturaCm: 16, larguraPx: 350, alturaPx: 520 }
  };

  const margens = {
    estreita: { interna: 1.6, externa: 1.2, superior: 1.5, inferior: 1.5 },
    normal: { interna: 2.0, externa: 1.5, superior: 1.8, inferior: 1.8 },
    ampla: { interna: 2.4, externa: 1.8, superior: 2.1, inferior: 2.1 },
    tecnica: { interna: 2.2, externa: 1.8, superior: 2.0, inferior: 2.0 }
  };

  const presets = {
    polux: {
      nome: "Pólux",
      tipo: "prosa",
      formatoPadrao: "a5",
      margemPadrao: "normal",
      fonteCorpo: "Georgia, 'Times New Roman', serif",
      tamanhoFonte: 11,
      entrelinha: 1.45,
      letraCapitular: true,
      ornamentos: true,
      hifenizacao: true
    },
    castor: {
      nome: "Castor",
      tipo: "poesia",
      formatoPadrao: "a5",
      margemPadrao: "ampla",
      fonteCorpo: "Georgia, 'Times New Roman', serif",
      tamanhoFonte: 11,
      entrelinha: 1.35,
      letraCapitular: false,
      ornamentos: true,
      hifenizacao: false
    },
    centauro: {
      nome: "Centauro",
      tipo: "hibrido",
      formatoPadrao: "a5",
      margemPadrao: "normal",
      fonteCorpo: "Georgia, 'Times New Roman', serif",
      tamanhoFonte: 11,
      entrelinha: 1.42,
      letraCapitular: true,
      ornamentos: true,
      hifenizacao: true
    },
    quironxada: {
      nome: "Qui(RON)xadá",
      tipo: "cordel",
      formatoPadrao: "cordel",
      margemPadrao: "estreita",
      fonteCorpo: "Georgia, 'Times New Roman', serif",
      tamanhoFonte: 11,
      entrelinha: 1.25,
      letraCapitular: false,
      ornamentos: false,
      hifenizacao: false
    },
    hercules: {
      nome: "Hércules",
      tipo: "tecnico",
      formatoPadrao: "a4",
      margemPadrao: "tecnica",
      fonteCorpo: "Georgia, 'Times New Roman', serif",
      tamanhoFonte: 11,
      entrelinha: 1.4,
      letraCapitular: false,
      ornamentos: false,
      hifenizacao: true
    }
  };

  function normalizarTexto(texto){
    return String(texto || "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/[\t ]+$/gm, "")
      .trim();
  }

  function quebrarBlocos(texto){
    const limpo = normalizarTexto(texto);
    if(!limpo) return [];
    return limpo.split(/\n{2,}/).map((bloco, indice) => ({
      id: `bloco-${indice + 1}`,
      bruto: bloco,
      texto: bloco.trim(),
      linhas: bloco.split("\n").map(l => l.trim()).filter(Boolean)
    })).filter(b => b.texto);
  }

  function ehTituloCapitulo(linha){
    const l = String(linha || "").trim();
    if(!l) return false;
    return /^(cap[ií]tulo|chapter)\s+([0-9ivxlcdm]+|primeiro|segundo|terceiro|quarto|quinto|sexto|s[eé]timo|oitavo|nono|d[eé]cimo)\b/i.test(l)
      || /^parte\s+([0-9ivxlcdm]+|primeira|segunda|terceira)\b/i.test(l);
  }

  function pareceSubtitulo(linha){
    const l = String(linha || "").trim();
    if(!l) return false;
    if(ehTituloCapitulo(l)) return false;
    if(l.length > 90) return false;
    if(/[.!?;:]$/.test(l)) return false;
    return l.split(/\s+/).length <= 12;
  }

  function detectarCapitulos(texto){
    const linhas = normalizarTexto(texto).split("\n");
    const capitulos = [];

    for(let i = 0; i < linhas.length; i++){
      const linha = linhas[i].trim();
      if(ehTituloCapitulo(linha)){
        const proxima = (linhas[i + 1] || "").trim();
        capitulos.push({
          linha: i,
          titulo: linha,
          subtitulo: pareceSubtitulo(proxima) ? proxima : "",
          subtituloLinha: pareceSubtitulo(proxima) ? i + 1 : null
        });
      }
    }
    return capitulos;
  }

  function classificarBloco(bloco){
    const texto = bloco.texto;
    const linhas = bloco.linhas;
    const primeira = linhas[0] || texto;

    if(ehTituloCapitulo(primeira)) return "capitulo";
    if(linhas.length >= 2 && linhas.length <= 12 && linhas.every(l => l.length <= 80)) return "poesia";
    if(/^[-–—]/.test(primeira)) return "dialogo";
    if(pareceSubtitulo(primeira) && linhas.length === 1) return "subtitulo";
    return "paragrafo";
  }

  function detectarTipoObra(texto){
    const blocos = quebrarBlocos(texto);
    if(!blocos.length) return { tipo: "vazio", confianca: 0 };

    let poesia = 0, prosa = 0, dialogo = 0, capitulo = 0;
    blocos.forEach(b => {
      const tipo = classificarBloco(b);
      if(tipo === "poesia") poesia++;
      if(tipo === "paragrafo") prosa++;
      if(tipo === "dialogo") dialogo++;
      if(tipo === "capitulo") capitulo++;
    });

    const total = blocos.length;
    const taxaPoesia = poesia / total;
    const taxaProsa = (prosa + dialogo) / total;

    if(taxaPoesia > 0.65) return { tipo: "poesia", confianca: taxaPoesia };
    if(taxaPoesia > 0.25 && taxaProsa > 0.25) return { tipo: "hibrido", confianca: Math.min(0.95, taxaPoesia + taxaProsa) };
    if(capitulo > 0 || taxaProsa >= 0.5) return { tipo: "prosa", confianca: Math.max(taxaProsa, 0.55) };
    return { tipo: "indefinido", confianca: 0.35 };
  }

  function calcularFormatoReal(formato){
    return formatos[formato] || formatos.a5;
  }

  function calcularMargens(preset, paginaPar){
    const base = margens[preset] || margens.normal;
    return {
      superior: base.superior,
      inferior: base.inferior,
      esquerda: paginaPar ? base.externa : base.interna,
      direita: paginaPar ? base.interna : base.externa,
      interna: base.interna,
      externa: base.externa
    };
  }

  function aplicarLetraCapitular(html, ativo){
    if(!ativo) return html;
    return html.replace(/<p class="paragrafo">\s*([^<\s])/, '<p class="paragrafo dropcap"><span class="capitular">$1</span>');
  }

  function escaparHtml(str){
    return String(str || "").replace(/[&<>"]/g, s => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[s]));
  }

  function gerarHtmlBlocos(texto, opcoes = {}){
    const blocos = quebrarBlocos(texto);
    const usarCapitular = !!opcoes.letraCapitular;
    let primeiraProsaAplicada = false;

    return blocos.map((bloco) => {
      const tipo = classificarBloco(bloco);
      const conteudo = escaparHtml(bloco.texto).replace(/\n/g, "<br>");

      if(tipo === "capitulo") return `<h1 class="capitulo">${conteudo}</h1>`;
      if(tipo === "subtitulo") return `<h2 class="subtitulo">${conteudo}</h2>`;
      if(tipo === "poesia") return `<div class="estrofe">${conteudo}</div>`;
      if(tipo === "dialogo") return `<p class="dialogo">${conteudo}</p>`;

      let html = `<p class="paragrafo">${conteudo}</p>`;
      if(usarCapitular && !primeiraProsaAplicada){
        html = aplicarLetraCapitular(html, true);
        primeiraProsaAplicada = true;
      }
      return html;
    }).join("\n");
  }

  function estimarPaginas(texto, config = {}){
    const formato = calcularFormatoReal(config.formato || "a5");
    const tamanhoFonte = Number(config.tamanhoFonte || 11);
    const entrelinha = Number(config.entrelinha || 1.4);
    const caracteres = normalizarTexto(texto).length;
    const densidadeBase = (formato.larguraPx * formato.alturaPx) / 1000;
    const fatorFonte = 11 / tamanhoFonte;
    const fatorEntrelinha = 1.4 / entrelinha;
    const charsPorPagina = Math.max(900, densidadeBase * 5.2 * fatorFonte * fatorEntrelinha);
    return Math.max(1, Math.ceil(caracteres / charsPorPagina));
  }

  function controlarViuvasOrfas(blocos, opcoes = {}){
    // Primeira versão leve: marca blocos pequenos para manter juntos.
    return blocos.map(bloco => ({
      ...bloco,
      manterJunto: bloco.linhas.length <= Number(opcoes.linhasMinimas || 2)
    }));
  }

  function inserirOrnamentos(html, ativo, simbolo = "✦"){
    if(!ativo) return html;
    return html.replace(/(<h1 class="capitulo">)/g, `<div class="ornamento">${simbolo}</div>\n$1`);
  }

  function montarPreview(texto, config = {}){
    const preset = presets[config.preset] || presets.polux;
    const formato = calcularFormatoReal(config.formato || preset.formatoPadrao);
    const margem = calcularMargens(config.margem || preset.margemPadrao, false);
    let html = gerarHtmlBlocos(texto, {
      letraCapitular: config.letraCapitular ?? preset.letraCapitular
    });
    html = inserirOrnamentos(html, config.ornamentos ?? preset.ornamentos, config.simboloOrnamento || "✦");

    return {
      html,
      formato,
      margem,
      tipoDetectado: detectarTipoObra(texto),
      capitulos: detectarCapitulos(texto),
      paginasEstimadas: estimarPaginas(texto, {
        formato: config.formato || preset.formatoPadrao,
        tamanhoFonte: config.tamanhoFonte || preset.tamanhoFonte,
        entrelinha: config.entrelinha || preset.entrelinha
      }),
      css: gerarCssPreview(preset, formato, margem, config)
    };
  }

  function gerarCssPreview(preset, formato, margem, config = {}){
    const fonte = config.fonteCorpo || preset.fonteCorpo;
    const tamanho = Number(config.tamanhoFonte || preset.tamanhoFonte);
    const entrelinha = Number(config.entrelinha || preset.entrelinha);

    return `
      .pagina-editorial{
        width:${formato.larguraPx}px;
        min-height:${formato.alturaPx}px;
        padding:${margem.superior}cm ${margem.direita}cm ${margem.inferior}cm ${margem.esquerda}cm;
        background:#fffdf8;
        color:#1f1f1b;
        font-family:${fonte};
        font-size:${tamanho}pt;
        line-height:${entrelinha};
        box-shadow:0 12px 28px rgba(0,0,0,.10);
        overflow:hidden;
        hyphens:${preset.hifenizacao ? "auto" : "manual"};
      }
      .capitulo{font-size:1.55em;text-align:center;margin:2.4em 0 .45em;font-weight:700;break-before:page;}
      .subtitulo{text-align:center;font-size:1.05em;font-weight:700;font-style:italic;margin:0 0 2em;}
      .paragrafo{text-align:justify;margin:0 0 .85em;text-indent:1.2em;}
      .dialogo{text-align:justify;margin:0 0 .85em;text-indent:0;}
      .estrofe{white-space:pre-line;margin:0 0 1.25em;text-align:left;}
      .ornamento{text-align:center;margin:1.8em 0;color:#8f7b61;}
      .dropcap{text-indent:0;}
      .capitular{float:left;font-size:3.2em;line-height:.82;margin:.06em .12em 0 0;font-weight:700;}
    `;
  }

  window.CeleiroMotorDiagramacaoBase = {
    formatos,
    margens,
    presets,
    normalizarTexto,
    quebrarBlocos,
    detectarCapitulos,
    detectarTipoObra,
    classificarBloco,
    calcularFormatoReal,
    calcularMargens,
    gerarHtmlBlocos,
    controlarViuvasOrfas,
    inserirOrnamentos,
    estimarPaginas,
    montarPreview,
    gerarCssPreview
  };
})();
