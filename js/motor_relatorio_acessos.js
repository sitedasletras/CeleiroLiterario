/*
  Motor Interno de Relatório de Acessos — Celeiro Literário

  Regras institucionais:
  - Relatórios visíveis apenas para Admin, Heterônimo e Wagner Planas.
  - Usuário comum/cortesia não vê contadores, perfil, relatórios ou preferências.
  - Registra acesso por setor, horário, perfil técnico detectado e página acessada.
  - Consolida relatórios em janelas de 24 horas.
  - Em ambiente estático usa localStorage; em fase futura pode enviar para webhook/backend.
*/
(function(){
  const CHAVE_EVENTOS = 'celeiro_relatorio_acessos_eventos';
  const CHAVE_RESUMOS = 'celeiro_relatorio_acessos_resumos';

  function perfil(){
    const bruto=(localStorage.getItem('celeiro_perfil_usuario')||localStorage.getItem('celeiro_perfil')||'comum').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const mapa={admin:'admin',administrador:'admin',heteronimo:'heteronimo',wagner:'wagner',wagnerplanas:'wagner','wagner planas':'wagner',cortesia:'cortesia'};
    return mapa[bruto]||'comum';
  }

  function podeVerRelatorio(){return ['admin','heteronimo','wagner'].includes(perfil());}
  function ler(chave,fallback){try{return JSON.parse(localStorage.getItem(chave)||JSON.stringify(fallback));}catch(e){return fallback;}}
  function salvar(chave,valor){localStorage.setItem(chave,JSON.stringify(valor));}
  function diaISO(data){return new Date(data||Date.now()).toISOString().slice(0,10);}
  function id(){return 'acc_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);}

  function detectarSetor(){
    const p=(location.pathname||'').split('/').pop()||'index.html';
    const regras=[
      ['pagina_respiro_celeiro.html','Hall'],
      ['site_das_letras','Site das Letras'],
      ['sigmal','SIGMAL'],
      ['webradio','Web Rádio'],
      ['webtv','Web TV'],
      ['silo_multimidia','Multimídia'],
      ['caminho_das_pedras','Caminho das Pedras'],
      ['mentoria','Mentoria Cibernética'],
      ['cicile','CICILE'],
      ['expedicao','Expedição'],
      ['corsi','CORSI'],
      ['lapidar','Lapidar'],
      ['polux','Polux'],
      ['castor','Castor'],
      ['centauro','Centauro'],
      ['quiron','Quiron Xadá'],
      ['capista','Capista'],
      ['barracao','Barracão'],
      ['console','Console Privado'],
      ['ohe','OHE'],
      ['bpl','BPL']
    ];
    const nome=p.toLowerCase();
    const achou=regras.find(([frag])=>nome.includes(frag));
    return achou?achou[1]:'Outro';
  }

  function registrarAcesso(extra){
    const eventos=ler(CHAVE_EVENTOS,[]);
    const evento={
      id:id(),
      criadoEm:new Date().toISOString(),
      dia:diaISO(),
      setor:(extra&&extra.setor)||detectarSetor(),
      pagina:(location.pathname||'').split('/').pop()||'index.html',
      perfil:perfil(),
      origem:'navegacao_interna',
      metadados:(extra&&extra.metadados)||{}
    };
    eventos.unshift(evento);
    salvar(CHAVE_EVENTOS,eventos.slice(0,3000));
    atualizarResumo(evento);
    return evento;
  }

  function atualizarResumo(evento){
    const resumos=ler(CHAVE_RESUMOS,{});
    const chave=evento.dia;
    if(!resumos[chave])resumos[chave]={dia:chave,total:0,setores:{},perfis:{},paginas:{}};
    const r=resumos[chave];
    r.total++;
    r.setores[evento.setor]=(r.setores[evento.setor]||0)+1;
    r.perfis[evento.perfil]=(r.perfis[evento.perfil]||0)+1;
    r.paginas[evento.pagina]=(r.paginas[evento.pagina]||0)+1;
    r.atualizadoEm=new Date().toISOString();
    salvar(CHAVE_RESUMOS,resumos);
  }

  function resumoDia(dia){
    if(!podeVerRelatorio())return null;
    const resumos=ler(CHAVE_RESUMOS,{});
    return resumos[dia||diaISO()]||{dia:dia||diaISO(),total:0,setores:{},perfis:{},paginas:{}};
  }

  function eventosDia(dia){
    if(!podeVerRelatorio())return [];
    const alvo=dia||diaISO();
    return ler(CHAVE_EVENTOS,[]).filter(e=>e.dia===alvo);
  }

  function preferenciaPrincipal(dia){
    const r=resumoDia(dia);
    if(!r)return null;
    const pares=Object.entries(r.setores||{}).sort((a,b)=>b[1]-a[1]);
    return pares.length?{setor:pares[0][0],acessos:pares[0][1]}:null;
  }

  window.MotorRelatorioAcessosCeleiro={
    perfil,
    podeVerRelatorio,
    registrarAcesso,
    resumoDia,
    eventosDia,
    preferenciaPrincipal,
    chaves:{CHAVE_EVENTOS,CHAVE_RESUMOS}
  };

  // Registro automático leve em cada página que importar este motor.
  registrarAcesso();
})();