/*
  Celeiro Literário / Lapidar — Motor Decoração Editorial v1
  ----------------------------------------------------------
  Motor leve para capitulares, ornamentos, divisores e molduras editoriais.

  Princípio:
  - visual premium sem peso;
  - SVG/CSS primeiro;
  - autor pode aplicar, adaptar ou ignorar;
  - compartilhado por Pólux, Castor, Centauro, Qui(RON)xadá, Hércules e Faça Kapa.
*/

(function(){
  const MOTOR_ID = 'Celeiro.MotorDecoracaoEditorial.v1';

  const bibliotecas = {
    classico:{
      nome:'Clássico editorial',
      capitular:'capitular_cl Classica',
      divisor:'❦',
      moldura:'filete_duplo',
      cssClasse:'decor-classico',
      descricao:'Elegante, neutro e adequado para romances, memórias e obras literárias gerais.'
    },
    medieval:{
      nome:'Medieval',
      capitular:'capitular_iluminura_medieval',
      divisor:'✥ ⚜ ✥',
      moldura:'pergaminho_leve',
      cssClasse:'decor-medieval',
      descricao:'Indicado para reinos, cavaleiros, fantasia medieval, crônicas antigas e narrativas épicas.'
    },
    fantasia_epica:{
      nome:'Fantasia épica',
      capitular:'capitular_mitologica',
      divisor:'✦ ✧ ✦',
      moldura:'ornamento_epico',
      cssClasse:'decor-fantasia-epica',
      descricao:'Ideal para sagas, mundos inventados, jornadas heroicas e universos fantásticos.'
    },
    ficcao_cientifica:{
      nome:'Ficção científica',
      capitular:'capitular_geometrica',
      divisor:'◇ ─ ◇',
      moldura:'linha_tecnica',
      cssClasse:'decor-scifi',
      descricao:'Visual limpo, técnico e futurista, sem excesso ornamental.'
    },
    cordel:{
      nome:'Cordel / Xilogravura',
      capitular:'capitular_xilogravura',
      divisor:'✸ — ✸ — ✸',
      moldura:'filete_popular',
      cssClasse:'decor-cordel',
      descricao:'Preserva o espírito popular nordestino, com força visual e simplicidade rústica.'
    },
    terror:{
      nome:'Terror / Horror',
      capitular:'capitular_gotica',
      divisor:'☾ ✦ ☽',
      moldura:'sombra_gotica',
      cssClasse:'decor-terror',
      descricao:'Para vampiros, fantasmas, lobisomens, zumbis, chupacabra, gárgulas e atmosferas sombrias.'
    },
    infantil:{
      nome:'Infantil',
      capitular:'capitular_ludica',
      divisor:'★ ❀ ★',
      moldura:'moldura_suave',
      cssClasse:'decor-infantil',
      descricao:'Leve, aberto, amigável e fácil para leitores jovens.'
    },
    biblico:{
      nome:'Bíblico / Sacro',
      capitular:'capitular_sacra',
      divisor:'✢ ✦ ✢',
      moldura:'filete_sacro',
      cssClasse:'decor-biblico',
      descricao:'Adequado para textos espirituais, reflexivos, sagrados ou de tom solene.'
    },
    historico:{
      nome:'Histórico / Documental',
      capitular:'capitular_documental',
      divisor:'— ❖ —',
      moldura:'arquivo_classico',
      cssClasse:'decor-historico',
      descricao:'Para romances de época, memórias históricas e obras baseadas em contexto documental.'
    },
    minimalista:{
      nome:'Minimalista moderno',
      capitular:'capitular_simples',
      divisor:'—',
      moldura:'sem_moldura',
      cssClasse:'decor-minimalista',
      descricao:'Para livros que pedem sobriedade, clareza e pouca ornamentação.'
    }
  };

  function normalizar(s){
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
  }

  function escolherBiblioteca(estilo){
    const e = normalizar(estilo);
    if(e.includes('medieval')) return 'medieval';
    if(e.includes('fantasia') || e.includes('epica')) return 'fantasia_epica';
    if(e.includes('sci') || e.includes('cientifica') || e.includes('futur')) return 'ficcao_cientifica';
    if(e.includes('cordel') || e.includes('xilo') || e.includes('sextilha')) return 'cordel';
    if(e.includes('terror') || e.includes('horror') || e.includes('gotic') || e.includes('vamp') || e.includes('zumbi') || e.includes('lobisomem') || e.includes('fantasma') || e.includes('chupacabra') || e.includes('gargula')) return 'terror';
    if(e.includes('infantil') || e.includes('crianca')) return 'infantil';
    if(e.includes('biblic') || e.includes('sacro') || e.includes('relig')) return 'biblico';
    if(e.includes('histor') || e.includes('document')) return 'historico';
    if(e.includes('minimal')) return 'minimalista';
    return 'classico';
  }

  function gerarDecoracao(estilo, opcoes){
    opcoes = opcoes || {};
    const chave = escolherBiblioteca(estilo || opcoes.estilo || 'classico');
    const b = bibliotecas[chave] || bibliotecas.classico;
    return {
      motor:MOTOR_ID,
      chave,
      nome:b.nome,
      capitular:opcoes.capitular || b.capitular,
      divisor:opcoes.divisor || b.divisor,
      moldura:opcoes.moldura || b.moldura,
      cssClasse:b.cssClasse,
      descricao:b.descricao,
      obrigatorio:false,
      criadoEm:new Date().toISOString()
    };
  }

  function aplicarCapitular(texto, decoracao){
    decoracao = decoracao || gerarDecoracao('classico');
    const t = String(texto || '').trim();
    if(!t) return '';
    const primeira = t.charAt(0);
    const resto = t.slice(1);
    return `<p class="celeiro-capitular ${decoracao.cssClasse}" data-capitular="${decoracao.capitular}"><span class="capitular-letra">${escapeHTML(primeira)}</span>${escapeHTML(resto)}</p>`;
  }

  function gerarDivisor(estilo, opcoes){
    const d = gerarDecoracao(estilo, opcoes);
    return `<div class="celeiro-divisor ${d.cssClasse}" data-divisor="${escapeHTML(d.chave)}">${escapeHTML(d.divisor)}</div>`;
  }

  function gerarCardDecoracao(estilo, opcoes){
    const d = gerarDecoracao(estilo, opcoes);
    return `<aside class="celeiro-card-decoracao ${d.cssClasse}">
  <h3>Decoração editorial sugerida: ${escapeHTML(d.nome)}</h3>
  <p>${escapeHTML(d.descricao)}</p>
  <ul>
    <li><strong>Capitular:</strong> ${escapeHTML(d.capitular)}</li>
    <li><strong>Divisor:</strong> ${escapeHTML(d.divisor)}</li>
    <li><strong>Moldura:</strong> ${escapeHTML(d.moldura)}</li>
  </ul>
  <p><em>Esta é uma sugestão. O autor pode aplicar, adaptar ou ignorar.</em></p>
</aside>`;
  }

  function gerarCSSBase(){
    return `
.celeiro-capitular{line-height:1.45;text-align:justify;}
.capitular-letra{float:left;font-size:3.4em;line-height:.85;margin:.06em .12em 0 0;font-weight:bold;}
.celeiro-divisor{text-align:center;margin:1.6em auto;font-size:1.15em;letter-spacing:.12em;opacity:.85;}
.celeiro-card-decoracao{border:1px solid rgba(0,0,0,.12);border-radius:14px;padding:14px 16px;margin:14px 0;background:rgba(255,255,255,.72);font-size:.95em;}
.decor-medieval .capitular-letra{font-family:Cinzel, Georgia, serif;}
.decor-fantasia-epica .capitular-letra{font-family:'EB Garamond', Georgia, serif;}
.decor-scifi .capitular-letra{font-family:Georgia, serif;}
.decor-cordel .capitular-letra{font-family:'Times New Roman', Georgia, serif;}
.decor-terror .capitular-letra{font-family:'Libre Baskerville', Georgia, serif;}
.decor-infantil .capitular-letra{font-family:Georgia, serif;}
    `.trim();
  }

  function escapeHTML(s){ return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }

  window.CeleiroMotorDecoracaoEditorial = {
    bibliotecas,
    escolherBiblioteca,
    gerarDecoracao,
    aplicarCapitular,
    gerarDivisor,
    gerarCardDecoracao,
    gerarCSSBase
  };
})();
