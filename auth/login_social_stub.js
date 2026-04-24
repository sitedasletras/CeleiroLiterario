/*
  Login Social Stub — Celeiro Literário

  Função:
  - deixar a arquitetura pronta para login social real;
  - NÃO simular autenticação real;
  - preparar integração futura com Firebase Auth, Supabase Auth ou backend próprio.

  Provedores previstos:
  - Google / Gmail
  - Facebook
  - Instagram
  - X
  - Threads

  Regra:
  Enquanto OAuth real não estiver configurado, os botões apenas registram intenção
  e seguem para cadastro/login tradicional do Celeiro.
*/

(function(){
  const provedores = {
    google: { nome:"Google / Gmail", prioridade:1, ativo:false },
    facebook: { nome:"Facebook", prioridade:2, ativo:false },
    instagram: { nome:"Instagram", prioridade:3, ativo:false },
    x: { nome:"X", prioridade:4, ativo:false },
    threads: { nome:"Threads", prioridade:5, ativo:false }
  };

  function registrarIntencaoLoginSocial(provedor){
    const p = provedores[provedor];
    const registro = {
      provedor,
      nome:p ? p.nome : provedor,
      ativo:p ? p.ativo : false,
      em:new Date().toISOString(),
      status:"preparado_para_integracao_futura"
    };
    try{
      localStorage.setItem("celeiro_login_social_intencao", JSON.stringify(registro));
    }catch(e){}
    return registro;
  }

  function entrarComProvedor(provedor){
    const registro = registrarIntencaoLoginSocial(provedor);
    alert(`${registro.nome} será ativado na fase de autenticação real. Por enquanto, siga pelo login/cadastro do Celeiro.`);
    return registro;
  }

  function aplicarPerfilSocialBasico(dados = {}){
    // Futuro: receber dados reais do provedor OAuth.
    const perfil = {
      nome:dados.nome || "",
      email:dados.email || "",
      foto:dados.foto || "",
      provedor:dados.provedor || "manual",
      idExterno:dados.idExterno || ""
    };
    try{
      localStorage.setItem("celeiro_perfil_social", JSON.stringify(perfil));
    }catch(e){}
    return perfil;
  }

  window.CeleiroLoginSocial = {
    provedores,
    registrarIntencaoLoginSocial,
    entrarComProvedor,
    aplicarPerfilSocialBasico
  };
})();
