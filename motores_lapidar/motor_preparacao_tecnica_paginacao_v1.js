/*
  Lapidar — Motor de Preparação Técnica + Paginação Inteligente v1

  Motor central independente.

  Objetivo:
  - transformar texto bruto em miolo editorial preparado;
  - não pertence a nenhum módulo específico;
  - pode ser chamado por Bolsão, Pólux, Castor, Centauro, Qui(RON)xadá,
    Segunda Língua, Avaliação Literária, Silo Sonoro, Silo HQ e Silo Cinematográfico.

  Fluxo:
  texto bruto -> limpeza técnica -> leitura estrutural -> classificação editorial
  -> blocos editoriais -> paginação inteligente -> miolo preparado
*/

(function(){
  const formatos = {
    A5:{ nome:"A5", largura:420, altura:595, larguraMm:148, alturaMm:210 },
    "14x21":{ nome:"14 x 21", largura:397, altura:595, larguraMm:140, alturaMm:210 },
    "16x23":{ nome:"16 x 23", largura:454, altura:652, larguraMm:160, alturaMm:230 },
    "6x9":{ nome:"6 x 9", largura:432, altura:648, larguraMm:152.4, alturaMm:228.6 },
    A4:{ nome:"A4", largura:595, altura:842, larguraMm:210, alturaMm:297 }
  };

  const configPadrao = {
    formato:"16x23",
    fonte:16,
    entrelinha:1.45,
    margemTop:54,
    margemBottom:54,
    margemInterna:54,
    margemExterna:46,
    preservarPoesia:true,
    preservarCordel:true,
    primeiraPaginaNumero:1
  };

  function normalizarTexto(texto){
    return String(texto || "")
      .replace(/\r\n/g,"\n")
      .replace(/\r/g,"\n")
      .replace(/\t/g," ")
      .replace(/[ ]{2,}/g," ")
      .replace(/\n{4,}/g,"\n\n\n")
      .trim();
  }

  function linhas(texto){ return normalizarTexto(texto).split("\n"); }
  function linhasValidas(texto){ return linhas(texto).map(l=>l.trim()).filter(Boolean); }

  function detectarTitulo(lista){
    const topo = lista.slice(0,20);
    const candidato = topo.find(l=>{
      if(/^por\s+/i.test(l)) return false;
      if(/^(autor|autora|organiza[cç][aã]o)\b/i.test(l)) return false;
      return l.length >= 3 && l.length <= 90;
    });
    return candidato || "Obra sem título detectado";
  }

  function detectarAutor(lista){
    const topo = lista.slice(0,30);
    for(const l of topo){
      const m = l.match(/^(por|autor|autora|organizador|organizadora|organiza[cç][aã]o)\s*[:\-–—]?\s*(.+)$/i);
      if(m && m[2]) return m[2].trim();
    }
    return "Autor não detectado";
  }

  function detectarCapitulos(lista){
    const padrao = /^(cap[íi]tulo|cap\.|parte|livro|canto)\s+([\divxlcdm]+|\d+|[a-záéíóúâêôãõç\-\s]+)(\s*[-–—:]\s*(.+))?$/i;
    return lista.map((linha,indice)=>({ indice, linha })).filter(x=>padrao.test(x.linha.trim()));
  }

  function detectarBlocosBrutos(texto){
    const t = normalizarTexto(texto);
    if(!t) return [];
    return t.split(/\n\s*\n/).map(b=>b.trim()).filter(Boolean);
  }

  function tipoDoBloco(bloco){
    const conteudo = bloco.trim();
    const ls = conteudo.split("\n").map(l=>l.trim()).filter(Boolean);
    if(/^(cap[íi]tulo|cap\.|parte|livro|canto)\b/i.test(conteudo)) return "capitulo";
    if(ls.length === 6 && ls.every(l=>l.length <= 82)) return "sextilha";
    if(ls.length > 1 && ls.filter(l=>l.length <= 70).length / ls.length > .65) return "poesia";
    if(/^[-–—]\s*/.test(conteudo)) return "dialogo";
    return "prosa";
  }

  function criarBlocos(texto){
    return detectarBlocosBrutos(texto).map((conteudo,indice)=>{
      const tipo = tipoDoBloco(conteudo);
      return {
        id:`bloco-${String(indice+1).padStart(4,"0")}`,
        ordem:indice+1,
        tipo,
        conteudo,
        linhas:conteudo.split("\n").filter(Boolean).length,
        palavras:(conteudo.match(/\b[\wÀ-ÿ'-]+\b/g)||[]).length,
        caracteres:conteudo.length
      };
    });
  }

  function classificarObra(blocos, listaLinhas){
    const total = blocos.length || 1;
    const qtdSextilhas = blocos.filter(b=>b.tipo === "sextilha").length;
    const qtdPoesia = blocos.filter(b=>b.tipo === "poesia" || b.tipo === "sextilha").length;
    const qtdCapitulos = blocos.filter(b=>b.tipo === "capitulo").length;
    const proporcaoPoetica = qtdPoesia / total;

    if(qtdSextilhas >= 3 && proporcaoPoetica > .55) return "cordel";
    if(proporcaoPoetica > .65 && qtdCapitulos <= 2) return "poesia";
    if(proporcaoPoetica > .25 && qtdCapitulos >= 1) return "hibrido";
    if(listaLinhas.some(l=>/^[-–—]\s+/.test(l.trim()))) return "prosa";
    return "prosa";
  }

  function estimarAltura(bloco, cfg){
    const formato = formatos[cfg.formato] || formatos["16x23"];
    const margemHorizontal = cfg.margemInterna + cfg.margemExterna;
    const larguraUtil = formato.largura - margemHorizontal;
    const fonte = Number(cfg.fonte || 16);
    const entrelinha = Number(cfg.entrelinha || 1.45);
    const caracteresPorLinha = Math.max(24, Math.floor(larguraUtil / (fonte * .52)));
    let linhasEstimadas = 0;
    bloco.conteudo.split("\n").forEach(l=>{
      const tam = l.trim().length;
      linhasEstimadas += Math.max(1, Math.ceil(tam / caracteresPorLinha));
    });
    let extra = 12;
    if(bloco.tipo === "capitulo") extra = 42;
    if(bloco.tipo === "sextilha") extra = 18;
    if(bloco.tipo === "poesia") extra = 20;
    return Math.ceil((linhasEstimadas * fonte * entrelinha) + extra);
  }

  function criarPagina(numero, cfg){
    const par = numero % 2 === 0;
    return {
      numero,
      lado: par ? "verso" : "recto",
      margemInterna:cfg.margemInterna,
      margemExterna:cfg.margemExterna,
      blocos:[],
      alturaUsada:0
    };
  }

  function paginarBlocos(blocos, opcoes={}){
    const cfg = Object.assign({}, configPadrao, opcoes || {});
    const formato = formatos[cfg.formato] || formatos["16x23"];
    const alturaUtil = formato.altura - cfg.margemTop - cfg.margemBottom;
    const paginas = [];
    let pagina = criarPagina(1, cfg);

    blocos.forEach(bloco=>{
      const altura = estimarAltura(bloco, cfg);
      if(pagina.blocos.length && pagina.alturaUsada + altura > alturaUtil){
        paginas.push(pagina);
        pagina = criarPagina(paginas.length + 1, cfg);
      }
      pagina.blocos.push(Object.assign({}, bloco, { alturaEstimada:altura }));
      pagina.alturaUsada += altura;
    });

    if(pagina.blocos.length) paginas.push(pagina);
    return paginas;
  }

  function escapeHTML(s){
    return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));
  }

  function gerarHTMLMiolo(resultado){
    const formato = resultado.formato;
    return resultado.paginas.map(p=>{
      const blocos = p.blocos.map(b=>{
        const conteudo = escapeHTML(b.conteudo).replace(/\n/g,"<br>");
        return `<div class="lp-bloco lp-${b.tipo}" data-bloco="${b.id}">${conteudo}</div>`;
      }).join("\n");
      return `<section class="lp-pagina ${p.lado}" data-pagina="${p.numero}" style="width:${formato.largura}px;min-height:${formato.altura}px;">
  <main class="lp-miolo">${blocos}</main>
  <footer class="lp-numero-pagina">${p.numero}</footer>
</section>`;
    }).join("\n");
  }

  function preparar(textoBruto, opcoes={}){
    const textoLimpo = normalizarTexto(textoBruto);
    const lista = linhasValidas(textoLimpo);
    const blocos = criarBlocos(textoLimpo);
    const tipoEstrutural = classificarObra(blocos, lista);
    const capitulos = detectarCapitulos(lista);
    const titulo = opcoes.titulo || detectarTitulo(lista);
    const autor = opcoes.autor || detectarAutor(lista);
    const cfg = Object.assign({}, configPadrao, opcoes || {});
    const formato = formatos[cfg.formato] || formatos["16x23"];
    const paginas = paginarBlocos(blocos, cfg);
    const resultado = {
      motor:"Lapidar.MotorPreparacaoTecnicaPaginacao.v1",
      titulo,
      autor,
      textoLimpo,
      tipoEstrutural,
      formato,
      configuracao:cfg,
      capitulos,
      blocos,
      paginas,
      htmlMiolo:null,
      estatisticas:{
        caracteres:textoLimpo.length,
        palavras:(textoLimpo.match(/\b[\wÀ-ÿ'-]+\b/g)||[]).length,
        linhas:lista.length,
        blocos:blocos.length,
        capitulos:capitulos.length,
        paginas:paginas.length
      },
      atualizadoEm:new Date().toISOString()
    };
    resultado.htmlMiolo = gerarHTMLMiolo(resultado);
    return resultado;
  }

  function prepararParaModulo(textoBruto, modulo, opcoes={}){
    const resultado = preparar(textoBruto, opcoes);
    resultado.moduloDestino = modulo || "indefinido";
    if(modulo === "polux" && resultado.tipoEstrutural === "poesia"){
      resultado.alerta = "Obra com predominância poética. Recomenda-se Castor ou Centauro.";
    }
    if(modulo === "castor" && resultado.tipoEstrutural === "prosa"){
      resultado.alerta = "Obra com predominância de prosa. Recomenda-se Pólux ou Centauro.";
    }
    if(modulo === "quironxada" && resultado.tipoEstrutural !== "cordel"){
      resultado.alerta = "Obra não parece cordel puro. Verifique sextilhas antes de seguir.";
    }
    return resultado;
  }

  window.LapidarMotorPreparacaoTecnicaPaginacao = {
    formatos,
    configPadrao,
    preparar,
    prepararParaModulo,
    normalizarTexto,
    criarBlocos,
    detectarCapitulos,
    classificarObra,
    paginarBlocos,
    gerarHTMLMiolo
  };
})();
