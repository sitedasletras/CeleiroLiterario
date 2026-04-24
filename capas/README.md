# Setor de Capas — Celeiro Literário

Este setor concentra os capistas e a mesa externa de criação de capas.

## Regra principal

Os capistas devem permanecer leves.

A mesa de criação e os motores de cálculo ficam separados para evitar travamento.

## Capistas oficiais

- Faça Kapa Literário — parceiro de Pólux, Castor e Centauro.
- Faça Kapa Cordel — parceiro do Qui(RON)xadá.
- Faça Kapa Polímata — parceiro do Hércules.

## Mesa externa

A mesa de criação será o ambiente onde a capa é montada visualmente.

Ela deve receber:

- frente
- lombada
- contracapa
- orelha esquerda, quando houver
- orelha direita, quando houver
- imagens
- título
- subtítulo
- autor
- selo
- ISBN
- código de barras

## Cálculo obrigatório da capa física

Toda capa física deve calcular:

- largura da frente
- altura da frente
- largura da contracapa
- altura da contracapa
- lombada exata
- sangria
- orelhas, quando houver
- largura total aberta
- altura total aberta

A lombada não pode ser aproximada sem aviso.

## Miolo enviado ou cálculo manual

A mesa deve perguntar se o autor enviará o miolo do livro.

Opções:

- Sim, enviar o miolo para cálculo exato.
- Não, informar quantidade de páginas manualmente.

Quando o miolo for enviado, o sistema deve tentar identificar o número real de páginas e assumir o cálculo como responsabilidade técnica do Celeiro.

Quando o miolo não for enviado, o cálculo será estimado com base nas informações declaradas pelo autor. A interface deve avisar isso claramente.

Texto obrigatório de aviso:

> Para cálculo exato da lombada, envie o miolo final do livro. Sem envio do miolo, a lombada será calculada por estimativa com base nos dados informados pelo autor.

## Papel e gramatura obrigatórios

O cálculo da lombada deve exigir o tipo de papel e a gramatura.

O sistema não deve tratar diferença de gramatura como detalhe irrelevante.

Mesmo pequenas diferenças de papel alteram a espessura física do miolo e podem mudar a lombada.

Campos obrigatórios:

- tipo de papel
- gramatura
- fator de espessura por página ou folha
- plataforma/gráfica de destino

Exemplos de papel:

- Offset 75 g
- Offset 90 g
- Pólen 80 g
- Pólen 90 g
- Couchê 115 g
- Couchê 150 g
- Personalizado

Quando o papel ou a gramatura forem informados manualmente, o sistema deve registrar que a lombada depende desses dados.

Texto obrigatório de aviso:

> A gramatura do papel altera a lombada. Uma diferença aparentemente pequena pode gerar diferença real na capa física. Informe o papel correto da plataforma ou gráfica escolhida.

## Plataforma de destino

A mesa deve perguntar para qual plataforma ou gráfica a capa será preparada.

Exemplos de destino:

- UICLAP
- Clube de Autores
- Amazon KDP
- gráfica personalizada
- impressão local
- personalizada/manual

Cada destino pode ter medidas próprias.

Quando a plataforma não estiver cadastrada ou quando as regras mudarem, o sistema deve permitir preenchimento manual das medidas.

## Capa física e capa ePub

A mesa deve permitir:

- apenas capa física
- apenas capa ePub
- capa física + capa ePub

A seleção física + ePub deve gerar dois valores somados, formando um valor fechado da seção.

Capa ePub:

- Brasil: R$ 2,00
- Exterior: US$ 2,00

A capa ePub se aplica ao Faça Kapa Literário e ao Faça Kapa Polímata.

Exceção:

- Faça Kapa Cordel não gera ePub.

## Fórmula base

Largura total aberta = contracapa + lombada + capa + orelhas + sangrias.

Altura total aberta = altura do livro + sangria superior + sangria inferior.

A lombada deve usar regra configurável por:

- número de páginas
- tipo de papel
- gramatura
- fator por folha ou página
- orientação da gráfica/plataforma

## Status

Estrutura inicial criada para impedir capistas pesados e preparar cálculo físico correto.