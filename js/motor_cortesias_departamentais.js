/*
  Motor de Cortesias Departamentais e por Item — Celeiro Literário

  Regra institucional:
  - Cortesia não é acesso geral automático.
  - Admin pode liberar cortesia por departamento e por item interno.
  - Ex.: Avaliação Literária pode liberar só relatório curto, só relatório profundo ou todos.
  - Ex.: Silo Multimídia pode liberar só Silo Music, só Silo Sonoro, ou apenas uma faixa de duração.
  - Heterônimo e Wagner acompanham; somente Admin altera.
  - Comum/cortesia não veem o motor; apenas recebem acesso onde foi liberado.
*/
(function(){
  const CHAVE_CORTESIAS = 'celeiro_cortesias_departamentais_itens';
  const CHAVE_EVENTOS = 'celeiro_cortesias_eventos';

  const ARVORE_CORTESIAS = {
    geral:{nome:'Cortesia geral do Celeiro', itens:{todos:'Tudo liberado por cortesia'}},
    lapidar:{nome:'Lapidar', itens:{modo_autor:'Modo autor', diagramação:'Diagramação geral', exportacao:'Exportação editorial', mesario:'Mesário Lapidar'}},
    diagramacao:{nome:'Diagramação', itens:{todos:'Todos os diagramadores', polux:'Polux — Prosa', castor:'Castor — Poesia', centauro:'Centauro — Híbrido', quiron_xada:'Quiron Xadá — Cordel', hercules:'Hércules — Infantil / Visual'}},
    capista:{nome:'Capista', itens:{capa_fisica:'Capa física', capa_epub:'Capa ePub', par_completo:'Par físico + ePub', cordel:'Capa de cordel', premium:'Capa premium'}},
    barracao:{nome:'Barracão de Polimento de Imagens', itens:{tratamento_basico:'Tratamento básico', tratamento_capa:'Tratamento para capa', acervo_autor:'Bunker/acervo de imagens', pacote_visual:'Pacote visual completo'}},
    traducao:{nome:'Segunda Língua(s)', itens:{ingles:'Inglês', espanhol:'Espanhol', frances:'Francês', italiano:'Italiano', ida_volta:'Ida e volta / conferência'}},
    avaliacao_literaria:{nome:'Avaliação Literária', itens:{avaliacao_gratuita:'Avaliação gratuita ampliada', parecer_curto:'Parecer curto', parecer_2_paginas:'Parecer 2 páginas', parecer_5_paginas:'Parecer 5 páginas', parecer_8_paginas:'Parecer 8 páginas + Raio-X suave', parecer_11_paginas:'Parecer 11 páginas + Raio-X profundo', raio_x_progressao:'Raio-X de Progressão da Obra'}},
    lapidacao_literaria:{nome:'Lapidação Literária', itens:{correcao_basica:'Correção básica', lapidacao_suave:'Lapidação suave', lapidacao_profunda:'Lapidação profunda', humanizacao:'Humanização/lapidação literária'}},
    caminho_das_pedras:{nome:'Caminho das Pedras', itens:{prosa_modulos_1_2:'Prosa — módulos 1 e 2', prosa_completo:'Prosa completo', poesia_modulos_1_2:'Poesia — módulos 1 e 2', poesia_completo:'Poesia completo', ambos_completo:'Prosa + Poesia completo', certificado:'Certificado'}},
    silo_multimidia:{nome:'Silo Multimídia', itens:{silo_sonoro:'Silo Sonoro', silo_music:'Silo Music', silo_cinematografico:'Silo Cinematográfico', silo_hq:'Silo HQ', pacote_multimidia:'Pacote multimídia'}},
    silo_sonoro:{nome:'Silo Sonoro', itens:{ate_10_min:'Até 10 minutos', ate_20_min:'Até 20 minutos', ate_30_min:'Até 30 minutos', ate_60_min:'Até 60 minutos', audiobook_mensal:'Audiobook mensal'}},
    silo_music:{nome:'Silo Music', itens:{ate_10_min:'Até 10 minutos', ate_20_min:'Até 20 minutos', ate_30_min:'Até 30 minutos', ate_60_min:'Até 60 minutos', musica_avulsa:'Música avulsa', perfil_artistico:'Perfil artístico musical'}},
    silo_cinematografico:{nome:'Silo Cinematográfico', itens:{reels:'Reels/Shorts', trailer_livro:'Trailer de livro', videoclipe:'Videoclipe', cena_curta:'Cena curta', ate_10_min:'Até 10 minutos', ate_20_min:'Até 20 minutos', ate_30_min:'Até 30 minutos', ate_60_min:'Até 60 minutos'}},
    silo_hq:{nome:'Silo HQ', itens:{pagina_teste:'Página teste', personagem:'Personagem', capitulo_hq:'Capítulo HQ', pacote_hq:'Pacote HQ'}},
    site_das_letras:{nome:'Site das Letras', itens:{catalogo:'Catálogo', biografias:'Biografias', selos:'Selos autorais', sala_rui:'Sala Rui Matos'}},
    difusao:{nome:'Difusão — Rádio e WebTV', itens:{webradio:'WebRádio', webtv:'WebTV', postagem_social:'Postagem em rede social', circulacao_controlada:'Circulação controlada'}},
    sigmal:{nome:'SIGMAL institucional', itens:{perfil_artistico:'Perfil artístico', divulgacao_internacional:'Divulgação internacional', academia:'Academia', participacao_sigmal:'Participação SIGMAL'}}
  };

  function perfil(){const bruto=(localStorage.getItem('celeiro_perfil_usuario')||localStorage.getItem('celeiro_perfil')||'comum').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');const mapa={usuario:'comum',user:'comum',autor:'comum',comum:'comum',cortesia:'cortesia',heteronimo:'heteronimo',admin:'admin',administrador:'admin',wagner:'wagner',wagnerplanas:'wagner','wagner planas':'wagner'};return mapa[bruto]||'comum';}
  function podeVer(){return ['admin','heteronimo','wagner'].includes(perfil());}
  function podeAlterar(){return perfil()==='admin';}
  function ler(chave,fallback){try{return JSON.parse(localStorage.getItem(chave)||JSON.stringify(fallback));}catch(e){return fallback;}}
  function salvar(chave,valor){localStorage.setItem(chave,JSON.stringify(valor));}
  function agora(){return new Date().toISOString();}
  function chavePessoa(pessoa){if(!pessoa)return 'perfil_atual';return String(pessoa.email||pessoa.id||pessoa.cpf||pessoa.nome||'perfil_atual').trim().toLowerCase();}

  function registrarEvento(tipo,dados){
    const eventos=ler(CHAVE_EVENTOS,[]);const evt={id:'cort_evt_'+Date.now(),tipo,criadoEm:agora(),dados:dados||{}};eventos.unshift(evt);salvar(CHAVE_EVENTOS,eventos.slice(0,500));
    if(window.CeleiroWebhookAdmin&&typeof window.CeleiroWebhookAdmin.registrarEvento==='function'){
      window.CeleiroWebhookAdmin.registrarEvento({origem:'Motor de Cortesias por Item',agente:'Administração / CICILE',tipo:'cortesia_'+tipo,titulo:'Alteração de cortesia por departamento/item',mensagem:'Cortesia alterada em nível granular.',dados:evt});
    }
    return evt;
  }

  function obterRegistro(pessoa){const mapa=ler(CHAVE_CORTESIAS,{});const chave=chavePessoa(pessoa);return mapa[chave]||{pessoa:pessoa||{perfil:'atual'},departamentos:{},atualizadoEm:null};}
  function salvarRegistro(pessoa,registro){const mapa=ler(CHAVE_CORTESIAS,{});const chave=chavePessoa(pessoa);registro.atualizadoEm=agora();mapa[chave]=registro;salvar(CHAVE_CORTESIAS,mapa);return registro;}

  function validar(departamento,item){if(!ARVORE_CORTESIAS[departamento])throw new Error('Departamento inválido: '+departamento);if(item&&item!=='todos'&&!ARVORE_CORTESIAS[departamento].itens[item])throw new Error('Item inválido em '+departamento+': '+item);}

  function definirCortesia(pessoa,departamento,item,ativo,observacao){
    if(!podeAlterar())throw new Error('Somente Admin pode ativar/desativar cortesias.');
    item=item||'todos';validar(departamento,item);
    const registro=obterRegistro(pessoa);registro.pessoa=pessoa||registro.pessoa;
    if(!registro.departamentos[departamento])registro.departamentos[departamento]={ativo:false,itens:{}};
    if(item==='todos')registro.departamentos[departamento].ativo=!!ativo;
    registro.departamentos[departamento].itens[item]={ativo:!!ativo,departamento,item,nomeDepartamento:ARVORE_CORTESIAS[departamento].nome,nomeItem:item==='todos'?'Todos os itens':ARVORE_CORTESIAS[departamento].itens[item],atualizadoEm:agora(),por:'Admin',observacao:observacao||''};
    salvarRegistro(pessoa,registro);registrarEvento(ativo?'ativada':'desativada',{pessoa:chavePessoa(pessoa),departamento,item,ativo:!!ativo});return registro;
  }

  function temCortesia(pessoa,departamento,item){
    item=item||'todos';const registro=obterRegistro(pessoa);
    const geral=registro.departamentos.geral;if(geral&&(geral.ativo||(geral.itens&&geral.itens.todos&&geral.itens.todos.ativo)))return true;
    const dep=registro.departamentos[departamento];if(dep){if(dep.ativo)return true;if(dep.itens&&dep.itens.todos&&dep.itens.todos.ativo)return true;if(dep.itens&&dep.itens[item]&&dep.itens[item].ativo)return true;}
    if(['polux','castor','centauro','quiron_xada','hercules'].includes(departamento)||['polux','castor','centauro','quiron_xada','hercules'].includes(item)){
      const diag=registro.departamentos.diagramacao;if(diag&&(diag.ativo||(diag.itens&&diag.itens.todos&&diag.itens.todos.ativo)||(diag.itens&&diag.itens[item]&&diag.itens[item].ativo)))return true;
    }
    if(['silo_sonoro','silo_music','silo_cinematografico','silo_hq'].includes(departamento)||['silo_sonoro','silo_music','silo_cinematografico','silo_hq'].includes(item)){
      const multi=registro.departamentos.silo_multimidia;if(multi&&(multi.ativo||(multi.itens&&multi.itens.todos&&multi.itens.todos.ativo)||(multi.itens&&multi.itens[departamento]&&multi.itens[departamento].ativo)||(multi.itens&&multi.itens[item]&&multi.itens[item].ativo)))return true;
    }
    return false;
  }

  function itensAtivos(pessoa){const registro=obterRegistro(pessoa);const saida=[];Object.entries(registro.departamentos||{}).forEach(([dep,dados])=>{if(dados.ativo)saida.push({departamento:dep,item:'todos',nomeDepartamento:ARVORE_CORTESIAS[dep]?.nome||dep,nomeItem:'Todos'});Object.entries(dados.itens||{}).forEach(([item,info])=>{if(info&&info.ativo)saida.push({departamento:dep,item,...info});});});return saida;}
  function listarTodos(){return podeVer()?ler(CHAVE_CORTESIAS,{}):{};}

  window.MotorCortesiasDepartamentais={ARVORE_CORTESIAS,DEPARTAMENTOS:Object.fromEntries(Object.entries(ARVORE_CORTESIAS).map(([k,v])=>[k,v.nome])),perfil,podeVer,podeAlterar,definirCortesia,temCortesia,itensAtivos,obterRegistro,listarTodos,chaves:{CHAVE_CORTESIAS,CHAVE_EVENTOS}};
})();
