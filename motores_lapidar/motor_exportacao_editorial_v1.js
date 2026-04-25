/*
  Lapidar — Motor de Exportação Editorial v1
  Núcleo seguro, leve e separado.

  Função:
  - montar HTML editorial de miolo;
  - montar HTML técnico de capa aberta;
  - montar pacote editorial JSON;
  - gerar base XHTML para EPUB futuro;
  - não abre janelas sozinho;
  - não força impressão sozinho;
  - pode ser chamado por qualquer módulo.
*/

(function(){
  function agora(){ return new Date().toISOString(); }

  function escapeHTML(s){
    return String(s || "").replace(/[&<>"']/g,function(m){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m];
    });
  }

  function slug(texto){
    return String(texto || "obra")
      .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      .replace(/[^a-z0-9\-_]+/gi,"_")
      .replace(/_+/g,"_")
      .replace(/^_|_$/g,"")
      .toLowerCase() || "obra";
  }

  function cssMiolo(opcoes){
    opcoes = opcoes || {};
    var formato = opcoes.formato || {larguraMm:160, alturaMm:230};
    var fonte = opcoes.fonte || "Georgia, Times New Roman, serif";
    var tamanho = opcoes.tamanhoFonte || 11;
    var entrelinha = opcoes.entrelinha || 1.45;

    return "@page{size:"+(formato.larguraMm||160)+"mm "+(formato.alturaMm||230)+"mm;margin:18mm 15mm 18mm 18mm;}"+
      "*{box-sizing:border-box;}"+
      "body{margin:0;background:#f4f0e8;color:#111;font-family:"+fonte+";font-size:"+tamanho+"pt;line-height:"+entrelinha+";}"+
      ".lp-documento{max-width:"+(formato.larguraMm||160)+"mm;margin:0 auto;background:#fff;}"+
      ".lp-pagina{page-break-after:always;background:#fff;position:relative;padding:18mm 15mm 18mm 18mm;min-height:"+(formato.alturaMm||230)+"mm;}"+
      ".lp-pagina.verso{padding-left:15mm;padding-right:18mm;}"+
      ".lp-bloco{margin:0 0 .85em 0;text-align:justify;hyphens:auto;overflow-wrap:break-word;}"+
      ".lp-capitulo{font-size:16pt;font-weight:bold;text-align:center;margin:22mm 0 10mm 0;page-break-after:avoid;}"+
      ".lp-poesia,.lp-sextilha{text-align:left;margin:0 0 1.1em 12mm;}"+
      ".lp-numero-pagina{position:absolute;bottom:8mm;left:0;right:0;text-align:center;font-size:9pt;color:#555;}"+
      "p{orphans:2;widows:2;}"+
      "@media screen{body{padding:24px}.lp-pagina{box-shadow:0 8px 30px rgba(0,0,0,.16);margin:0 auto 22px auto;}}";
  }

  function gerarHTMLPorBlocos(blocos){
    blocos = blocos || [];
    if(!blocos.length){
      return '<section class="lp-pagina recto"><main class="lp-miolo"><div class="lp-bloco">Sem conteúdo.</div></main></section>';
    }
    var html = '<section class="lp-pagina recto"><main class="lp-miolo">';
    blocos.forEach(function(b){
      var tipo = b.tipo || "prosa";
      var conteudo = escapeHTML(b.conteudo || "").replace(/\n/g,"<br>");
      html += '<div class="lp-bloco lp-'+tipo+'" data-bloco="'+escapeHTML(b.id||"")+'">'+conteudo+'</div>';
    });
    html += '</main></section>';
    return html;
  }

  function montarHTMLMiolo(resultado, opcoes){
    resultado = resultado || {};
    opcoes = opcoes || {};
    var titulo = resultado.titulo || opcoes.titulo || "Obra sem título";
    var autor = resultado.autor || opcoes.autor || "Autor não informado";
    var formato = resultado.formato || opcoes.formato || {nome:"16x23", larguraMm:160, alturaMm:230};
    var htmlMiolo = resultado.htmlMiolo || gerarHTMLPorBlocos(resultado.blocos || []);
    var css = cssMiolo(Object.assign({}, opcoes, {formato:formato}));

    return '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">'+
      '<title>'+escapeHTML(titulo)+' — '+escapeHTML(autor)+'</title><style>'+css+'</style></head><body>'+
      '<article class="lp-documento" data-motor="Lapidar.MotorExportacaoEditorial.v1">'+htmlMiolo+'</article>'+
      '</body></html>';
  }

  function montarPacoteEditorial(resultado, extras){
    resultado = resultado || {};
    extras = extras || {};
    return {
      tipo:"pacote_editorial_lapidar",
      motor:"Lapidar.MotorExportacaoEditorial.v1",
      titulo:resultado.titulo || extras.titulo || "Obra sem título",
      autor:resultado.autor || extras.autor || "Autor não informado",
      tipoEstrutural:resultado.tipoEstrutural || "indefinido",
      formato:resultado.formato || extras.formato || null,
      estatisticas:resultado.estatisticas || {},
      blocos:resultado.blocos || [],
      paginas:resultado.paginas || [],
      htmlMiolo:resultado.htmlMiolo || "",
      capa:extras.capa || null,
      lombada:extras.lombada || null,
      exportadoEm:agora()
    };
  }

  function montarXHTMLBaseEPUB(resultado, opcoes){
    resultado = resultado || {};
    opcoes = opcoes || {};
    var titulo = resultado.titulo || opcoes.titulo || "Obra sem título";
    var autor = resultado.autor || opcoes.autor || "Autor não informado";
    var conteudo = resultado.htmlMiolo || gerarHTMLPorBlocos(resultado.blocos || []);
    return '<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" lang="pt-BR"><head><meta charset="UTF-8" />'+
      '<title>'+escapeHTML(titulo)+'</title><style>body{font-family:serif;line-height:1.45;margin:1em}.lp-bloco{margin-bottom:.9em;text-align:justify}.lp-poesia,.lp-sextilha{text-align:left;margin-left:2em}</style></head><body>'+
      '<h1>'+escapeHTML(titulo)+'</h1><p><strong>'+escapeHTML(autor)+'</strong></p>'+conteudo+'</body></html>';
  }

  function montarHTMLCapa(capa, lombada, opcoes){
    capa = capa || {};
    lombada = lombada || {};
    opcoes = opcoes || {};
    var titulo = capa.titulo || opcoes.titulo || "Título da Obra";
    var autor = capa.autor || opcoes.autor || "Autor";
    var largura = (lombada.capa && lombada.capa.larguraAbertaComSangriaMm) || capa.larguraAbertaMm || 330;
    var altura = (lombada.capa && lombada.capa.alturaAbertaComSangriaMm) || capa.alturaAbertaMm || 240;
    var lombadaMm = lombada.lombadaMm || capa.lombadaMm || 12;
    var sangria = (lombada.capa && lombada.capa.sangriaMm) || capa.sangriaMm || 3;

    return '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Capa — '+escapeHTML(titulo)+'</title><style>'+
      '@page{size:'+largura+'mm '+altura+'mm;margin:0}body{margin:0;background:#ddd;font-family:Georgia,serif}'+
      '.capa{width:'+largura+'mm;height:'+altura+'mm;display:grid;grid-template-columns:1fr '+lombadaMm+'mm 1fr;background:#f7f1e6;color:#10243a}'+
      '.contracapa,.frente{padding:'+(sangria+8)+'mm;border:1px dashed rgba(0,0,0,.18)}'+
      '.lombada{background:#10243a;color:#d8b15a;display:flex;align-items:center;justify-content:center;writing-mode:vertical-rl;font-weight:bold;letter-spacing:.08em}'+
      '.frente{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.frente h1{font-size:28pt;margin:0 0 12mm 0}.frente h2{font-size:14pt;margin:0;color:#333}'+
      '.isbn{position:absolute;right:12mm;bottom:12mm;width:75mm;height:28mm;border:1px solid #999;display:flex;align-items:center;justify-content:center;font-size:9pt;color:#777}'+
      '</style></head><body><div class="capa"><section class="contracapa"><div class="isbn">Área ISBN / código de barras</div></section><section class="lombada">'+escapeHTML(titulo)+'</section><section class="frente"><h1>'+escapeHTML(titulo)+'</h1><h2>'+escapeHTML(autor)+'</h2></section></div></body></html>';
  }

  function prepararDownload(nomeBase, conteudo, tipo){
    return {
      nome:slug(nomeBase),
      conteudo:conteudo,
      tipo:tipo || "text/plain;charset=utf-8",
      geradoEm:agora()
    };
  }

  window.LapidarMotorExportacaoEditorial = {
    slug:slug,
    montarHTMLMiolo:montarHTMLMiolo,
    montarPacoteEditorial:montarPacoteEditorial,
    montarXHTMLBaseEPUB:montarXHTMLBaseEPUB,
    montarHTMLCapa:montarHTMLCapa,
    prepararDownload:prepararDownload
  };
})();
