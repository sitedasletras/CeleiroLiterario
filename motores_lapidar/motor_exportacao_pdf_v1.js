/*
  Lapidar — Motor Exportação PDF v1

  Estratégia leve:
  1) tenta usar jsPDF se disponível;
  2) fallback: exportação via print-to-PDF do navegador.
*/

(function(){

  function exportarViaPrint(){
    window.print();
  }

  async function exportarViaJsPDF(html){
    if(!window.jspdf){
      console.warn("jsPDF não encontrado — usando fallback print()");
      exportarViaPrint();
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit:"pt", format:"a4" });

    await doc.html(html,{
      callback:function(doc){
        doc.save("lapidar-export.pdf");
      },
      x:24,
      y:24,
      width:540
    });
  }

  function exportar(htmlElemento){
    if(!htmlElemento){
      console.warn("Elemento HTML não informado — fallback print()");
      exportarViaPrint();
      return;
    }

    exportarViaJsPDF(htmlElemento);
  }

  window.LapidarMotorExportacaoPDF = { exportar };
})();
