/*
  Motor de Cortesias Departamentais — Celeiro Literário

  Regra institucional:
  - Cortesia não é acesso geral automático.
  - Admin pode liberar cortesia por departamento/módulo.
  - Heterônimo e Wagner podem acompanhar, mas somente Admin altera.
  - Comum/cortesia não veem o motor; apenas sentem o acesso liberado quando aplicável.

  Exemplos:
  - cortesia geral
  - cortesia somente Lapidar
  - cortesia somente diagramação
  - cortesia somente Capista
  - cortesia somente Silo Sonoro
*/
(function(){
  const CHAVE_CORTESIAS = 'celeiro_cortesias_departamentais';
  const CHAVE_EVENTOS = 'celeiro_cortesias_eventos';

  const DEPARTAMENTOS = {
    geral: 'Cortesia geral do Celeiro',
    lapidar: 'Lapidar',
    diagramacao: 'Diagramação',
    polux: 'Polux — Prosa',
    castor: 'Castor — Poesia',
    centauro: 'Centauro — Híbrido',
    quiron_xada: 'Quiron Xadá — Cordel',
    hercules: 'Hércules — Infantil / Visual',
    capista: 'Capista',
    barracao: 'Barracão de Polimento de Imagens',
    traducao: 'Segunda Língua(s)',
    avaliacao_literaria: 'Avaliação Literária',
    lapidacao_literaria: 'Lapidação Literária',
    caminho_das_pedras: 'Caminho das Pedras',
    silo_sonoro: 'Silo Sonoro',
    silo_music: 'Silo Music',
    silo_cinematografico: 'Silo Cinematográfico',
    silo_hq: 'Silo HQ',
    site_das_letras: 'Site das Letras',
    difusao: 'Difusão — Rádio e WebTV',
    sigmal: 'SIGMAL institucional'
  };

  function normalizarPerfil(valor){
    return String(valor||'comum').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  }

  function perfil(){
    const bruto = localStorage.getItem('celeiro_perfil_usuario') || localStorage.getItem('celeiro_perfil') || 'comum';
    const p = normalizarPerfil(bruto);
    const mapa = {usuario:'comum',user:'comum',autor:'comum',comum:'comum',cortesia:'cortesia',heteronimo:'heteronimo',admin:'admin',administrador:'admin',wagner:'wagner',wagnerplanas:'wagner','wagner planas':'wagner'};
    return mapa[p] || 'comum';
  }

  function podeVer(){ return ['admin','heteronimo','wagner'].includes(perfil()); }
  function podeAlterar(){ return perfil() === 'admin'; }
  function ler(chave, fallback){ try{return JSON.parse(localStorage.getItem(chave)||JSON.stringify(fallback));}catch(e){return fallback;} }
  function salvar(chave, valor){ localStorage.setItem(chave, JSON.stringify(valor)); }
  function agora(){ return new Date().toISOString(); }

  function chavePessoa(pessoa){
    if(!pessoa) return 'perfil_atual';
    return String(pessoa.email || pessoa.id || pessoa.cpf || pessoa.nome || 'perfil_atual').trim().toLowerCase();
  }

  function registrarEvento(tipo, dados){
    const eventos = ler(CHAVE_EVENTOS, []);
    const evt = {id:'cort_evt_'+Date.now(), tipo, criadoEm:agora(), dados:dados||{}};
    eventos.unshift(evt);
    salvar(CHAVE_EVENTOS, eventos.slice(0,500));
    if(window.CeleiroWebhookAdmin && typeof window.CeleiroWebhookAdmin.registrarEvento === 'function'){
      window.CeleiroWebhookAdmin.registrarEvento({
        origem:'Motor de Cortesias Departamentais',
        agente:'Administração / CICILE',
        tipo:'cortesia_'+tipo,
        titulo:'Alteração de cortesia departamental',
        mensagem:'O motor de cortesias registrou alteração ou consulta administrativa.',
        dados:evt
      });
    }
    return evt;
  }

  function obterRegistro(pessoa){
    const mapa = ler(CHAVE_CORTESIAS, {});
    const chave = chavePessoa(pessoa);
    return mapa[chave] || {pessoa:pessoa||{perfil:'atual'}, departamentos:{}, atualizadoEm:null};
  }

  function salvarRegistro(pessoa, registro){
    const mapa = ler(CHAVE_CORTESIAS, {});
    const chave = chavePessoa(pessoa);
    registro.atualizadoEm = agora();
    mapa[chave] = registro;
    salvar(CHAVE_CORTESIAS, mapa);
    return registro;
  }

  function definirCortesia(pessoa, departamento, ativo, observacao){
    if(!podeAlterar()) throw new Error('Somente Admin pode ativar/desativar cortesias.');
    if(!DEPARTAMENTOS[departamento]) throw new Error('Departamento inválido: '+departamento);
    const registro = obterRegistro(pessoa);
    registro.pessoa = pessoa || registro.pessoa;
    registro.departamentos[departamento] = {
      ativo: !!ativo,
      departamento,
      nome: DEPARTAMENTOS[departamento],
      atualizadoEm: agora(),
      por: 'Admin',
      observacao: observacao || ''
    };
    salvarRegistro(pessoa, registro);
    registrarEvento(ativo ? 'ativada' : 'desativada', {pessoa:chavePessoa(pessoa), departamento, ativo:!!ativo});
    return registro;
  }

  function ativarGeral(pessoa, observacao){ return definirCortesia(pessoa, 'geral', true, observacao); }
  function desativarGeral(pessoa, observacao){ return definirCortesia(pessoa, 'geral', false, observacao); }

  function temCortesia(pessoa, departamento){
    const registro = obterRegistro(pessoa);
    const geral = registro.departamentos.geral;
    if(geral && geral.ativo) return true;
    const dep = registro.departamentos[departamento];
    if(dep && dep.ativo) return true;

    // Heranças úteis: diagramação libera Polux/Castor/Centauro/Quiron/Hércules.
    if(['polux','castor','centauro','quiron_xada','hercules'].includes(departamento)){
      const diagramacao = registro.departamentos.diagramacao;
      if(diagramacao && diagramacao.ativo) return true;
    }
    return false;
  }

  function departamentosAtivos(pessoa){
    const registro = obterRegistro(pessoa);
    return Object.entries(registro.departamentos || {})
      .filter(([,v])=>v && v.ativo)
      .map(([k,v])=>({id:k, ...v}));
  }

  function listarTodos(){
    if(!podeVer()) return {};
    return ler(CHAVE_CORTESIAS, {});
  }

  function simularParaPerfilAtual(departamento){
    const cadastro = (()=>{try{return JSON.parse(localStorage.getItem('celeiro_cadastro')||'{}')}catch(e){return {}}})();
    const pessoa = {email:cadastro.email || 'perfil_atual', nome:cadastro.nome || cadastro.razao || 'Perfil atual'};
    return temCortesia(pessoa, departamento);
  }

  window.MotorCortesiasDepartamentais = {
    DEPARTAMENTOS,
    perfil,
    podeVer,
    podeAlterar,
    definirCortesia,
    ativarGeral,
    desativarGeral,
    temCortesia,
    departamentosAtivos,
    obterRegistro,
    listarTodos,
    simularParaPerfilAtual,
    chaves:{CHAVE_CORTESIAS,CHAVE_EVENTOS}
  };
})();
