/*
  Lapidar — Motor de Layout Inteligente v1
  Leve, sem backend.

  Função:
  - receber texto limpo;
  - dividir em blocos editoriais;
  - preparar páginas simuladas;
  - servir de base para Pólux, Castor, Centauro e Qui(RON)xadá;
  - manter compatibilidade futura com Paged.js.
*/

(function(){
  const formatos = {
    A5:{ largura:420, altura:595, nome:"A5" },
    "16x23":{ largura:454, altura:652, nome:"16 x 23" },
    "6x9":{ largura:432, altura:648, nome:"6 x 9" },
    A4:{ largura:595, altura:842, nome:"A4" }
  };

  function normalizar(texto){
    return String(texto||"").replace(/\r\n/g,"\n").trim();
  }

  function dividirBlocos(texto){
    return normalizar(texto)
      .split(/\n\s*\n/)
      .map(b=>b.trim())
      .filter(Boolean)
      .map((conteudo,indice)=>({
        id:`bloco-${indice+1}`,
        conteudo,
        tipo:detectarTipoBloco(conteudo),
        linhas:conteudo.split("\n").filter(Boolean).length,
        palavras:(conteudo.match(/\b[\wÀ-ÿ'-]+\b/g)||[]).length
      }));
  }

  function detectarTipoBloco(bloco){
    const linhas = bloco.split("\n").map(l=>l.trim()).filter(Boolean);
    if(/^cap[íi]tulo|^parte\s+/i.test(bloco.trim())) return "capitulo";
    if(linhas.length===6 && linhas.every(l=>l.length<80)) return "sextilha";
    if(linhas.length>1 && linhas.filter(l=>l.length<70).length/linhas.length>.7) return "poesia";
    return "prosa";
  }

  function estimarAlturaBloco(bloco, config={}){
    const fonte = Number(config.fonte || 16);
    const entrelinha = Number(config.entrelinha || 1.45);
    const larguraUtil = Number(config.larguraUtil || 340);
    const caracteresPorLinha = Math.max(26, Math.floor(larguraUtil / (fonte * .52)));
    const linhasEstimadas = bloco.conteudo.split("\n").reduce((acc,l)=>{
      return acc + Math.max(1, Math.ceil(l.length / caracteresPorLinha));
    },0);
    const extra = bloco.tipo === "capitulo" ? 34 : bloco.tipo === "sextilha" ? 18 : 12;
    return Math.ceil(linhasEstimadas * fonte * entrelinha + extra);
  }

  function paginar(texto, opcoes={}){
    const formato = formatos[opcoes.formato] || formatos["16x23"];
    const margemTop = Number(opcoes.margemTop || 54);
    const margemBottom = Number(opcoes.margemBottom || 54);
    const margemLateral = Number(opcoes.margemLateral || 48);
    const alturaUtil = formato.altura - margemTop - margemBottom;
    const larguraUtil = formato.largura - margemLateral*2;
    const blocos = dividirBlocos(texto);
    const paginas = [];
    let atual = { numero:1, blocos:[], alturaUsada:0 };

    blocos.forEach(bloco=>{
      const altura = estimarAlturaBloco(bloco,{...opcoes,larguraUtil});
      if(atual.blocos.length && atual.alturaUsada + altura > alturaUtil){
        paginas.push(atual);
        atual = { numero:paginas.length+1, blocos:[], alturaUsada:0 };
      }
      atual.blocos.push({...bloco, alturaEstimada:altura});
      atual.alturaUsada += altura;
    });
    if(atual.blocos.length) paginas.push(atual);

    return {
      formato,
      paginas,
      blocos,
      estatisticas:{ totalPaginas:paginas.length, totalBlocos:blocos.length },
      motor:"Lapidar.MotorLayoutInteligente.v1"
    };
  }

  function renderizarHTML(resultado){
    const f = resultado.formato;
    return resultado.paginas.map(p=>{
      const conteudo = p.blocos.map(b=>{
        const cls = `lapidar-bloco ${b.tipo}`;
        const html = b.conteudo.split("\n").map(l=>escapeHTML(l)).join("<br>");
        return `<div class="${cls}" data-bloco="${b.id}">${html}</div>`;
      }).join("\n");
      return `<section class="lapidar-pagina" style="width:${f.largura}px;min-height:${f.altura}px"><div class="lapidar-miolo">${conteudo}</div><footer>Página ${p.numero}</footer></section>`;
    }).join("\n");
  }

  function escapeHTML(s){
    return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));
  }

  window.LapidarMotorLayoutInteligente = { formatos, dividirBlocos, paginar, renderizarHTML };
})();
