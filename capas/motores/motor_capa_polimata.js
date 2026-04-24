/*
  Motor Capa Polímata — Celeiro Literário
  Motor técnico para capas do eixo Hércules: infantil, juvenil, infantojuvenil,
  didático, institucional, receitas, fotografia e materiais visuais.

  Regras principais:
  - usa o motor de lombada quando disponível;
  - mantém cálculo fora do Faça Kapa Polímata;
  - capa ePub é valor separado;
  - capa física depende de formato, páginas, papel, sangria e orelhas;
  - se o miolo não foi enviado, o cálculo é estimado pelo dado declarado.
*/

(function(){
  const perfis = {
    infantil: {
      nome: "Infantil",
      destaqueImagem: true,
      fonteTitulo: "serifada suave",
      areaImagem: "alta",
      isbn: "contracapa inferior direita"
    },
    juvenil: {
      nome: "Juvenil",
      destaqueImagem: true,
      fonteTitulo: "editorial forte",
      areaImagem: "media",
      isbn: "contracapa inferior direita"
    },
    infantojuvenil: {
      nome: "Infantojuvenil",
      destaqueImagem: true,
      fonteTitulo: "editorial narrativa",
      areaImagem: "media-alta",
      isbn: "contracapa inferior direita"
    },
    receita: {
      nome: "Receitas",
      destaqueImagem: true,
      fonteTitulo: "editorial culinaria",
      areaImagem: "alta",
      isbn: "contracapa inferior direita"
    },
    fotografia: {
      nome: "Fotografia",
      destaqueImagem: true,
      fonteTitulo: "minimalista",
      areaImagem: "dominante",
      isbn: "contracapa inferior direita"
    },
    didatico: {
      nome: "Didático",
      destaqueImagem: false,
      fonteTitulo: "institucional clara",
      areaImagem: "media",
      isbn: "contracapa inferior direita"
    },
    institucional: {
      nome: "Institucional",
      destaqueImagem: false,
      fonteTitulo: "institucional sobria",
      areaImagem: "baixa-media",
      isbn: "contracapa inferior direita"
    },
    tecnico: {
      nome: "Técnico",
      destaqueImagem: false,
      fonteTitulo: "tecnica limpa",
      areaImagem: "baixa",
      isbn: "contracapa inferior direita"
    }
  };

  function perfil(tipo){
    return perfis[tipo] || perfis.tecnico;
  }

  function numero(valor, fallback = 0){
    const n = Number(valor);
    return Number.isFinite(n) ? n : fallback;
  }

  function calcularFisica(opcoes = {}){
    if(window.CeleiroMotorLombada && window.CeleiroMotorLombada.calcularCapaFisica){
      return window.CeleiroMotorLombada.calcularCapaFisica({
        formato: opcoes.formato || "a4",
        larguraManual: opcoes.larguraManual,
        alturaManual: opcoes.alturaManual,
        paginas: opcoes.paginas || 0,
        papel: opcoes.papel || "offset75",
        fatorManual: opcoes.fatorManual,
        sangria: opcoes.sangria ?? 0.3,
        orelha: opcoes.orelha || 0
      });
    }

    const largura = numero(opcoes.larguraManual, 21);
    const altura = numero(opcoes.alturaManual, 29.7);
    const paginas = numero(opcoes.paginas, 0);
    const fator = numero(opcoes.fatorManual, 0.0021);
    const sangria = numero(opcoes.sangria, 0.3);
    const orelha = numero(opcoes.orelha, 0);
    const lombada = paginas * fator;

    return {
      formato: { largura, altura },
      paginas,
      fator,
      sangria,
      orelha,
      lombada,
      larguraAberta: (largura * 2) + lombada + (sangria * 2) + (orelha * 2),
      alturaAberta: altura + (sangria * 2)
    };
  }

  function calcularPolimata(opcoes = {}){
    const tipoMaterial = opcoes.tipoMaterial || "tecnico";
    const p = perfil(tipoMaterial);
    const fisica = calcularFisica(opcoes);
    const responsabilidade = opcoes.mioloEnviado ? "Celeiro, com miolo enviado" : "Autor, por estimativa manual";

    return {
      tipo: "polimata",
      tipoMaterial,
      perfil: p,
      fisica,
      responsabilidade,
      areas: gerarAreasTecnicas(fisica, p),
      observacoes: gerarObservacoes(opcoes, p)
    };
  }

  function gerarAreasTecnicas(fisica, p){
    const larguraFrente = fisica.formato.largura;
    const alturaFrente = fisica.formato.altura;
    const margemSegura = 0.5;

    return {
      frente: {
        largura: larguraFrente,
        altura: alturaFrente,
        margemSegura
      },
      contracapa: {
        largura: larguraFrente,
        altura: alturaFrente,
        isbn: p.isbn,
        margemSegura
      },
      lombada: {
        largura: fisica.lombada,
        altura: alturaFrente,
        textoPermitido: fisica.lombada >= 0.7
      },
      orelhas: {
        ativo: fisica.orelha > 0,
        larguraCada: fisica.orelha
      },
      sangria: {
        valor: fisica.sangria
      }
    };
  }

  function gerarObservacoes(opcoes, p){
    const obs = [];
    if(!opcoes.mioloEnviado){
      obs.push("Lombada calculada por estimativa informada pelo autor. Recomenda-se envio do miolo final.");
    }
    if(p.destaqueImagem){
      obs.push("Perfil visual com imagem em destaque. Recomenda-se passar imagens pelo Barracão de Polimento.");
    }
    if(opcoes.tipoSaida === "fisica_epub"){
      obs.push("Capa física e capa ePub são entregas distintas e devem somar valores no Mesário.");
    }
    return obs;
  }

  function gerarResumoTecnico(resultado){
    const f = resultado.fisica;
    return [
      `Perfil: ${resultado.perfil.nome}`,
      `Páginas: ${f.paginas}`,
      `Lombada: ${f.lombada.toFixed(2)} cm`,
      `Largura aberta: ${f.larguraAberta.toFixed(2)} cm`,
      `Altura aberta: ${f.alturaAberta.toFixed(2)} cm`,
      `Responsabilidade: ${resultado.responsabilidade}`
    ].join("\n");
  }

  window.CeleiroMotorCapaPolimata = {
    perfis,
    perfil,
    calcularFisica,
    calcularPolimata,
    gerarAreasTecnicas,
    gerarObservacoes,
    gerarResumoTecnico
  };
})();
