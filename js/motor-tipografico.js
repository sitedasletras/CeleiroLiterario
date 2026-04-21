(function (global) {
  "use strict";


  function cmParaPx(cm) {
    return Math.round(cm * 37.7952755906);
  }


  function dividirLinhas(texto, maxChars) {

    const palavras = String(texto || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!palavras.length) return [];

    const linhas = [];
    let linhaAtual = "";

    for (const palavra of palavras) {

      const tentativa = linhaAtual
        ? linhaAtual + " " + palavra
        : palavra;

      if (tentativa.length <= maxChars) {

        linhaAtual = tentativa;

      } else {

        if (linhaAtual) {
          linhas.push(linhaAtual);
        }

        linhaAtual = palavra;

      }

    }

    if (linhaAtual) {
      linhas.push(linhaAtual);
    }

    return linhas;

  }


  function normalizarBlocos(texto, modo, versosPorEstrofe) {

    const cru = String(texto || "").replace(/\r/g, "");

    if (!cru.trim()) return [];


    if (modo === "castor") {

      return cru
        .split(/\n\s*\n/g)
        .map(bloco =>
          bloco
            .split("\n")
            .map(v => v.trim())
            .filter(Boolean)
        )
        .filter(arr => arr.length)
        .map(arr => ({
          tipo: "estrofe",
          linhasOriginais: arr
        }));

    }


    if (modo === "quironxada") {

      const linhas = cru
        .split("\n")
        .map(v => v.trim())
        .filter(Boolean);

      const blocos = [];

      for (let i = 0; i < linhas.length; i += versosPorEstrofe) {

        blocos.push({
          tipo: "sextilha",
          linhasOriginais: linhas.slice(i, i + versosPorEstrofe)
        });

      }

      return blocos;

    }


    return cru
      .split(/\n\s*\n/g)
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => ({
        tipo: "paragrafo",
        texto: p
      }));

  }



  function estimarCapacidadeLinhas(containerEl, perfil) {

    const altura = containerEl.clientHeight || 900;

    const superior = cmParaPx(perfil.margens.superiorCm);
    const inferior = cmParaPx(perfil.margens.inferiorCm);

    const fontSize = perfil.tipografia.fontSizePx || 16;

    const lineHeightPx =
      Math.round(
        fontSize *
        (perfil.tipografia.lineHeight || 1.6)
      );

    const disponivel =
      Math.max(
        200,
        altura - superior - inferior - 40
      );

    return Math.max(
      8,
      Math.floor(disponivel / lineHeightPx)
    );

  }



  function estimarMaxChars(containerEl, perfil) {

    const largura = containerEl.clientWidth || 650;

    const interna = cmParaPx(perfil.margens.internaCm);
    const externa = cmParaPx(perfil.margens.externaCm);

    const fontSize = perfil.tipografia.fontSizePx || 16;

    const disponivel =
      Math.max(
        180,
        largura - interna - externa - 40
      );

    return Math.max(
      18,
      Math.floor(disponivel / (fontSize * 0.58))
    );

  }



  function evitarOrfasViuvias(paginas) {

    for (let i = 0; i < paginas.length - 1; i++) {

      const atual = paginas[i];
      const proxima = paginas[i + 1];

      if (!atual.length || !proxima.length) continue;

      const ultimo = atual[atual.length - 1];
      const primeiro = proxima[0];


      if (
        ultimo.__linhasNoBloco > 1 &&
        ultimo.__indiceLinhaNoBloco === 0
      ) {

        if (atual.length >= 2) {

          proxima.unshift(
            atual.pop()
          );

        }

      }


      if (
        primeiro.__linhasNoBloco > 1 &&
        primeiro.__indiceLinhaNoBloco ===
        primeiro.__linhasNoBloco - 1
      ) {

        if (atual.length) {

          atual.push(
            proxima.shift()
          );

        }

      }

    }

    return paginas;

  }



  function paginar(texto, opcoes) {

    const modo = opcoes.modo || "polux";
    const perfil = opcoes.perfil;
    const container = opcoes.container;
    const versosPorEstrofe =
      opcoes.versosPorEstrofe || 6;


    const capacidade =
      estimarCapacidadeLinhas(
        container,
        perfil
      );

    const maxChars =
      estimarMaxChars(
        container,
        perfil
      );


    const blocos =
      normalizarBlocos(
        texto,
        modo,
        versosPorEstrofe
      );


    const linhasExpandida = [];


    blocos.forEach(
      (bloco, indiceBloco) => {

        let linhas;


        if (bloco.tipo === "paragrafo") {

          linhas =
            dividirLinhas(
              bloco.texto,
              maxChars
            );

        } else {

          linhas =
            bloco.linhasOriginais.slice();

        }


        linhas.forEach(
          (linha, indiceLinha) => {

            linhasExpandida.push({

              texto: linha,
              tipo: bloco.tipo,

              __bloco: indiceBloco,

              __indiceLinhaNoBloco:
                indiceLinha,

              __linhasNoBloco:
                linhas.length

            });

          }
        );


        linhasExpandida.push({

          texto: "",
          tipo: "espaco",

          __bloco: indiceBloco,

          __indiceLinhaNoBloco: -1,

          __linhasNoBloco: 0

        });

      }
    );


    const paginas = [];
    let paginaAtual = [];


    for (const linha of linhasExpandida) {

      if (
        paginaAtual.length >=
        capacidade
      ) {

        paginas.push(paginaAtual);

        paginaAtual = [];

      }

      paginaAtual.push(linha);

    }


    if (paginaAtual.length) {

      paginas.push(paginaAtual);

    }


    if (
      perfil.pagina.evitarOrfa ||
      perfil.pagina.evitarViuva
    ) {

      return evitarOrfasViuvias(
        paginas
      );

    }


    return paginas;

  }



  function aplicarEstiloPagina(
    el,
    perfil,
    numeroPagina
  ) {

    const par =
      numeroPagina % 2 === 0;


    const margemEsquerda =
      perfil.margens.espelhada
        ? (par
            ? perfil.margens.externaCm
            : perfil.margens.internaCm)
        : perfil.margens.externaCm;


    const margemDireita =
      perfil.margens.espelhada
        ? (par
            ? perfil.margens.internaCm
            : perfil.margens.externaCm)
        : perfil.margens.internaCm;


    el.style.boxSizing = "border-box";

    el.style.paddingTop =
      perfil.margens.superiorCm + "cm";

    el.style.paddingBottom =
      perfil.margens.inferiorCm + "cm";

    el.style.paddingLeft =
      margemEsquerda + "cm";

    el.style.paddingRight =
      margemDireita + "cm";


    el.style.fontSize =
      perfil.tipografia.fontSizePx + "px";


    el.style.lineHeight =
      perfil.tipografia.lineHeight;


    el.style.hyphens =
      perfil.tipografia.hifenizacao === true
        ? "auto"
        : "manual";

  }



  function criarPaginaDOM(
    linhas,
    perfil,
    numeroPagina
  ) {

    const pagina =
      document.createElement("div");


    pagina.className =
      "pagina-lapidar";


    aplicarEstiloPagina(
      pagina,
      perfil,
      numeroPagina
    );


    const corpo =
      document.createElement("div");


    corpo.className =
      "pagina-corpo";


    for (const linha of linhas) {

      const p =
        document.createElement("div");


      p.className =
        "linha-" + linha.tipo;


      p.textContent =
        linha.texto;


      if (linha.tipo === "espaco") {

        p.innerHTML = "&nbsp;";

      }


      corpo.appendChild(p);

    }


    pagina.appendChild(corpo);


    if (perfil.render.mostrarRodape) {

      const rodape =
        document.createElement("div");


      rodape.className =
        "pagina-rodape";


      rodape.textContent =
        numeroPagina;


      rodape.style.marginTop = "1em";

      rodape.style.textAlign =
        "center";

      rodape.style.fontSize =
        "0.85em";


      pagina.appendChild(rodape);

    }


    return pagina;

  }



  function renderizar(
    targetEl,
    texto,
    nomePerfil,
    modo,
    opcoesExtras = {}
  ) {

    if (!global.CONFIG_TIPOGRAFICA) {

      throw new Error(
        "CONFIG_TIPOGRAFICA não carregado."
      );

    }


    const perfil =
      global.CONFIG_TIPOGRAFICA
        .obterPerfil(nomePerfil);


    if (
      typeof opcoesExtras
        .versosPorEstrofe === "number"
    ) {

      perfil.cordel =
        perfil.cordel || {};


      perfil.cordel
        .versosPorEstrofe =
        opcoesExtras
          .versosPorEstrofe;

    }


    const paginas =
      paginar(texto, {

        modo,

        perfil,

        container: targetEl,

        versosPorEstrofe:
          (perfil.cordel &&
           perfil.cordel
             .versosPorEstrofe)
          || 6

      });


    targetEl.innerHTML = "";


    paginas.forEach(
      (linhas, index) => {

        targetEl.appendChild(

          criarPaginaDOM(
            linhas,
            perfil,
            index + 1
          )

        );

      }
    );


    return paginas.length;

  }



  global.MOTOR_TIPOGRAFICO = {

    cmParaPx,

    dividirLinhas,

    normalizarBlocos,

    paginar,

    renderizar

  };

})(window);
