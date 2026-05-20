/**
 * CeleiroMotorEditorial — v2
 * Motor central compartilhado por Pólux, Castor e Centauro.
 * Integra: motor_layout_inteligente_v1 + motor_preparacao_tecnica_paginacao_v1
 * Adiciona: hifenização silábica PT-BR, correção real de viúvas/órfãs,
 *           regulador de parágrafo, capitular com 5 estilos.
 */
(function(global){
"use strict";

// ── FORMATOS ──────────────────────────────────────────────────────────────
const FORMATOS = {
  A5:     { nome:"A5",      w:420, h:595,  mT:52, mB:58, mI:54, mE:46 },
  "14x21":{ nome:"14×21",   w:397, h:595,  mT:54, mB:60, mI:56, mE:48 },
  "16x23":{ nome:"16×23",   w:454, h:652,  mT:58, mB:64, mI:60, mE:50 },
  "6x9":  { nome:"6×9 pol", w:432, h:648,  mT:56, mB:62, mI:58, mE:48 },
  A4:     { nome:"A4",      w:595, h:842,  mT:72, mB:78, mI:72, mE:62 },
};

// ── HIFENIZAÇÃO SILÁBICA PT-BR ─────────────────────────────────────────
// Regras simplificadas: consoante+vogal, prefixos comuns
const VOGAIS = /[aeiouáéíóúâêôãõàäëïöü]/i;
const DIGS   = /[a-záéíóúâêôãõàäëïöü]/i;

function hifenizarPalavra(palavra){
  if(palavra.length <= 4) return palavra;
  // nunca hifenizar siglas ou números
  if(/[A-ZÁÉÍÓÚ]{3,}/.test(palavra)) return palavra;
  if(/\d/.test(palavra)) return palavra;

  const prefixos = ['des','trans','sub','super','inter','intra','extra','contra',
                    'sobre','entre','semi','anti','auto','re','pre','pro','bi','tri'];
  for(const p of prefixos){
    if(palavra.toLowerCase().startsWith(p) && palavra.length > p.length + 3){
      return palavra.slice(0, p.length) + '\u00AD' + palavra.slice(p.length);
    }
  }

  // regra CV: inserir hífen suave antes de consoante seguida de vogal
  let resultado = '';
  for(let i = 0; i < palavra.length - 2; i++){
    resultado += palavra[i];
    const c1 = palavra[i],   c2 = palavra[i+1], c3 = palavra[i+2];
    const v1 = VOGAIS.test(c1), v2 = VOGAIS.test(c2), v3 = VOGAIS.test(c3);
    // VC | CV
    if(v1 && !v2 && v3 && i > 0){
      resultado += '\u00AD';
    }
    // VCC | V
    if(v1 && !v2 && !v3 && i+3 < palavra.length && VOGAIS.test(palavra[i+3]) && i > 0){
      resultado += '\u00AD';
    }
  }
  resultado += palavra.slice(resultado.replace(/\u00AD/g,'').length);
  return resultado;
}

function hifenizarTexto(texto, nivel){
  if(nivel === 'off') return texto;
  return texto.replace(/\b([a-záéíóúâêôãõàäëïöü]{5,})\b/gi, p => hifenizarPalavra(p));
}

// ── NORMALIZAÇÃO ──────────────────────────────────────────────────────────
function normalizar(t){
  return String(t||'')
    .replace(/\r\n/g,'\n').replace(/\r/g,'\n')
    .replace(/\t/g,' ').replace(/[ ]{2,}/g,' ')
    .replace(/\n{4,}/g,'\n\n\n').trim();
}

function escapar(s){
  return String(s||'').replace(/[&<>"']/g,m=>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

// ── CORREÇÃO TEXTUAL ──────────────────────────────────────────────────────
function correcaoLeve(t){
  let o = normalizar(t);
  o = o.replace(/\s+([,\.!?;:])/g,'$1');
  o = o.replace(/\.{4,}/g,'...');
  o = o.replace(/!!+/g,'!').replace(/\?\?+/g,'?');
  return o;
}
function correcaoMedia(t){
  let o = correcaoLeve(t);
  o = o.replace(/\bA gente fomos\b/g,'A gente foi');
  o = o.replace(/\ba gente fomos\b/g,'a gente foi');
  o = o.replace(/\bpra mim fazer\b/g,'para eu fazer');
  o = o.replace(/\bPra mim fazer\b/g,'Para eu fazer');
  o = o.replace(/\bmais eu\b/g,'mas eu').replace(/\bMais eu\b/g,'Mas eu');
  return o;
}

// ── DETECÇÃO DE BLOCOS ────────────────────────────────────────────────────
const RE_CAP = /^(cap[íi]tulo|cap\.|parte\s+|livro\s+|canto\s+|conto\s+|poema\s+|pr[oó]logo|ep[íi]logo)\b/i;

function tipoDobloco(bloco){
  const ls = bloco.split('\n').map(l=>l.trim()).filter(Boolean);
  if(!ls.length) return 'vazio';
  if(RE_CAP.test(ls[0])) return 'capitulo';
  if(ls.length === 6 && ls.every(l=>l.length<=82)) return 'sextilha';
  if(ls.length > 1 && ls.filter(l=>l.length<=70).length/ls.length > .65) return 'poesia';
  if(/^[-–—]\s/.test(ls[0])) return 'dialogo';
  return 'prosa';
}

function quebrarBlocos(texto){
  return normalizar(texto).split(/\n\s*\n/)
    .map(b=>b.trim()).filter(Boolean)
    .map((conteudo,i)=>({
      id:`B${String(i+1).padStart(4,'0')}`,
      ordem:i+1, tipo:tipoDobloco(conteudo), conteudo,
      palavras:(conteudo.match(/\b[\wÀ-ÿ'-]+\b/g)||[]).length
    }));
}

function classificarObra(blocos){
  if(!blocos.length) return 'vazio';
  const total = blocos.length;
  const nPoesia = blocos.filter(b=>b.tipo==='poesia'||b.tipo==='sextilha').length;
  const nSext   = blocos.filter(b=>b.tipo==='sextilha').length;
  const nCap    = blocos.filter(b=>b.tipo==='capitulo').length;
  if(nSext >= 3 && nPoesia/total > .55) return 'cordel';
  if(nPoesia/total > .65 && nCap <= 2) return 'poesia';
  if(nPoesia/total > .25 && nCap >= 1) return 'hibrido';
  return 'prosa';
}

// ── ESTIMATIVA DE ALTURA ──────────────────────────────────────────────────
function estimarAltura(bloco, cfg){
  const fmt = FORMATOS[cfg.formato] || FORMATOS['16x23'];
  const largUtil = fmt.w - cfg.mI - cfg.mE;
  const fs = cfg.fontSize || 13;
  const lh = cfg.lineHeight || 1.52;
  const cpl = Math.max(24, Math.floor(largUtil / (fs * 0.53)));
  let linhas = 0;
  bloco.conteudo.split('\n').forEach(l=>{
    linhas += Math.max(1, Math.ceil(Math.max(1,l.trim().length) / cpl));
  });
  const extra = bloco.tipo==='capitulo' ? 48 : bloco.tipo==='sextilha' ? 20 : 14;
  return Math.ceil(linhas * fs * lh + extra);
}

// ── VIÚVAS E ÓRFÃS ────────────────────────────────────────────────────────
/**
 * Recebe array de blocos já paginados e detecta / corrige viúvas e órfãs.
 * Viúva: última linha de um parágrafo fica sozinha no topo da próxima página.
 * Órfã: primeira linha de um parágrafo fica sozinha no fim de uma página.
 * Correção: mover o bloco problemático para a página seguinte ou anterior.
 */
function corrigirViuvasOrfas(paginas, cfg, nivel){
  if(nivel === 'off') return paginas;
  const fmt = FORMATOS[cfg.formato] || FORMATOS['16x23'];
  const altUtil = fmt.h - (cfg.mT||52) - (cfg.mB||58);
  const fs = cfg.fontSize || 13;
  const lh = cfg.lineHeight || 1.52;
  const altLinha = Math.ceil(fs * lh);
  const minLinhasPagina = nivel === 'tight' ? 3 : 2; // mínimo de linhas no topo/base

  for(let pi = 0; pi < paginas.length - 1; pi++){
    const pag = paginas[pi];
    const prox = paginas[pi+1];

    // ÓRFÃ: bloco de prosa que tem apenas 1 linha no fim da página
    const ult = pag.blocos[pag.blocos.length - 1];
    if(ult && ult.tipo === 'prosa'){
      const fmt2 = FORMATOS[cfg.formato]||FORMATOS['16x23'];
      const largUtil = fmt2.w - (cfg.mI||54) - (cfg.mE||46);
      const cpl = Math.max(24, Math.floor(largUtil/(fs*0.53)));
      const totalLinhas = ult.conteudo.split('\n').reduce((s,l)=>
        s + Math.max(1,Math.ceil(l.trim().length/cpl)), 0);
      if(totalLinhas <= minLinhasPagina){
        // mover bloco para próxima página
        pag.blocos.pop();
        pag.alturaUsada -= estimarAltura(ult, cfg);
        prox.blocos.unshift(ult);
        prox.alturaUsada += estimarAltura(ult, cfg);
        ult._corrigido = 'orfã';
      }
    }

    // VIÚVA: primeiro bloco da próxima página tem apenas 1 linha
    const prim = prox.blocos[0];
    if(prim && prim.tipo === 'prosa'){
      const fmt2 = FORMATOS[cfg.formato]||FORMATOS['16x23'];
      const largUtil2 = fmt2.w - (cfg.mI||54) - (cfg.mE||46);
      const cpl2 = Math.max(24, Math.floor(largUtil2/(fs*0.53)));
      const totalLinhas2 = prim.conteudo.split('\n').reduce((s,l)=>
        s + Math.max(1,Math.ceil(l.trim().length/cpl2)), 0);
      if(totalLinhas2 <= minLinhasPagina){
        prox.blocos.shift();
        prox.alturaUsada -= estimarAltura(prim, cfg);
        pag.blocos.push(prim);
        pag.alturaUsada += estimarAltura(prim, cfg);
        prim._corrigido = 'viúva';
      }
    }
  }
  return paginas;
}

// ── PAGINAÇÃO ──────────────────────────────────────────────────────────────
function paginar(blocos, cfg){
  const fmt = FORMATOS[cfg.formato]||FORMATOS['16x23'];
  const altUtil = fmt.h - (cfg.mT||52) - (cfg.mB||58);
  const paginas = [];
  let pag = { numero:1, lado:'recto', blocos:[], alturaUsada:0 };

  blocos.forEach(bloco=>{
    const alt = estimarAltura(bloco, cfg);
    // capítulo sempre começa em nova página se configurado
    if(bloco.tipo==='capitulo' && pag.blocos.length > 0){
      paginas.push(pag);
      pag = { numero:paginas.length+1, lado:paginas.length%2===0?'recto':'verso', blocos:[], alturaUsada:0 };
    }
    if(pag.blocos.length && pag.alturaUsada + alt > altUtil){
      paginas.push(pag);
      pag = { numero:paginas.length+1, lado:paginas.length%2===0?'recto':'verso', blocos:[], alturaUsada:0 };
    }
    pag.blocos.push({...bloco, altEstimada:alt});
    pag.alturaUsada += alt;
  });
  if(pag.blocos.length) paginas.push(pag);
  return paginas;
}

// ── PREPARAR (entrada principal) ──────────────────────────────────────────
function preparar(textoBruto, opcoes){
  const cfg = Object.assign({
    formato:'16x23', fontSize:13, lineHeight:1.52,
    mT:58, mB:64, mI:60, mE:50,
    correcao:'light', hifenizacao:'light',
    viuvasOrfas:'warn', capitular:'classic',
    modulo:'polux'
  }, opcoes||{});

  const corr = cfg.correcao === 'medium' ? correcaoMedia : correcaoLeve;
  const textoCorrigido = corr(textoBruto||'');
  const textoHifenizado = hifenizarTexto(textoCorrigido, cfg.hifenizacao);

  const blocos = quebrarBlocos(textoHifenizado);
  const tipoObra = classificarObra(blocos);
  let paginas = paginar(blocos, cfg);
  paginas = corrigirViuvasOrfas(paginas, cfg, cfg.viuvasOrfas);

  const corrigidos = paginas.flatMap(p=>p.blocos).filter(b=>b._corrigido);
  const palavras = (textoCorrigido.match(/\b[\wÀ-ÿ'-]+\b/g)||[]).length;

  return {
    motor:'CeleiroMotorEditorial.v2',
    modulo:cfg.modulo,
    tipoObra,
    cfg,
    formato:FORMATOS[cfg.formato]||FORMATOS['16x23'],
    blocos,
    paginas,
    stats:{
      palavras,
      paragrafos:blocos.filter(b=>b.tipo==='prosa').length,
      capitulos:blocos.filter(b=>b.tipo==='capitulo').length,
      paginas:paginas.length,
      corrigidos:corrigidos.length,
    },
    alertas: gerarAlertas(blocos, paginas, corrigidos),
  };
}

// ── ALERTAS ───────────────────────────────────────────────────────────────
function gerarAlertas(blocos, paginas, corrigidos){
  const alertas = [];
  corrigidos.forEach(b=>{
    alertas.push({ tipo:b._corrigido, bloco:b.id,
      msg:`${b._corrigido==='viúva'?'Viúva':'Órfã'} corrigida — bloco ${b.id} movido` });
  });
  blocos.forEach(b=>{
    const ls = b.conteudo.split('\n').filter(Boolean);
    if(b.tipo==='prosa' && ls.length===1 && ls[0].length < 25){
      alertas.push({ tipo:'fragmento', bloco:b.id, msg:`Bloco ${b.id}: parágrafo muito curto — revisar.` });
    }
  });
  return alertas;
}

// ── HTML DE CAPITULAR ─────────────────────────────────────────────────────
const CAPITULAR_CSS = {
  none:       '',
  simple:     'float:left;font-size:3.2em;line-height:.82;margin:.04em .12em 0 0;font-weight:700;',
  classic:    'float:left;font-size:3.9em;line-height:.82;margin:.02em .10em 0 0;font-weight:700;',
  ornamental: 'float:left;font-size:4em;line-height:.82;margin:.02em .12em 0 0;font-weight:700;border:1px solid #b7c1b9;padding:.06em .14em .02em;background:#f6f4ef;',
  medieval:   'float:left;font-size:4em;line-height:.82;margin:.02em .12em 0 0;font-weight:900;color:#3b1a08;border:2px double #d8a84c;padding:.04em .12em;background:#fffbe8;',
  iluminura:  'float:left;font-size:4.2em;line-height:.82;margin:.02em .14em 0 0;font-weight:900;color:#7c1212;border:3px solid #d8b56d;outline:1px solid #7c1212;padding:.04em .14em;background:#fff3bd;',
};

function aplicarCapitular(html, estilo){
  if(!estilo || estilo==='none') return html;
  const css = CAPITULAR_CSS[estilo]||CAPITULAR_CSS.classic;
  return html.replace(/^(.)/, `<span style="${css}">$1</span>`);
}

// ── RENDERIZAR HTML ───────────────────────────────────────────────────────
function renderizarBloco(bloco, cfg, isPrimeiro){
  const recuo = cfg.indent ? `text-indent:${cfg.indent}em;` : '';
  const gap   = `margin-bottom:${cfg.paragraphGap||0.35}em;`;
  let html = '';

  switch(bloco.tipo){
    case 'capitulo':
      html = `<h2 style="text-align:center;font-size:1.5em;font-weight:700;margin:0 0 .6em;line-height:1.1">${escapar(bloco.conteudo)}</h2>`;
      break;
    case 'poesia': case 'sextilha':
      html = `<div style="white-space:pre-line;margin-bottom:${cfg.paragraphGap||0.35}em;text-align:${cfg.alinhPoesia||'left'}">${escapar(bloco.conteudo)}</div>`;
      break;
    case 'dialogo':
      html = bloco.conteudo.split('\n').map(l=>
        `<p style="margin:0 0 .35em;text-indent:0">${escapar(l)}</p>`).join('');
      break;
    default: {
      const texto = escapar(bloco.conteudo);
      const style = isPrimeiro ? `margin:0 0 ${cfg.paragraphGap||0.35}em;text-indent:0;text-align:justify;`
                               : `${recuo}${gap}text-align:justify;`;
      let p = `<p style="${style}">${texto}</p>`;
      if(isPrimeiro && cfg.capitular && cfg.capitular !== 'none'){
        p = `<p style="${style}">${aplicarCapitular(texto, cfg.capitular)}</p>`;
      }
      html = p;
    }
  }
  return html;
}

function renderizarPagina(pagina, cfg, fmt, numeracao){
  const W = fmt.w, H = fmt.h;
  const mT = cfg.mT||52, mB = cfg.mB||58, mI = cfg.mI||54, mE = cfg.mE||46;
  const fs = cfg.fontSize||13;
  const lh = cfg.lineHeight||1.52;
  const ff = cfg.fontFamily||"Georgia,'Times New Roman',serif";
  const margL = pagina.lado==='recto' ? mI : mE;
  const margR = pagina.lado==='recto' ? mE : mI;

  let isPrimeiro = true;
  const conteudo = pagina.blocos.map(b=>{
    const html = renderizarBloco(b, cfg, isPrimeiro);
    if(b.tipo==='prosa') isPrimeiro = false;
    return html;
  }).join('');

  let numHtml = '';
  if(numeracao !== 'off'){
    const align = numeracao==='dir' ? 'right' : pagina.lado==='recto' ? 'right' : 'left';
    numHtml = `<div style="position:absolute;bottom:${Math.round(mB/2)}px;left:${margL}px;right:${margR}px;text-align:${align};font-size:.82em;color:#666;">${pagina.numero}</div>`;
  }

  return `<div style="width:${W}px;height:${H}px;background:#fff;position:relative;box-shadow:0 10px 28px rgba(0,0,0,.14);border-radius:3px;flex-shrink:0;overflow:hidden;">
  <div style="position:absolute;left:${margL}px;top:${mT}px;right:${margR}px;bottom:${mB}px;font-family:${ff};font-size:${fs}pt;line-height:${lh};overflow:hidden;">
    ${conteudo}
  </div>
  ${numHtml}
</div>`;
}

// ── EXPORT ────────────────────────────────────────────────────────────────
global.CeleiroMotorEditorial = {
  FORMATOS,
  preparar,
  quebrarBlocos,
  classificarObra,
  paginar,
  corrigirViuvasOrfas,
  hifenizarTexto,
  hifenizarPalavra,
  normalizar,
  escapar,
  correcaoLeve,
  correcaoMedia,
  gerarAlertas,
  renderizarBloco,
  renderizarPagina,
  aplicarCapitular,
  CAPITULAR_CSS,
};

})(typeof window !== 'undefined' ? window : global);
