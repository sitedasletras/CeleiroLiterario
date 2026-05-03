(function(){
  const KEY='celeiro_silos_material_atual';

  function salvar(info){
    localStorage.setItem(KEY, JSON.stringify(info));
  }

  function carregar(){
    try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){return null}
  }

  function limpar(){
    localStorage.removeItem(KEY);
    location.reload();
  }

  function montar(id, silo){
    const el=document.getElementById(id);
    if(!el)return;
    const atual=carregar();
    el.innerHTML=`
      <section class="upload-universal">
        <div class="upload-topo">
          <strong>Material atual dos Silos</strong>
          <span>${atual? 'arquivo carregado' : 'aguardando envio'}</span>
        </div>
        <input id="arquivoUniversal" type="file" accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp,.mp3,.wav,.mp4,.mov,.m4a,.zip">
        <div class="upload-info" id="uploadInfo">
          ${atual? `<b>${atual.nome}</b><br>${atual.tipo||'arquivo'} · ${atual.tamanho} KB<br>Origem: ${atual.origem}` : 'Envie o material uma vez. Ele ficará disponível para todos os Silos nesta sessão do navegador.'}
        </div>
        <div class="upload-acoes">
          <button type="button" onclick="window.celeiroUploadLimpar()">Limpar material</button>
        </div>
      </section>`;
    const input=document.getElementById('arquivoUniversal');
    input.addEventListener('change', function(){
      const f=this.files && this.files[0];
      if(!f)return;
      const info={nome:f.name,tipo:f.type||'arquivo',tamanho:Math.max(1,Math.round(f.size/1024)),origem:silo||'Silos Multimídia',data:new Date().toLocaleString('pt-BR')};
      salvar(info);
      document.getElementById('uploadInfo').innerHTML=`<b>${info.nome}</b><br>${info.tipo} · ${info.tamanho} KB<br>Origem: ${info.origem}`;
    });
  }

  window.celeiroUploadMontar=montar;
  window.celeiroUploadCarregar=carregar;
  window.celeiroUploadLimpar=limpar;
})();