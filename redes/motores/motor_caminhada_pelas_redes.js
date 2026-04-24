/*
  Motor Caminhada pelas Redes — Celeiro Literário / Lapidar

  Função:
  - preparar divulgação social do que foi produzido no Celeiro;
  - organizar pacotes para Reels, TikTok, YouTube Shorts, YouTube horizontal,
    Instagram carrossel, post autoral e chamada de lançamento;
  - receber materiais dos Silos Sonoro, Cinematográfico, Music e HQ;
  - gerar estrutura de legendas, chamadas, QR Code futuro e checklist de publicação;
  - liberar distribuição após confirmação no Mesário.

  Este motor NÃO publica automaticamente nesta versão.
  Ele prepara o pacote social e deixa pronto para futura integração OAuth/API.
*/

(function(){
  const plataformas = {
    instagram_reels: { nome:"Instagram Reels", proporcao:"9:16", duracaoIdeal:"15s–90s", tipo:"video_curto" },
    tiktok: { nome:"TikTok", proporcao:"9:16", duracaoIdeal:"15s–180s", tipo:"video_curto" },
    youtube_shorts: { nome:"YouTube Shorts", proporcao:"9:16", duracaoIdeal:"15s–60s", tipo:"video_curto" },
    youtube_horizontal: { nome:"YouTube horizontal", proporcao:"16:9", duracaoIdeal:"3min–60min", tipo:"video_longo" },
    instagram_carrossel: { nome:"Instagram Carrossel", proporcao:"1:1 ou 4:5", duracaoIdeal:"até 10 cards", tipo:"imagem_texto" },
    facebook_post: { nome:"Facebook post", proporcao:"livre", duracaoIdeal:"texto + imagem", tipo:"post" },
    web_radio: { nome:"Web Rádio Celeiro Literário", proporcao:"áudio", duracaoIdeal:"vinheta / leitura / boletim", tipo:"audio" }
  };

  const origemMaterial = {
    silo_sonoro:"Áudio narrado / audiobook / poema falado",
    silo_cinematografico:"Vídeo narrativo / trailer / cena curta",
    silo_music:"Trilha / vinheta / ambiência musical",
    silo_hq:"Sequência visual / quadros / teaser de HQ",
    diagramador:"imagem editorial / página / mockup de livro",
    faca_kapa:"capa / mockup / chamada visual",
    radar_literario:"notícia / edital / antologia / oportunidade"
  };

  function normalizar(texto){
    return String(texto || "").replace(/\r\n/g,"\n").replace(/\r/g,"\n").trim();
  }

  function resumoCurto(texto, limite = 180){
    const limpo = normalizar(texto).replace(/\n+/g," ");
    if(limpo.length <= limite) return limpo;
    return limpo.slice(0, limite - 3).trim() + "...";
  }

  function gerarLegendaBase(opcoes = {}){
    const titulo = opcoes.titulo || "Nova obra no Celeiro Literário";
    const autor = opcoes.autor || "autor independente";
    const chamada = opcoes.chamada || "Conheça esta criação literária preparada no Celeiro Literário.";
    const hashtags = opcoes.hashtags || ["#CeleiroLiterario", "#SiteDasLetras", "#Literatura", "#AutorIndependente"];

    return [
      titulo,
      "",
      `Por ${autor}.`,
      "",
      chamada,
      "",
      hashtags.join(" ")
    ].join("\n");
  }

  function sugerirPacotes(material = {}){
    const origem = material.origem || "diagramador";
    const tipo = material.tipo || "obra";
    const pacotes = [];

    if(origem === "silo_sonoro"){
      pacotes.push("web_radio", "instagram_reels", "tiktok", "youtube_shorts");
    }

    if(origem === "silo_cinematografico"){
      pacotes.push("instagram_reels", "tiktok", "youtube_shorts", "youtube_horizontal");
    }

    if(origem === "silo_music"){
      pacotes.push("web_radio", "instagram_reels", "tiktok");
    }

    if(origem === "silo_hq"){
      pacotes.push("instagram_carrossel", "instagram_reels", "tiktok", "youtube_shorts");
    }

    if(origem === "faca_kapa" || origem === "diagramador"){
      pacotes.push("instagram_carrossel", "facebook_post", "instagram_reels");
    }

    if(origem === "radar_literario"){
      pacotes.push("facebook_post", "instagram_carrossel", "web_radio");
    }

    return [...new Set(pacotes)].map(chave => ({ chave, ...plataformas[chave] }));
  }

  function prepararChecklist(plataforma, material = {}){
    const checklist = [];
    checklist.push("Conferir título, autor e selo editorial.");
    checklist.push("Confirmar autorização de uso de imagem, voz, música e texto.");
    checklist.push("Confirmar liberação no Mesário antes de exportar/publicar.");

    if(plataforma.tipo === "video_curto"){
      checklist.push("Garantir legenda curta e leitura nos primeiros 3 segundos.");
      checklist.push("Usar proporção vertical 9:16.");
    }

    if(plataforma.tipo === "video_longo"){
      checklist.push("Gerar título, descrição e capítulos do vídeo quando possível.");
      checklist.push("Usar thumbnail com leitura clara em tamanho pequeno.");
    }

    if(plataforma.tipo === "imagem_texto"){
      checklist.push("Organizar cards em sequência: capa, chamada, trecho, autor, QR Code.");
    }

    if(plataforma.tipo === "audio"){
      checklist.push("Inserir vinheta da Web Rádio Celeiro Literário quando aplicável.");
      checklist.push("Normalizar volume antes da programação da rádio.");
    }

    return checklist;
  }

  function prepararPacoteSocial(material = {}, opcoes = {}){
    const pacotes = sugerirPacotes(material);
    const legenda = gerarLegendaBase(opcoes);
    const resumo = resumoCurto(material.descricao || material.texto || opcoes.chamada || "");

    return {
      tipo:"caminhada_pelas_redes",
      origem: material.origem || "diagramador",
      origemDescricao: origemMaterial[material.origem] || "Material editorial",
      titulo: opcoes.titulo || material.titulo || "Material do Celeiro Literário",
      autor: opcoes.autor || material.autor || "Autor independente",
      resumo,
      statusLiberacao: opcoes.mesarioConfirmado ? "liberado" : "aguardando_mesario",
      pacotes: pacotes.map(p => ({
        ...p,
        legendaSugerida: legenda,
        checklist: prepararChecklist(p, material)
      })),
      qrCode: {
        previsto:true,
        destino: opcoes.urlDestino || "URL futura da obra / página do autor / vitrine Site das Letras"
      },
      observacao:"Pacote preparado. Publicação automática futura dependerá de integração segura com APIs/OAuth das redes."
    };
  }

  function resumoPacote(pacote){
    return [
      `Origem: ${pacote.origemDescricao}`,
      `Título: ${pacote.titulo}`,
      `Autor: ${pacote.autor}`,
      `Status: ${pacote.statusLiberacao}`,
      `Pacotes: ${pacote.pacotes.map(p=>p.nome).join(", ")}`,
      `QR Code: ${pacote.qrCode.previsto ? "previsto" : "não previsto"}`
    ].join("\n");
  }

  window.CeleiroMotorCaminhadaPelasRedes = {
    plataformas,
    origemMaterial,
    gerarLegendaBase,
    sugerirPacotes,
    prepararChecklist,
    prepararPacoteSocial,
    resumoPacote
  };
})();
