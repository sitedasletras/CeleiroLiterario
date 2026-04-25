/*
  Celeiro Literário / Lapidar — Motor Final de Exportação PDF/EPUB v1
  --------------------------------------------------------------------
  Motor isolado e leve para gerar saídas editoriais finais.

  Entrega:
  - HTML de impressão para PDF via navegador;
  - XHTML base para EPUB;
  - pacote editorial JSON;
  - manifesto simples de arquivos;
  - integração opcional com CeleiroMotorPaginacaoReal.

  Observação técnica:
  - PDF final é produzido pelo navegador/impressão ou por motor externo futuro;
  - EPUB completo em .epub zipado fica para camada posterior; este motor gera a base técnica validável.
*/

(function(){
  const motor = 'Celeiro.MotorExportacaoFinalPdfEpub.v1';

  function escapeHTML(s){
    return String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  }

  function slug(texto){
    return String(texto || 'obra')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9\-_]+/gi,'_')
      .replace(/_+/g,'_')
      .replace(/^_|_$/g,'')
      .toLowerCase() || 'obra';
  }

  function normalizarProjeto(projeto){
    projeto = projeto || {};
    return {
      titulo: projeto.titulo || 'Obra sem título',
      autor: projeto.autor || 'Autor não informado',
      idioma: projeto.idioma || 'pt-BR',
      formato: projeto.formato || { nome:'16x23', larguraMm:160, alturaMm:230, pxLargura:454, pxAltura:652 },
      paginas: projeto.paginas || [],
      blocos: projeto.blocos || [],
      metadados: projeto.metadados || {},
      htmlMiolo: projeto.htmlMiolo || ''
    };
  }

  function garantirPaginacao(projeto, opcoes){
    const p = normalizarProjeto(projeto);
    if(p.paginas && p.paginas.length) return p;
    if(window.CeleiroMotorPaginacaoReal && p.blocos && p.blocos.length){
      const resultado = window.CeleiroMotorPaginacaoReal.paginar(p.blocos, opcoes || {});
      p.paginas = resultado.paginas;
      p.formato = resultado.formato;
      p.htmlMiolo = window.CeleiroMotorPaginacaoReal.gerarHTMLPaginas(resultado);
    }
    return p;
  }

  function cssImpressao(projeto, opcoes){
    opcoes = opcoes || {};
    const f = projeto.formato || {};
    const larguraMm = f.larguraMm || 160;
    const alturaMm = f.alturaMm || 230;
    const fonte = opcoes.fonte || "Georgia, 'Times New Roman', serif";
    const tamanho = opcoes.tamanhoFontePt || 11;
    const entrelinha = opcoes.entrelinha || 1.45;
    return `
@page{size:${larguraMm}mm ${alturaMm}mm;margin:18mm 15mm 18mm 18mm;}
*{box-sizing:border-box;}
body{margin:0;background:#f4f0e8;color:#111;font-family:${fonte};font-size:${tamanho}pt;line-height:${entrelinha};}
.lp-documento{max-width:${larguraMm}mm;margin:0 auto;background:white;}
.lp-pagina{page-break-after:always;background:white;position:relative;padding:18mm 15mm 18mm 18mm;min-height:${alturaMm}mm;}
.lp-pagina.verso{padding-left:15mm;padding-right:18mm;}
.lp-bloco{margin:0 0 .85em 0;text-align:justify;hyphens:auto;overflow-wrap:break-word;}
.lp-capitulo,.lp-titulo{font-size:16pt;font-weight:bold;text-align:center;margin:22mm 0 10mm 0;page-break-after:avoid;}
.lp-subtitulo{font-size:12pt;font-style:italic;text-align:center;margin:0 0 8mm 0;page-break-after:avoid;}
.lp-poesia,.lp-sextilha,.lp-cordel{text-align:left;margin:0 0 1.1em 12mm;}
.lp-dialogo{text-align:left;}
.lp-pagina footer{position:absolute;bottom:8mm;left:0;right:0;text-align:center;font-size:9pt;color:#555;}
p{orphans:2;widows:2;}
@media screen{body{padding:24px}.lp-pagina{box-shadow:0 8px 30px rgba(0,0,0,.16);margin:0 auto 22px auto;}}
    `.trim();
  }

  function htmlPaginas(projeto){
    if(projeto.htmlMiolo) return projeto.htmlMiolo;
    return (projeto.paginas || []).map(p => {
      const blocos = (p.blocos || []).map(b => {
        const tipo = b.tipo || 'prosa';
        const conteudo = escapeHTML(b.conteudo || b.texto || '').replace(/\n/g,'<br>');
        return `<div class="lp-bloco lp-${tipo}" data-bloco="${escapeHTML(b.id || '')}">${conteudo}</div>`;
      }).join('\n');
      return `<section class="lp-pagina ${p.lado || ''}" data-pagina="${p.numero || ''}">${blocos}<footer>${p.numero || ''}</footer></section>`;
    }).join('\n');
  }

  function montarHTMLImpressao(projetoEntrada, opcoes){
    const projeto = garantirPaginacao(projetoEntrada, opcoes);
    const titulo = escapeHTML(projeto.titulo);
    const autor = escapeHTML(projeto.autor);
    return `<!DOCTYPE html>
<html lang="${escapeHTML(projeto.idioma)}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${titulo} — ${autor}</title>
<style>${cssImpressao(projeto, opcoes)}</style>
</head>
<body>
<article class="lp-documento" data-motor="${motor}">
${htmlPaginas(projeto)}
</article>
</body>
</html>`;
  }

  function montarXHTMLParaEPUB(projetoEntrada, opcoes){
    const projeto = garantirPaginacao(projetoEntrada, opcoes);
    const titulo = escapeHTML(projeto.titulo);
    const autor = escapeHTML(projeto.autor);
    const conteudo = htmlPaginas(projeto)
      .replace(/<section/g,'<div')
      .replace(/<\/section>/g,'</div>')
      .replace(/<footer[^>]*>.*?<\/footer>/g,'');
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="${escapeHTML(projeto.idioma)}">
<head>
<title>${titulo}</title>
<style>
body{font-family:serif;line-height:1.45;margin:1em;}
h1{text-align:center;}
.autor{text-align:center;margin-bottom:2em;}
.lp-bloco{margin-bottom:.9em;text-align:justify;}
.lp-poesia,.lp-sextilha,.lp-cordel{text-align:left;margin-left:2em;}
</style>
</head>
<body>
<h1>${titulo}</h1>
<p class="autor"><strong>${autor}</strong></p>
${conteudo}
</body>
</html>`;
  }

  function montarManifestoEPUB(projetoEntrada){
    const projeto = normalizarProjeto(projetoEntrada);
    return {
      motor,
      tipo:'manifesto_epub_base',
      titulo:projeto.titulo,
      autor:projeto.autor,
      idioma:projeto.idioma,
      arquivos:[
        'META-INF/container.xml',
        'OEBPS/content.opf',
        'OEBPS/nav.xhtml',
        'OEBPS/chapters/capitulo-001.xhtml'
      ],
      geradoEm:new Date().toISOString()
    };
  }

  function montarPacoteEditorial(projetoEntrada, extras){
    const projeto = garantirPaginacao(projetoEntrada, extras || {});
    return {
      motor,
      tipo:'pacote_editorial_final',
      titulo:projeto.titulo,
      autor:projeto.autor,
      idioma:projeto.idioma,
      formato:projeto.formato,
      paginas:projeto.paginas,
      blocos:projeto.blocos,
      metadados:projeto.metadados,
      htmlImpressao:montarHTMLImpressao(projeto, extras),
      xhtmlEpub:montarXHTMLParaEPUB(projeto, extras),
      manifestoEpub:montarManifestoEPUB(projeto),
      extras:extras || {},
      geradoEm:new Date().toISOString()
    };
  }

  function prepararDownload(nomeBase, conteudo, tipo){
    return {
      nome:slug(nomeBase),
      conteudo,
      tipo:tipo || 'text/plain;charset=utf-8',
      geradoEm:new Date().toISOString()
    };
  }

  window.CeleiroMotorExportacaoFinalPdfEpub = {
    montarHTMLImpressao,
    montarXHTMLParaEPUB,
    montarManifestoEPUB,
    montarPacoteEditorial,
    prepararDownload,
    garantirPaginacao,
    slug
  };
})();
