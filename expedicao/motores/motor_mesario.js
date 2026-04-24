/*
  Motor Mesário — Celeiro Literário / Lapidar

  Função:
  - criar Mesários de Seção;
  - consolidar tudo no Mesário Mor;
  - preparar checkout/pagamento;
  - liberar retirada/download após confirmação;
  - manter Caminhada pelas Redes como decisão opcional do autor.

  Regra crítica:
  A Caminhada pelas Redes NÃO é automática.
  Após pagamento aprovado, o fluxo padrão é liberar arquivos para retirada/download.
  O pacote social só é preparado/liberado se o autor escolher explicitamente.
*/

(function(){
  const secoes = {
    diagramacao: "Diagramação",
    capa: "Capas / Faça Kapa",
    traducao: "Segunda Língua(s)",
    lapidacao: "Lapidação Literária",
    avaliacao: "Avaliação Literária",
    silos: "Silos",
    imagens: "Barracão de Polimento das Imagens",
    redes: "Caminhada pelas Redes",
    expediente: "Expedição"
  };

  function moedaPadrao(moeda){
    return moeda === "USD" ? "USD" : "BRL";
  }

  function formatarValor(valor, moeda = "BRL"){
    const prefixo = moeda === "USD" ? "US$" : "R$";
    return `${prefixo} ${Number(valor || 0).toFixed(2).replace(".",",")}`;
  }

  function criarMesarioSecao(secao, moeda = "BRL"){
    return {
      secao,
      nome: secoes[secao] || secao,
      moeda: moedaPadrao(moeda),
      itens: [],
      confirmado: false,
      adicionar(item){
        const registro = {
          id: item.id || `${secao}-${Date.now()}-${this.itens.length + 1}`,
          descricao: item.descricao || "Item sem descrição",
          modulo: item.modulo || secao,
          valor: Number(item.valor || 0),
          moeda: moedaPadrao(item.moeda || this.moeda),
          obrigatorio: !!item.obrigatorio,
          metadados: item.metadados || {}
        };
        this.itens.push(registro);
        return registro;
      },
      total(){
        return this.itens.reduce((s,i)=>s + Number(i.valor || 0),0);
      },
      confirmar(){
        this.confirmado = true;
        return this.resumo();
      },
      resumo(){
        return {
          secao:this.secao,
          nome:this.nome,
          moeda:this.moeda,
          total:this.total(),
          confirmado:this.confirmado,
          itens:this.itens.slice()
        };
      }
    };
  }

  function criarMesarioMor(moeda = "BRL"){
    return {
      moeda: moedaPadrao(moeda),
      mesarios: {},
      caminhadaRedesEscolhida: false,
      pagamento: {
        status:"pendente",
        provedor:"Hotmart",
        referencia:null,
        confirmadoEm:null
      },
      expedicao: {
        status:"aguardando_pagamento",
        downloadsLiberados:false,
        redesLiberadas:false,
        arquivos:[]
      },
      obterSecao(secao){
        if(!this.mesarios[secao]){
          this.mesarios[secao] = criarMesarioSecao(secao, this.moeda);
        }
        return this.mesarios[secao];
      },
      adicionarItem(secao, item){
        return this.obterSecao(secao).adicionar(item);
      },
      escolherCaminhadaPelasRedes(ativo){
        this.caminhadaRedesEscolhida = !!ativo;
        return this.caminhadaRedesEscolhida;
      },
      total(){
        return Object.values(this.mesarios).reduce((s,m)=>s + m.total(),0);
      },
      confirmarSecao(secao){
        return this.obterSecao(secao).confirmar();
      },
      todasSecoesConfirmadas(){
        const lista = Object.values(this.mesarios);
        if(!lista.length) return false;
        return lista.every(m=>m.confirmado);
      },
      gerarResumo(){
        return {
          moeda:this.moeda,
          total:this.total(),
          totalFormatado:formatarValor(this.total(), this.moeda),
          secoes:Object.values(this.mesarios).map(m=>m.resumo()),
          caminhadaRedesEscolhida:this.caminhadaRedesEscolhida,
          pagamento:this.pagamento,
          expedicao:this.expedicao
        };
      },
      prepararCheckoutHotmart(opcoes = {}){
        this.pagamento = {
          status:"checkout_preparado",
          provedor:"Hotmart",
          referencia: opcoes.referencia || `HM-${Date.now()}`,
          urlCheckout: opcoes.urlCheckout || null,
          confirmadoEm:null,
          total:this.total(),
          moeda:this.moeda
        };
        return this.pagamento;
      },
      confirmarPagamentoHotmart(dados = {}){
        this.pagamento.status = dados.status || "aprovado";
        this.pagamento.referencia = dados.referencia || this.pagamento.referencia || `HM-${Date.now()}`;
        this.pagamento.confirmadoEm = dados.confirmadoEm || new Date().toISOString();

        if(this.pagamento.status === "aprovado"){
          this.liberarExpedicao();
        }

        return this.gerarResumo();
      },
      registrarArquivo(arquivo){
        const item = {
          id: arquivo.id || `arquivo-${Date.now()}-${this.expedicao.arquivos.length + 1}`,
          nome: arquivo.nome || "arquivo_sem_nome",
          tipo: arquivo.tipo || "download",
          origem: arquivo.origem || "expedicao",
          url: arquivo.url || null,
          liberado: false
        };
        this.expedicao.arquivos.push(item);
        return item;
      },
      liberarExpedicao(){
        this.expedicao.status = "liberada_para_retirada";
        this.expedicao.downloadsLiberados = true;
        this.expedicao.arquivos = this.expedicao.arquivos.map(a=>({ ...a, liberado:true }));

        // Regra oficial: redes só liberam se o autor escolheu.
        this.expedicao.redesLiberadas = !!this.caminhadaRedesEscolhida;

        return this.expedicao;
      },
      statusSaida(){
        if(this.pagamento.status !== "aprovado") return "aguardando_pagamento";
        if(this.caminhadaRedesEscolhida) return "downloads_liberados_e_redes_opcionais_liberadas";
        return "downloads_liberados_para_retirada";
      }
    };
  }

  function gerarRelatorioMesario(mesarioMor){
    const resumo = mesarioMor.gerarResumo();
    const linhas = [];
    linhas.push("RELATÓRIO DO MESÁRIO MOR");
    linhas.push("");
    resumo.secoes.forEach(secao=>{
      linhas.push(`${secao.nome}: ${formatarValor(secao.total, resumo.moeda)}`);
      secao.itens.forEach(item=>linhas.push(`  - ${item.descricao}: ${formatarValor(item.valor, item.moeda)}`));
    });
    linhas.push("");
    linhas.push(`TOTAL: ${resumo.totalFormatado}`);
    linhas.push(`Pagamento: ${resumo.pagamento.status}`);
    linhas.push(`Expedição: ${resumo.expedicao.status}`);
    linhas.push(`Caminhada pelas Redes: ${resumo.caminhadaRedesEscolhida ? "escolhida pelo autor" : "não escolhida; seguir apenas para retirada/download"}`);
    return linhas.join("\n");
  }

  window.CeleiroMotorMesario = {
    secoes,
    formatarValor,
    criarMesarioSecao,
    criarMesarioMor,
    gerarRelatorioMesario
  };
})();
