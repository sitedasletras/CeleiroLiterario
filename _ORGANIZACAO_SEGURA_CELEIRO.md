# Organização Segura — Celeiro Literário

Este arquivo registra a organização segura do repositório **CeleiroLiterario** sem quebrar arquivos que já estão funcionando.

## Regra principal

Arquivos bons e sensíveis não devem ser movidos diretamente sem uma etapa de espelho/validação.

Neste momento, ficam tratados como **congelados operacionalmente**:

- `modulo_quironxada.html` — Qui(RON)xadá / diagramador de cordel.
- `faca_kapa_cordel.html` — Faça Kapa Cordel.

## Estratégia segura

1. Manter os arquivos originais no lugar atual.
2. Criar pastas organizadoras em `/modulos/` apenas como mapa seguro.
3. Quando uma versão espelhada for testada e aprovada, aí sim poderá virar caminho principal.
4. Nunca apagar nem mover arquivo funcional antes de existir cópia validada.

## Estrutura pretendida

```text
CeleiroLiterario/
├── index.html
├── lapidar.html
├── dias_gramador_livros.html
├── modulo_quironxada.html          # congelado por enquanto
├── faca_kapa_cordel.html           # congelado por enquanto
├── okapista.html
├── barracao_polimento_imagens.html
├── desbaste_textual_leve.html
├── motor_detectar_tipo_obra.html
├── js/
│   ├── motor-tipografico.js
│   └── config-tipografica.js
├── modulos/
│   ├── README.md
│   ├── quironxada/
│   │   └── README.md
│   └── faca-kapa-cordel/
│       └── README.md
└── _ORGANIZACAO_SEGURA_CELEIRO.md
```

## Regra para próximas correções HTML

Sempre que houver acesso seguro ao repositório, as correções devem ser feitas diretamente no arquivo correspondente.

Quando o usuário precisar copiar manualmente, entregar sempre HTML completa para substituição integral, nunca remendo solto.

## Observação

Esta organização é não destrutiva. Ela não altera o funcionamento atual do Qui(RON)xadá nem do Faça Kapa Cordel.