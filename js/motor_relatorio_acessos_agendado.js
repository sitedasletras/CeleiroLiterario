/*
  Motor de Relatórios Agendados — Celeiro Literário

  Complementa js/motor_relatorio_acessos.js
  Gera pacotes internos diários, semanais e mensais.

  Visibilidade:
  - Admin
  - Heterônimo
  - Wagner Planas

  Público comum/cortesia não vê nada.
*/
(function(){
  const CHAVE_PACOTES = 'celeiro_relatorio_acessos_pacotes';
  const CHAVE_CONTROLE = 'celeiro_relatorio_acessos_controle_agendado';

  function podeVer(){
    return window.MotorRelatorioAcessosCeleiro && window.MotorRelatorioAcessosCeleiro.podeVerRelatorio();
  }

  function ler(chave,fallback){try{return JSON.parse(localStorage.getItem(chave)||JSON.stringify(fallback));}catch(e){return fallback;}}
  function salvar(chave,valor){localStorage.setItem(chave,JSON.stringify(valor));}
  function hoje(){return new Date().toISOString().slice(0,10);}
  function id(prefixo){return prefixo+'_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);}

  function dataOffset(dias){
    const d=new Date();
    d.setDate(d.getDate()+dias);
    return d.toISOString().slice(0,10);
  }

  function pacoteDiario(dia){
    if(!podeVer())return null;
    const motor=window.MotorRelatorioAcessosCeleiro;
    const alvo=dia||hoje();
    const resumo=motor.resumoDia(alvo);
    const preferencia=motor.preferenciaPrincipal(alvo);
    return {
      id:id('rel_dia'),
      tipo:'diario',
      criadoEm:new Date().toISOString(),
      periodo:{inicio:alvo,fim:alvo},
      resumo,
      preferencia
    };
  }

  function somarResumo(dias){
    const total={total:0,setores:{},perfis:{},paginas:{}};
    dias.forEach(dia=>{
      const r=window.MotorRelatorioAcessosCeleiro.resumoDia(dia);
      total.total+=(r.total||0);
      ['setores','perfis','paginas'].forEach(ch=>{
        Object.entries(r[ch]||{}).forEach(([k,v])=>{total[ch][k]=(total[ch][k]||0)+v;});
      });
    });
    const preferencia=Object.entries(total.setores).sort((a,b)=>b[1]-a[1])[0]||null;
    return {total,preferencia:preferencia?{setor:preferencia[0],acessos:preferencia[1]}:null};
  }

  function pacoteSemanal(){
    if(!podeVer())return null;
    const dias=[];
    for(let i=-6;i<=0;i++)dias.push(dataOffset(i));
    const consolidado=somarResumo(dias);
    return {
      id:id('rel_semana'),
      tipo:'semanal',
      criadoEm:new Date().toISOString(),
      periodo:{inicio:dias[0],fim:dias[dias.length-1]},
      dias,
      consolidado
    };
  }

  function pacoteMensal(){
    if(!podeVer())return null;
    const agora=new Date();
    const ano=agora.getFullYear();
    const mes=agora.getMonth();
    const dias=[];
    const ultimo=new Date(ano,mes+1,0).getDate();
    for(let d=1;d<=ultimo;d++)dias.push(new Date(ano,mes,d).toISOString().slice(0,10));
    const consolidado=somarResumo(dias);
    return {
      id:id('rel_mes'),
      tipo:'mensal',
      criadoEm:new Date().toISOString(),
      periodo:{inicio:dias[0],fim:dias[dias.length-1]},
      dias,
      consolidado
    };
  }

  function salvarPacote(pacote){
    if(!pacote)return null;
    const pacotes=ler(CHAVE_PACOTES,[]);
    pacotes.unshift(pacote);
    salvar(CHAVE_PACOTES,pacotes.slice(0,365));
    if(window.CeleiroWebhookAdmin && typeof window.CeleiroWebhookAdmin.registrarEvento==='function'){
      window.CeleiroWebhookAdmin.registrarEvento({
        origem:'Motor Relatório de Acessos',
        agente:'CICILE / Administração',
        tipo:'relatorio_acessos_'+pacote.tipo,
        titulo:'Relatório interno de acessos gerado',
        mensagem:'Relatório interno disponível para Admin, Heterônimo e Wagner Planas.',
        dados:pacote
      });
    }
    return pacote;
  }

  function executarAgendamento(){
    if(!podeVer())return null;
    const controle=ler(CHAVE_CONTROLE,{ultimoDiario:null,ultimaSemana:null,ultimoMes:null});
    const h=hoje();
    const pacotes=[];

    if(controle.ultimoDiario!==h){
      pacotes.push(salvarPacote(pacoteDiario(h)));
      controle.ultimoDiario=h;
    }

    const d=new Date();
    const chaveSemana=d.getFullYear()+'-W'+Math.ceil((((d-new Date(d.getFullYear(),0,1))/86400000)+new Date(d.getFullYear(),0,1).getDay()+1)/7);
    if(d.getDay()===0 && controle.ultimaSemana!==chaveSemana){
      pacotes.push(salvarPacote(pacoteSemanal()));
      controle.ultimaSemana=chaveSemana;
    }

    const chaveMes=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
    if(d.getDate()===1 && controle.ultimoMes!==chaveMes){
      pacotes.push(salvarPacote(pacoteMensal()));
      controle.ultimoMes=chaveMes;
    }

    salvar(CHAVE_CONTROLE,controle);
    return pacotes.filter(Boolean);
  }

  function listarPacotes(){
    if(!podeVer())return [];
    return ler(CHAVE_PACOTES,[]);
  }

  window.MotorRelatorioAcessosAgendado={
    pacoteDiario,
    pacoteSemanal,
    pacoteMensal,
    salvarPacote,
    executarAgendamento,
    listarPacotes,
    chaves:{CHAVE_PACOTES,CHAVE_CONTROLE}
  };

  executarAgendamento();
})();