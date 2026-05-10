/**
 * CeleiroMotorDiagramacaoBase
 * Motor central de diagramação compartilhado por Centauro, Qui(RON)xadá, Hércules e demais módulos.
 * Celeiro Literário · Site das Letras Edições Literárias
 */
(function (global) {
  "use strict";

  // ── FORMATOS ─────────────────────────────────────────────────────────────
  const FORMATOS = {
    a5:    { w: 148, h: 210, unit: "mm" },
    a4:    { w: 210, h: 297, unit: "mm" },
    "14x21": { w: 140, h: 210, unit: "mm" },
    "16x23": { w: 160, h: 230, unit: "mm" },
    "6x9":   { w: 152, h: 229, unit: "mm" },
    carta:   { w: 216, h: 279, unit: "mm" },
  };

  const FORMATO_PX = {
    a5:      { w: 420, h: 595 },
    a4:      { w: 595, h: 842 },
    "14x21": { w: 400, h: 595 },
    "16x23": { w: 454, h: 652 },
    "6x9":   { w: 432, h: 648 },
    carta:   { w: 612, h: 792 },
  };

  const MARGENS_PX = {
    estreita: { t: 32, r: 32, b: 48, l: 32 },
    normal:   { t: 48, r: 48, b: 60, l: 48 },
    ampla:    { t: 60, r: 60, b: 72, l: 60 },
    infantil: { t: 40, r: 40, b: 52, l: 40 },
  };

  // ── NORMALIZAÇÃO ──────────────────────────────────────────────────────────
  function normalizar(text) {
    return String(text || "")
      .replace(/\r\n/g, "\n").replace(/\r/g, "\n")
      .replace(/\u00A0/g, " ").replace(/\t/g, " ")
      .replace(/[ ]{2,}/g, " ").replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function escapar(text) {
    return String(text || "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // ── QUEBRAR BLOCOS ────────────────────────────────────────────────────────
  function quebrarBlocos(text) {
    const norm = normalizar(text);
    if (!norm) return [];
    return norm.split(/\n\s*\n/).map(bloco => {
      const linhas = bloco.split("\n").map(l => l.trim()).filter(Boolean);
      if (!linhas.length) return null;
      const avgLen = linhas.reduce((s, l) => s + l.length, 0) / linhas.length;
      const ehPoesia = avgLen <= 55 && linhas.length >= 2;
      const ehTitulo = linhas.length === 1 && /^(cap[ií]tulo|parte|pr[oó]logo|ep[ií]logo|ode|canto|conto|poema)\b/i.test(linhas[0]);
      const ehDialogo = linhas.some(l => /^[—–-]/.test(l));
      const ehReceita = /^(ingredientes|modo de preparo|preparo|rendimento|tempo|porções)/i.test(linhas[0]);
      const ehTecnico = /^\d+[\.\)]\s/.test(linhas[0]) || /^(capítulo|seção|subseção|nota|referência)/i.test(linhas[0]);
      let tipo = "prosa";
      if (ehTitulo)   tipo = "titulo";
      else if (ehPoesia)  tipo = "poesia";
      else if (ehDialogo) tipo = "dialogo";
      else if (ehReceita) tipo = "receita";
      else if (ehTecnico) tipo = "tecnico";
      return { linhas, tipo, raw: bloco };
    }).filter(Boolean);
  }

  // ── DETECTAR TIPO GLOBAL ──────────────────────────────────────────────────
  function detectarTipo(blocos) {
    if (!blocos.length) return { tipo: "vazio", confianca: 1 };
    const contagem = { prosa: 0, poesia: 0, dialogo: 0, titulo: 0, receita: 0, tecnico: 0 };
    blocos.forEach(b => { if (contagem[b.tipo] !== undefined) contagem[b.tipo]++; });
    const total = blocos.length;
    const pct = k => contagem[k] / total;
    if (pct("receita") > 0.2) return { tipo: "receita", confianca: pct("receita") };
    if (pct("tecnico") > 0.2) return { tipo: "tecnico", confianca: pct("tecnico") };
    if (pct("poesia") > 0.6)  return { tipo: "poesia",  confianca: pct("poesia") };
    if (pct("prosa")  > 0.6)  return { tipo: "prosa",   confianca: pct("prosa") };
    return { tipo: "hibrido", confianca: 0.5 };
  }

  // ── CORREÇÕES ─────────────────────────────────────────────────────────────
  function correcaoLeve(text) {
    let t = normalizar(text);
    t = t.replace(/\s+([,\.!?;:])/g, "$1");
    t = t.replace(/\.{4,}/g, "...");
    t = t.replace(/!!+/g, "!").replace(/\?\?+/g, "?");
    t = t.replace(/\bPra mim fazer\b/g, "Para eu fazer");
    t = t.replace(/\bpra mim fazer\b/g, "para eu fazer");
    return t;
  }

  function correcaoMedia(text) {
    let t = correcaoLeve(text);
    t = t.replace(/\bA gente fomos\b/g, "A gente foi");
    t = t.replace(/\ba gente fomos\b/g, "a gente foi");
    t = t.replace(/\bmais eu\b/g, "mas eu");
    t = t.replace(/\bMais eu\b/g, "Mas eu");
    return t;
  }

  // ── CSS BASE ──────────────────────────────────────────────────────────────
  function gerarCSS(opts) {
    const fmt  = FORMATO_PX[opts.formato] || FORMATO_PX.a5;
    const marg = MARGENS_PX[opts.margem]  || MARGENS_PX.normal;
    const ff   = opts.fonteCorpo || "Georgia, 'Times New Roman', serif";
    const fs   = (opts.tamanhoFonte || 12) + "pt";
    const lh   = opts.entrelinha || 1.45;
    const corTexto   = opts.corTexto   || "#1f2430";
    const corFundo   = opts.corFundo   || "#ffffff";
    const corTitulo  = opts.corTitulo  || "#22364c";
    const corMuted   = opts.corMuted   || "#667487";
    const corAccent  = opts.corAccent  || "#2f5a4d";

    return `
.pagina-editorial {
  width: ${fmt.w}px;
  min-height: ${fmt.h}px;
  background: ${corFundo};
  color: ${corTexto};
  font-family: ${ff};
  font-size: ${fs};
  line-height: ${lh};
  padding: ${marg.t}px ${marg.r}px ${marg.b}px ${marg.l}px;
  box-shadow: 0 12px 32px rgba(0,0,0,.15);
  position: relative;
  box-sizing: border-box;
}
.pagina-editorial .capitulo {
  font-size: 1.7em;
  font-weight: 700;
  color: ${corTitulo};
  text-align: center;
  margin: 0 0 .6em 0;
  line-height: 1.15;
  break-before: page;
  page-break-before: always;
}
.pagina-editorial .subtitulo {
  font-size: 1.1em;
  font-style: italic;
  color: ${corMuted};
  text-align: center;
  margin: -.3em 0 1.4em 0;
}
.pagina-editorial .paragrafo {
  margin: 0 0 .5em 0;
  text-align: justify;
  text-indent: ${opts.recuo ? "2em" : "0"};
}
.pagina-editorial .paragrafo:first-of-type {
  text-indent: 0;
}
.pagina-editorial .estrofe {
  margin: 0 0 1.2em 0;
  white-space: pre-line;
  text-align: ${opts.alinhPoesia || "left"};
}
.pagina-editorial .dialogo {
  margin: 0 0 .5em 0;
  text-indent: 0;
  text-align: justify;
}
.pagina-editorial .ornamento {
  text-align: center;
  color: ${corAccent};
  margin: 1em 0;
  font-size: 1.1em;
  letter-spacing: .3em;
  opacity: .6;
}
.pagina-editorial .drop-cap::first-letter {
  float: left;
  font-size: 3.2em;
  line-height: .82;
  margin: .07em .12em 0 0;
  font-weight: 900;
  color: ${corAccent};
}
.pagina-editorial .secao-titulo {
  font-size: 1.15em;
  font-weight: 700;
  color: ${corTitulo};
  margin: 1.2em 0 .5em 0;
  border-bottom: 1px solid rgba(0,0,0,.1);
  padding-bottom: .3em;
}
.pagina-editorial .item-lista {
  margin: 0 0 .35em 0;
  padding-left: 1.4em;
  position: relative;
}
.pagina-editorial .item-lista::before {
  content: "•";
  position: absolute;
  left: 0;
  color: ${corAccent};
}
.pagina-editorial .rodape-pagina {
  position: absolute;
  bottom: 16px;
  left: ${marg.l}px;
  right: ${marg.r}px;
  text-align: center;
  font-size: .82em;
  color: ${corMuted};
  border-top: 1px solid rgba(0,0,0,.08);
  padding-top: 6px;
}
/* infantil */
.pagina-editorial.modo-infantil {
  border-radius: 18px;
}
.pagina-editorial.modo-infantil .capitulo {
  font-size: 2em;
}
.pagina-editorial.modo-infantil .paragrafo {
  font-size: 1.12em;
  line-height: 1.7;
}
/* receita */
.pagina-editorial .bloco-receita-titulo {
  font-size: 1.3em;
  font-weight: 700;
  color: ${corAccent};
  margin: 0 0 .4em 0;
}
.pagina-editorial .bloco-receita-secao {
  font-size: .9em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: ${corMuted};
  margin: .8em 0 .3em 0;
}
.pagina-editorial .bloco-receita-item {
  margin: 0 0 .3em 0;
  padding-left: 1.2em;
  position: relative;
}
.pagina-editorial .bloco-receita-item::before {
  content: "·";
  position: absolute;
  left: 0;
  color: ${corAccent};
}
/* técnico */
.pagina-editorial .bloco-tecnico-num {
  font-weight: 700;
  color: ${corAccent};
}
/* foto */
.pagina-editorial .bloco-foto {
  background: #f0f0f0;
  border-radius: 10px;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: .9em;
  margin: .8em 0;
  border: 1px dashed #ccc;
}
`;
  }

  // ── RENDERIZAR BLOCO ──────────────────────────────────────────────────────
  function renderizarBloco(bloco, opts, isFirst) {
    const texto = bloco.linhas.join(" ");
    const esc   = escapar;

    switch (bloco.tipo) {
      case "titulo":
        return `<h2 class="capitulo">${esc(texto)}</h2>`;

      case "poesia":
        return `<div class="estrofe">${esc(bloco.linhas.join("\n"))}</div>`;

      case "dialogo":
        return bloco.linhas.map(l => `<p class="dialogo">${esc(l)}</p>`).join("");

      case "receita": {
        const header = bloco.linhas[0];
        const resto  = bloco.linhas.slice(1);
        let html = `<div class="bloco-receita-titulo">${esc(header)}</div>`;
        let secaoAtual = "";
        resto.forEach(l => {
          if (/^(ingredientes|modo de preparo|preparo|rendimento|tempo|porções|dica)/i.test(l)) {
            secaoAtual = l;
            html += `<div class="bloco-receita-secao">${esc(l)}</div>`;
          } else {
            html += `<div class="bloco-receita-item">${esc(l)}</div>`;
          }
        });
        return html;
      }

      case "tecnico": {
        return bloco.linhas.map(l => {
          const m = l.match(/^(\d+[\.\)])\s+(.*)/);
          if (m) return `<p class="item-lista"><span class="bloco-tecnico-num">${esc(m[1])}</span> ${esc(m[2])}</p>`;
          return `<p class="paragrafo">${esc(l)}</p>`;
        }).join("");
      }

      default: { // prosa
        const cls = (isFirst && opts.letraCapitular) ? "paragrafo drop-cap" : "paragrafo";
        return `<p class="${cls}">${esc(texto)}</p>`;
      }
    }
  }

  // ── MONTAR PREVIEW ────────────────────────────────────────────────────────
  function montarPreview(texto, opts) {
    opts = Object.assign({
      preset: "centauro",
      formato: "a5",
      margem: "normal",
      fonteCorpo: "Georgia, 'Times New Roman', serif",
      tamanhoFonte: 12,
      entrelinha: 1.45,
      letraCapitular: true,
      ornamentos: true,
      simboloOrnamento: "✦",
      recuo: true,
      alinhPoesia: "left",
    }, opts || {});

    const nivel = opts.correcao || "light";
    const textoCorrido = nivel === "medium" ? correcaoMedia(texto) : correcaoLeve(texto);
    const blocos = quebrarBlocos(textoCorrido);
    const tipoDetectado = detectarTipo(blocos);
    const css = gerarCSS(opts);

    let html = "";
    let isFirst = true;
    blocos.forEach((bloco, idx) => {
      if (opts.ornamentos && idx > 0 && bloco.tipo === "titulo") {
        html += `<div class="ornamento">${escapar(opts.simboloOrnamento)}</div>`;
      }
      html += renderizarBloco(bloco, opts, isFirst);
      if (bloco.tipo === "prosa") isFirst = false;
    });

    if (!html) html = `<p class="paragrafo" style="color:#aaa;font-style:italic;">Prévia aparecerá aqui.</p>`;

    return { css, html, tipoDetectado, blocos, textoCorrido };
  }

  // ── ALERTAS ───────────────────────────────────────────────────────────────
  function gerarAlertas(blocos) {
    const alertas = [];
    blocos.forEach((bloco, idx) => {
      bloco.linhas.forEach((linha, li) => {
        if (linha.length > 95) alertas.push(`Bloco ${idx+1}, linha ${li+1}: linha muito longa.`);
      });
      if (bloco.tipo === "prosa" && bloco.linhas.length === 1 && bloco.linhas[0].length < 25) {
        alertas.push(`Bloco ${idx+1}: fragmento de prosa muito curto.`);
      }
    });
    return alertas;
  }

  // ── EXPORT ────────────────────────────────────────────────────────────────
  global.CeleiroMotorDiagramacaoBase = {
    normalizar, escapar, quebrarBlocos, detectarTipo,
    correcaoLeve, correcaoMedia, gerarCSS,
    renderizarBloco, montarPreview, gerarAlertas,
    FORMATOS, FORMATO_PX, MARGENS_PX,
  };

})(typeof window !== "undefined" ? window : global);
