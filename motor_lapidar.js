window.MotorLapidar = {

process(texto){

if(!texto) return null;

const linhas = texto.split("\n");

let sextilhas = 0;
let blocos = 0;

let contador = 0;

for(let linha of linhas){

if(linha.trim()===""){
if(contador===6) sextilhas++;
contador=0;
continue;
}

contador++;

}

if(contador===6) sextilhas++;

return{

totalLinhas:linhas.length,
sextilhasDetectadas:sextilhas,
estrutura:sextilhas>0?"cordel":"texto livre"

};

}

};
