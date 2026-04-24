/*
  Motor Planos de Assinatura — Celeiro Literário / Lapidar

  Objetivo:
  - controlar consumo de unidades de diagramação e capas;
  - manter sistema leve (fora dos diagramadores);
  - integrar com Mesário Mor;
  - aplicar regras atualizadas definidas pelo autor do sistema.

  Regra aplicada nesta versão:
  - remover valor avulso antigo de capa (R$ 3,99 descontinuado);
  - usar valores oficiais atuais:
      capa física = R$ 5
      capa ePub = R$ 2
  - quando existir plano ativo → consumir unidade
  - quando não existir plano ativo → enviar para Mesário
*/

(function(){

  const planosDiagramacao = {
    pacote10: { unidades:10 },
    pacote30: { unidades:30 },
    pacote50: { unidades:50 },
    pacote90: { unidades:90 },
    livre: { unidades:Infinity }
  };

  const valoresCapasAvulsas = {
    capaFisica:5,
    capaEPUB:2
  };

  function criarContaPlano(){
    return {
      diagramacao:{
        unidades:0,
        ativo:false
      },

      capas:{
        unidades:0,
        ativo:false
      }
    };
  }

  function ativarPlanoDiagramacao(conta, plano){
    const dados = planosDiagramacao[plano];

    if(!dados) return false;

    conta.diagramacao.unidades = dados.unidades;
    conta.diagramacao.ativo = true;

    return conta.diagramacao;
  }

  function consumirDiagramacao(conta){

    if(!conta.diagramacao.ativo)
      return {
        status:"sem_plano",
        encaminhamento:"mesario"
      };

    if(conta.diagramacao.unidades === Infinity)
      return {
        status:"consumo_ok",
        restante:"ilimitado"
      };

    if(conta.diagramacao.unidades <= 0)
      return {
        status:"plano_esgotado",
        encaminhamento:"mesario"
      };

    conta.diagramacao.unidades--;

    return {
      status:"consumo_ok",
      restante:conta.diagramacao.unidades
    };

  }

  function registrarCapaAvulsa(tipo){

    const valor = valoresCapasAvulsas[tipo];

    if(!valor)
      return {
        status:"tipo_desconhecido"
      };

    return {
      status:"enviar_mesario",
      valor
    };

  }

  function resumoConta(conta){

    return {
      diagramacaoRestante:conta.diagramacao.unidades,
      planoDiagramacaoAtivo:conta.diagramacao.ativo
    };

  }

  window.CeleiroMotorPlanosAssinatura = {

    planosDiagramacao,
    valoresCapasAvulsas,

    criarContaPlano,
    ativarPlanoDiagramacao,
    consumirDiagramacao,
    registrarCapaAvulsa,
    resumoConta

  };

})();
