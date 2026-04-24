# Hércules — Diagramador Estrutural Leve

Hércules é o quinto diagramador do Celeiro Literário.

## Função

Diagramar obras fora do eixo literário tradicional e cordel, incluindo:

- livros técnicos
- apostilas
- manuais
- livros institucionais
- livros infantis
- livros juvenis
- livros infanto-juvenis
- livros de receitas
- livros de fotografia
- catálogos visuais
- materiais pedagógicos

## Regra principal

Hércules deve permanecer leve.

Nada de concentrar motores pesados dentro da HTML principal.

## Arquitetura

A HTML principal deve funcionar como casca visual e operacional.

Sempre que possível, buscar fora:

- motor tipográfico compartilhado
- configuração tipográfica compartilhada
- motor de detecção de tipo de obra
- desbaste textual leve
- Barracão de Polimento das Imagens para livros visuais, fotografia, receitas e infantis ilustrados

## Integrações previstas

- `../../js/motor-tipografico.js`
- `../../js/config-tipografica.js`
- `../../desbaste_textual_leve.html`
- `../../motor_detectar_tipo_obra.html`
- `../../barracao_polimento_imagens.html`

## Modos internos

- Técnico
- Didático
- Infantil
- Juvenil
- Infanto-juvenil
- Receita
- Fotografia
- Institucional

## Proteção de desempenho

O Hércules deve evitar travamento do sistema.

Regras:

1. Processar texto em camadas simples.
2. Não carregar imagens pesadas dentro do módulo se puder enviar ao Barracão.
3. Não duplicar motores já existentes.
4. Não fazer tudo ao mesmo tempo.
5. Priorizar prévia leve.
6. Permitir expansão futura por conectores externos.

## Status

Estrutura inicial criada de forma segura e não destrutiva.