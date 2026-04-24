/*
  Adaptador Hércules — Celeiro Literário
  Ponte entre o Motor de Diagramação Base e obras técnicas, infantis, juvenis,
  infantojuvenis, receitas, fotografia, apostilas e materiais institucionais.

  Regra principal:
  - Hércules não deve ficar pesado;
  - leitura estrutural fica no motor base;
  - montagem visual específica fica neste adaptador;
  - imagens e polimentos futuros ficam fora, no Barracão de Polimento.
*/

(function(){
  function motorBase(){
    return window.CeleiroMotorDiagramacaoBase || null;
  }

  function normalizar(texto){
    const motor = motorBase();
    if(motor && motor.normalizarTexto) return motor.normalizarTexto(texto);
    return String(texto || "").replace(/\r\n/g,"\n").replace(/\r/g,"\n").trim();
  }

  function dividirBlocos(texto){
    const motor = motorBase();
    if(motor && motor.quebrarBlocos) return motor.quebrarBlocos(texto);

    const limpo = normalizar(texto);
    if(!limpo) return [];
    return limpo.split(/\n{2,}/).map((bloco, idx)=>({
      id:`bloco-${idx+1}`,
      texto:bloco.trim(),
      linhas:bloco.split("\n").map(l=>l.trim()).filter(Boolean)
    })).filter(b=>b.texto);
  }

  function detectarTipoMaterial(texto, opcoes = {}){
    const blocos = dividirBlocos(texto);
    const t = normalizar(texto).toLowerCase();

    const sinaisReceita = /(ingredientes|modo de preparo|rendimento|forno|cozinhe|misture|xícara|colher)/i.test(t);
    const sinaisFoto = /(fotografia|ensaio fotográfico|imagem|galeria|legenda|registro visual)/i.test(t);
    const sinaisInfantil = /(criança|infantil|era uma vez|brincadeira|turma|menino|menina|animalzinho)/i.test(t);
    const sinaisDidatico = /(atividade|exercício|objetivo|competência|habilidade|aula|unidade|capítulo|questionário)/i.test(t);
    const sinaisInstitucional = /(relatório|projeto|apresentação|institucional|empresa|equipe|resultado|proposta)/i.test(t);

    let tipo = "tecnico";
    if(sinaisReceita) tipo = "receita";
    else if(sinaisFoto) tipo = "fotografia";
    else if(sinaisInfantil) tipo = "infantil";
    else if(sinaisDidatico) tipo = "didatico";
    else if(sinaisInstitucional) tipo = "institucional";

    return {
      tipo,
      blocos: blocos.length,
      sinais: { sinaisReceita, sinaisFoto, sinaisInfantil, sinaisDidatico, sinaisInstitucional }
    };
  }

  function classificarBlocoHercules(bloco){
    const texto = bloco.texto.trim();
    const primeira = bloco.linhas[0] || texto;

    if(/^#{1,3}\s+/.test(primeira)) return "titulo";
    if(/^\[(imagem|foto|figura|ilustração|ilustracao)[:\s\-]/i.test(primeira)) return "imagem";
    if(/^legenda[:\s\-]/i.test(primeira)) return "legenda";
    if(/^(ingredientes|modo de preparo|preparo|rendimento)\b/i.test(primeira)) return "receita-secao";
    if(/^(atividade|exercício|exercicio|objetivo|observação|observacao)\b/i.test(primeira)) return "didatico-secao";
    if(texto.length <= 70 && bloco.linhas.length === 1) return "subtitulo";
    if(bloco.linhas.length <= 3 && texto.length <= 180) return "bloco-curto";
    return "texto";
  }

  function analisarHercules(texto, opcoes = {}){
    const blocos = dividirBlocos(texto);
    const tipoMaterial = detectarTipoMaterial(texto, opcoes);
    const classificados = blocos.map((bloco, idx)=>({
      ...bloco,
      ordem: idx + 1,
      tipo: classificarBlocoHercules(bloco)
    }));

    const alertas = [];
    classificados.forEach(bloco => {
      if(bloco.tipo === "texto" && bloco.texto.length > 1200){
        alertas.push({
          tipo:"bloco-longo",
          mensagem:`Bloco ${bloco.ordem}: texto longo demais para página visual do Hércules. Sugere divisão.`,
          bloco: bloco.ordem
        });
      }
      if(bloco.tipo === "imagem" && !/\]/.test(bloco.texto)){
        alertas.push({
          tipo:"imagem-incompleta",
          mensagem:`Bloco ${bloco.ordem}: marcação de imagem parece incompleta.`,
          bloco: bloco.ordem
        });
      }
    });

    return {
      tipo:"hercules",
      tipoMaterial: tipoMaterial.tipo,
      totalBlocos: classificados.length,
      blocos: classificados,
      alertas,
      resumo:`${classificados.length} bloco(s), material provável: ${tipoMaterial.tipo}`
    };
  }

  function gerarLayoutSugerido(texto, opcoes = {}){
    const analise = analisarHercules(texto, opcoes);
    const tipo = analise.tipoMaterial;

    const preset = {
      infantil: { formato:"a4", fonte:14, entrelinha:1.45, imagemDominante:true, respiro:"alto" },
      receita: { formato:"a4", fonte:12, entrelinha:1.35, imagemDominante:true, respiro:"medio" },
      fotografia: { formato:"a4", fonte:11, entrelinha:1.3, imagemDominante:true, respiro:"alto" },
      didatico: { formato:"a4", fonte:12, entrelinha:1.4, imagemDominante:false, respiro:"medio" },
      institucional: { formato:"a4", fonte:11, entrelinha:1.35, imagemDominante:false, respiro:"medio" },
      tecnico: { formato:"a4", fonte:11, entrelinha:1.35, imagemDominante:false, respiro:"baixo" }
    }[tipo] || { formato:"a4", fonte:11, entrelinha:1.35, imagemDominante:false, respiro:"medio" };

    return {
      ...preset,
      analise,
      mensagem:`Preset Hércules sugerido: ${tipo}, fonte ${preset.fonte} pt, formato ${preset.formato}.`
    };
  }

  function gerarHtmlHercules(texto, opcoes = {}){
    const analise = analisarHercules(texto, opcoes);
    return analise.blocos.map(bloco => {
      const conteudo = escapeHtml(bloco.texto).replace(/\n/g,"<br>");
      if(bloco.tipo === "titulo") return `<h1 class="hercules-titulo">${conteudo.replace(/^#{1,3}\s*/,"")}</h1>`;
      if(bloco.tipo === "subtitulo") return `<h2 class="hercules-subtitulo">${conteudo}</h2>`;
      if(bloco.tipo === "imagem") return `<div class="hercules-imagem-placeholder">${conteudo}</div>`;
      if(bloco.tipo === "legenda") return `<div class="hercules-legenda">${conteudo}</div>`;
      if(bloco.tipo === "receita-secao") return `<div class="hercules-box receita">${conteudo}</div>`;
      if(bloco.tipo === "didatico-secao") return `<div class="hercules-box didatico">${conteudo}</div>`;
      if(bloco.tipo === "bloco-curto") return `<p class="hercules-curto">${conteudo}</p>`;
      return `<p class="hercules-texto">${conteudo}</p>`;
    }).join("\n");
  }

  function cssHercules(opcoes = {}){
    const fonte = opcoes.fonteCorpo || "Georgia, 'Times New Roman', serif";
    const tamanho = Number(opcoes.tamanhoFonte || 12);
    const entrelinha = Number(opcoes.entrelinha || 1.4);
    return `
      .hercules-pagina{
        width:595px;
        min-height:842px;
        background:#fffdf8;
        color:#1f2430;
        font-family:${fonte};
        font-size:${tamanho}pt;
        line-height:${entrelinha};
        padding:2cm 1.8cm;
        box-shadow:0 12px 28px rgba(0,0,0,.10);
      }
      .hercules-titulo{text-align:center;font-size:1.8em;margin:1.2em 0 .6em;}
      .hercules-subtitulo{text-align:center;font-size:1.15em;font-style:italic;margin:.4em 0 1.2em;}
      .hercules-texto{text-align:justify;margin:0 0 .9em;text-indent:1em;}
      .hercules-curto{text-align:left;margin:0 0 .9em;font-weight:600;}
      .hercules-imagem-placeholder{border:2px dashed #b8c4d0;border-radius:18px;min-height:170px;display:flex;align-items:center;justify-content:center;text-align:center;color:#5d6675;background:#f4f7fb;margin:1em 0;padding:1em;}
      .hercules-legenda{text-align:center;font-size:.9em;color:#66717e;margin:-.4em 0 1em;font-style:italic;}
      .hercules-box{border:1px solid #d8dee8;border-radius:16px;padding:1em;margin:1em 0;background:#f8fafc;}
      .hercules-box.receita{background:#fff8ef;}
      .hercules-box.didatico{background:#eef4fb;}
    `;
  }

  function escapeHtml(str){
    return String(str || "").replace(/[&<>"]/g, s => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[s]));
  }

  window.CeleiroAdaptadorHercules = {
    normalizar,
    dividirBlocos,
    detectarTipoMaterial,
    classificarBlocoHercules,
    analisarHercules,
    gerarLayoutSugerido,
    gerarHtmlHercules,
    cssHercules
  };
})();
