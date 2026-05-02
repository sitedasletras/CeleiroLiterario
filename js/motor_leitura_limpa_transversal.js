/* Motor de Leitura Limpa Transversal — MLLT
   Celeiro Literário / Lapidar / OI / Silos

   Função:
   - limpar rascunhos antes de qualquer leitura editorial;
   - ignorar quebras artificiais de DOC/DOCX/ODT/TXT/PDF convertido;
   - preservar poesia, cordel, diálogos, capítulos, listas e epígrafes;
   - entregar texto base estável para Preparação, Gramadores, Analisadores, Segunda Língua e Silos.
*/
(function(){
  const CHAVE_ULTIMA = 'celeiro_mllt_ultima_limpeza';

  function normalizarQuebras(texto){
    return String(texto||'')
      .replace(/\r\n/g,'\n')
      .replace(/\r/g,'\n')
      .replace(/\u00A0/g,' ')
      .replace(/[\u200B-\u200D\uFEFF]/g,'');
  }

  function parecePoesiaOuCordel(linhas){
    const uteis = linhas.map(l=>l.trim()).filter(Boolean);
    if(uteis.length < 4) return false;
    const curtas = uteis.filter(l=>l.length <= 58).length;
    const pontuacaoFinalBaixa = uteis.filter(l=>!/[.!?…:]$/.test(l)).length;
    return (curtas / uteis.length) >= 0.62 && (pontuacaoFinalBaixa / uteis.length) >= 0.35;
  }

  function limparEstruturaArtificial(texto){
    let t = normalizarQuebras(texto);

    // Remove marcadores comuns de quebras de página/seção vindos de conversão.
    t = t.replace(/\f/g,'\n');
    t = t.replace(/\n?\s*(?:---\s*)?(?:page break|quebra de página|quebra de pagina|section break|quebra de seção|quebra de secao)(?:\s*---)?\s*\n?/gi,'\n');
    t = t.replace(/\n\s*Página\s+\d+\s*(?:de\s+\d+)?\s*\n/gi,'\n');

    const linhas = t.split('\n');
    const poesia = parecePoesiaOuCordel(linhas);

    if(poesia){
      // Em poesia/cordel, preserva quebras de verso e estrofe; só reduz exageros.
      t = linhas.map(l=>l.replace(/[ \t]+$/g,'').replace(/^\t+/g,'')).join('\n');
      t = t.replace(/\n{4,}/g,'\n\n\n');
    }else{
      // Em prosa, remove quebras artificiais e espaços visuais falsos.
      t = linhas.map(l=>l.trim()).join('\n');
      t = t.replace(/\n{3,}/g,'\n\n');
      t = t.replace(/([^.!?…:;"”\)\]])\n(?=[a-záàâãéêíóôõúç])/g,'$1 ');
      t = t.replace(/\n[ \t]+/g,'\n');
    }

    // Remove tabulações de recuo visual e espaços duplicados.
    t = t.replace(/^\t+/gm,'');
    t = t.replace(/[ \t]{2,}/g,' ');
    t = t.replace(/[ \t]+\n/g,'\n');
    return t.trim();
  }

  function normalizarPontuacaoEditorial(texto){
    let t = String(texto||'');
    // Hífen usado como travessão de diálogo no início de linha.
    t = t.replace(/^\s*-\s+/gm,'— ');
    // Hífen com espaços usado como interrupção narrativa.
    t = t.replace(/\s+-\s+/g,' — ');
    // Aspas simples de Word/PDF para aspas comuns seguras.
    t = t.replace(/[“”]/g,'"').replace(/[‘’]/g,"'");
    // Espaços antes de pontuação.
    t = t.replace(/\s+([,.;:!?])/g,'$1');
    return t.trim();
  }

  function detectarTipo(texto){
    const t = String(texto||'');
    const linhas = t.split('\n');
    const uteis = linhas.map(l=>l.trim()).filter(Boolean);
    const textoBaixo = t.toLowerCase();
    const temCordel = /cordel|sextilha|septilha|xilogravura|repente|folheto/.test(textoBaixo);
    if(temCordel) return 'cordel';
    if(parecePoesiaOuCordel(linhas)) return 'poesia';
    const versos = uteis.filter(l=>l.length <= 60).length;
    const paragrafosLongos = uteis.filter(l=>l.length > 120).length;
    if(versos > 5 && paragrafosLongos > 2) return 'hibrido';
    if(/receita|ingredientes|modo de preparo|atividade escolar|faixa etária|faixa etaria|imagem|ilustração|ilustracao/.test(textoBaixo)) return 'especial';
    return 'prosa';
  }

  function recomendarGramador(tipo){
    const mapa = {
      prosa:{modulo:'Pólux',url:'dias_gramador_livros.html#polux',automatico:true},
      poesia:{modulo:'Castor',url:'dias_gramador_livros.html#castor',automatico:true},
      hibrido:{modulo:'Centauro',url:'dias_gramador_livros.html#centauro',automatico:true},
      cordel:{modulo:'Qui(RON)xadá',url:'dias_gramador_livros.html#quironxada',automatico:true},
      especial:{modulo:'Hércules',url:'dias_gramador_livros.html#hercules',automatico:false,guiado:true}
    };
    return mapa[tipo] || mapa.prosa;
  }

  function limpar(texto, origem){
    const bruto = String(texto||'');
    const estrutura = limparEstruturaArtificial(bruto);
    const limpo = normalizarPontuacaoEditorial(estrutura);
    const tipo = detectarTipo(limpo);
    const recomendacao = recomendarGramador(tipo);
    const resultado = {
      origem: origem || 'manual',
      criadoEm: new Date().toISOString(),
      tamanhoOriginal: bruto.length,
      tamanhoLimpo: limpo.length,
      tipoDetectado: tipo,
      recomendacao,
      textoLimpo: limpo
    };
    try{localStorage.setItem(CHAVE_ULTIMA, JSON.stringify(resultado));}catch(e){}
    return resultado;
  }

  function aplicarEmTextArea(idEntrada,idSaida){
    const entrada = document.getElementById(idEntrada);
    const saida = document.getElementById(idSaida);
    if(!entrada) return null;
    const r = limpar(entrada.value,'textarea:'+idEntrada);
    if(saida) saida.value = r.textoLimpo;
    return r;
  }

  window.MotorLeituraLimpaTransversal = {limpar,detectarTipo,recomendarGramador,aplicarEmTextArea,chave:CHAVE_ULTIMA};
})();