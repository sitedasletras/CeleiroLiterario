/*
  Celeiro Literário / Lapidar — Motor de Paginação Real v1
  ----------------------------------------------------------
  Motor isolado e leve para transformar blocos editoriais em páginas reais.

  Objetivo:
  - calcular páginas com base em formato, margens, fonte, entrelinha e blocos;
  - preservar poesia, cordel, títulos e diálogos;
  - preparar saída para Pólux, Castor, Centauro, Qui(RON)xadá e Hércules;
  - entregar uma estrutura limpa para PDF/EPUB e prévia editorial.

  Sem dependências externas. JavaScript puro.
*/

(function(){
  const formatos = {
    A5: { nome:'A5', larguraMm:148, alturaMm:210, pxLargura:420, pxAltura:595 },
    '14x21': { nome:'14x21', larguraMm:140, alturaMm:210, pxLargura:397, pxAltura:595 },
    '16x23': { nome:'16x23', larguraMm:160, alturaMm:230, pxLargura:454, pxAltura:652 },
    '6x9': { nome:'6x9', larguraMm:152.4, alturaMm:228.6, pxLargura:432, pxAltura:648 },
    A4: { nome:'A4', larguraMm:210, alturaMm:297, pxLargura:595, pxAltura:842 }
  };

  const configPadrao = {
    formato:'16x23',
    fontePx:16,
    entrelinha:1.45,
    margemTopoPx:54,
    margemRodapePx:54,
    margemInternaPx:54,
    margemExternaPx:46,
    preservarPoesia:true,
    preservarCordel:true,
    evitarTituloSolitario:true,
    primeiraPagina:1
  };

  function textoSeguro(v){ return String(v || '').trim(); }
  function palavras(txt){ return (textoSeguro(txt).match(/\b[\wÀ-ÿ'-]+\b/g) || []).length; }
  function linhasReais(txt){ return textoSeguro(txt).split('\n').filter(Boolean).length || 1; }

  function larguraUtilPagina(formato, cfg){
    return formato.pxLargura - cfg.margemInternaPx - cfg.margemExternaPx;
  }

  function estimarLinhas(bloco, cfg, formato){
    const txt = textoSeguro(bloco.conteudo || bloco.texto || '');
    const larguraUtil = larguraUtilPagina(formato, cfg);
    const charsLinha = Math.max(24, Math.floor(larguraUtil / (cfg.fontePx * 0.52)));
    return txt.split('\n').reduce((total, linha)=>{
      const len = textoSeguro(linha).length;
      return total + Math.max(1, Math.ceil(len / charsLinha));
    }, 0);
  }

  function estimarAltura(bloco, cfg, formato){
    const tipo = bloco.tipo || 'prosa';
    const linhas = estimarLinhas(bloco, cfg, formato);
    let extra = 12;
    if(tipo === 'capitulo' || tipo === 'titulo') extra = 56;
    if(tipo === 'subtitulo') extra = 34;
    if(tipo === 'poesia' || tipo === 'sextilha' || tipo === 'cordel') extra = 22;
    return Math.ceil((linhas * cfg.fontePx * cfg.entrelinha) + extra);
  }

  function criarPagina(numero, cfg){
    return {
      numero,
      lado: numero % 2 === 0 ? 'verso' : 'recto',
      blocos:[],
      alturaUsada:0,
      ajustes:[],
      margemInternaPx:cfg.margemInternaPx,
      margemExternaPx:cfg.margemExternaPx
    };
  }

  function ehTitulo(bloco){
    if(!bloco) return false;
    if(['capitulo','titulo','subtitulo'].includes(bloco.tipo)) return true;
    return /^cap[íi]tulo\b|^parte\b|^canto\b/i.test(textoSeguro(bloco.conteudo || bloco.texto));
  }

  function ehPoetico(bloco){
    return bloco && ['poesia','sextilha','cordel'].includes(bloco.tipo);
  }

  function paginar(blocosEntrada, opcoes){
    const cfg = Object.assign({}, configPadrao, opcoes || {});
    const formato = formatos[cfg.formato] || formatos['16x23'];
    const alturaUtil = formato.pxAltura - cfg.margemTopoPx - cfg.margemRodapePx;
    const blocos = (blocosEntrada || []).map((b,i)=>Object.assign({id:'bloco-'+(i+1), tipo:'prosa'}, b));
    const paginas = [];
    let pagina = criarPagina(cfg.primeiraPagina, cfg);

    blocos.forEach((bloco)=>{
      const altura = estimarAltura(bloco, cfg, formato);
      const blocoFinal = Object.assign({}, bloco, { alturaEstimada:altura, palavras: palavras(bloco.conteudo || bloco.texto), linhas: linhasReais(bloco.conteudo || bloco.texto) });

      const cabe = pagina.alturaUsada + altura <= alturaUtil;
      const paginaVazia = pagina.blocos.length === 0;

      if(!cabe && !paginaVazia){
        if(cfg.evitarTituloSolitario && ehTitulo(blocoFinal)){
          paginas.push(pagina);
          pagina = criarPagina(cfg.primeiraPagina + paginas.length, cfg);
        } else {
          paginas.push(pagina);
          pagina = criarPagina(cfg.primeiraPagina + paginas.length, cfg);
        }
      }

      pagina.blocos.push(blocoFinal);
      pagina.alturaUsada += altura;
    });

    if(pagina.blocos.length) paginas.push(pagina);

    return {
      motor:'Celeiro.MotorPaginacaoReal.v1',
      formato,
      configuracao:cfg,
      paginas,
      estatisticas:{ paginas:paginas.length, blocos:blocos.length },
      criadoEm:new Date().toISOString()
    };
  }

  function gerarHTMLPaginas(resultado){
    const formato = resultado.formato || formatos['16x23'];
    return (resultado.paginas || []).map(p=>{
      const blocos = p.blocos.map(b=>`<div class="lp-bloco lp-${b.tipo}" data-bloco="${b.id}">${escapeHTML(b.conteudo || b.texto || '').replace(/\n/g,'<br>')}</div>`).join('\n');
      return `<section class="lp-pagina ${p.lado}" data-pagina="${p.numero}" style="width:${formato.pxLargura}px;min-height:${formato.pxAltura}px">${blocos}<footer>${p.numero}</footer></section>`;
    }).join('\n');
  }

  function escapeHTML(s){ return String(s||'').replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[m])); }

  window.CeleiroMotorPaginacaoReal = { formatos, configPadrao, paginar, gerarHTMLPaginas, estimarAltura };
})();
