/*
  Motor Silo Cinematográfico — Celeiro Literário / Lapidar

  Função:
  - preparar projeto audiovisual da obra;
  - sugerir linguagem visual a partir do impacto emocional;
  - estimar formato de vídeo;
  - organizar cenas iniciais por blocos narrativos;
  - preparar saída futura para Reels, TikTok, Shorts e vídeo horizontal.

  Este motor NÃO gera vídeo diretamente.
  Ele estrutura o projeto cinematográfico editorial.
*/

(function(){
  const formatosVideo = {
    reels: { nome:"Reels / TikTok / Shorts", proporcao:"9:16", duracaoMaxMin:3 },
    curto: { nome:"Vídeo curto narrativo", proporcao:"9:16 ou 16:9", duracaoMaxMin:10 },
    medio: { nome:"Vídeo médio", proporcao:"16:9", duracaoMaxMin:20 },
    longo: { nome:"Vídeo longo", proporcao:"16:9", duracaoMaxMin:60 }
  };

  const precosDuracao = {
    10: { BRL:35, USD:35 },
    20: { BRL:60, USD:60 },
    30: { BRL:80, USD:80 },
    60: { BRL:100, USD:100 }
  };

  const linguagensVisuais = {
    contemplativo:"planos longos, luz suave, câmera lenta e textura poética",
    dramático:"contraste forte, cortes mais rápidos e enquadramentos fechados",
    épico:"planos amplos, movimento de câmera grandioso e trilha expansiva",
    lírico:"imagens simbólicas, movimentos fluidos e paleta delicada",
    cotidiano:"luz natural, cenas realistas e câmera observacional",
    suspense:"sombras, movimentos contidos e revelações graduais",
    espiritual:"luz difusa, composição vertical e atmosfera ritualizada",
    neutro:"linguagem visual equilibrada"
  };

  function normalizar(texto){
    return String(texto || "").replace(/\r\n/g,"\n").replace(/\r/g,"\n").trim();
  }

  function dividirBlocos(texto){
    const limpo = normalizar(texto);
    if(!limpo) return [];
    return limpo.split(/\n{2,}/).map((b, i)=>({ id:`bloco-${i+1}`, texto:b.trim() })).filter(b=>b.texto);
  }

  function contarPalavras(texto){
    const limpo = normalizar(texto).replace(/\n/g," ");
    if(!limpo) return 0;
    return limpo.split(/\s+/).filter(Boolean).length;
  }

  function obterCampoEmocional(texto, opcoes = {}){
    if(opcoes.campoEmocional) return opcoes.campoEmocional;
    if(window.CeleiroMotorAvaliadorEmocional){
      return window.CeleiroMotorAvaliadorEmocional.analisarImpactoEmocional(texto).dominante;
    }
    return "neutro";
  }

  function sugerirFormatoPorDuracao(minutos){
    if(minutos <= 3) return formatosVideo.reels;
    if(minutos <= 10) return formatosVideo.curto;
    if(minutos <= 20) return formatosVideo.medio;
    return formatosVideo.longo;
  }

  function estimarDuracaoVideo(texto, opcoes = {}){
    const palavras = contarPalavras(texto);
    const densidade = opcoes.densidade || "moderada";
    const fator = densidade === "visual" ? 90 : densidade === "rapida" ? 160 : 120;
    const minutos = Math.max(1, Math.round(palavras / fator));
    return minutos;
  }

  function gerarCenasIniciais(texto, limite = 8){
    const blocos = dividirBlocos(texto).slice(0, limite);
    return blocos.map((b, idx)=>({
      cena: idx + 1,
      baseTextual: b.texto.slice(0, 220),
      funcao:"cena derivada de bloco narrativo",
      observacao:"Refinar visualmente no Silo Cinematográfico."
    }));
  }

  function calcularPreco(duracaoContratada, moeda = "BRL"){
    const duracoes = Object.keys(precosDuracao).map(Number).sort((a,b)=>a-b);
    const selecionada = duracoes.find(d => duracaoContratada <= d) || 60;
    const tabela = precosDuracao[selecionada];
    return { duracao:selectedaOuMax(selecionada), moeda, valor:tabela[moeda] || tabela.BRL };
  }

  function selectedaOuMax(valor){
    return valor;
  }

  function analisarProjetoCinematografico(texto, opcoes = {}){
    const campo = obterCampoEmocional(texto, opcoes);
    const duracaoEstimada = estimarDuracaoVideo(texto, opcoes);
    const formato = sugerirFormatoPorDuracao(duracaoEstimada);
    const cenas = gerarCenasIniciais(texto, opcoes.limiteCenas || 8);
    const duracaoContratada = Number(opcoes.duracaoContratada || Math.min(60, Math.max(10, duracaoEstimada)));
    const preco = calcularPreco(duracaoContratada, opcoes.moeda || "BRL");

    return {
      tipo:"silo_cinematografico",
      campoEmocional: campo,
      linguagemVisual: linguagensVisuais[campo] || linguagensVisuais.neutro,
      duracaoEstimadaMin: duracaoEstimada,
      formatoSugerido: formato,
      cenasIniciais: cenas,
      preco,
      observacao:"Projeto preparado para futura geração de vídeo e exportação social."
    };
  }

  window.CeleiroMotorSiloCinematografico = {
    formatosVideo,
    precosDuracao,
    linguagensVisuais,
    estimarDuracaoVideo,
    sugerirFormatoPorDuracao,
    gerarCenasIniciais,
    calcularPreco,
    analisarProjetoCinematografico
  };
})();
