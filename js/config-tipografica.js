(function (global) {
  "use strict";

  const CONFIG_TIPOGRAFICA = {

    formatos: {

      A5: {
        larguraMm: 148,
        alturaMm: 210
      },

      "16x23": {
        larguraMm: 160,
        alturaMm: 230
      },

      "6x9": {
        larguraMm: 152.4,
        alturaMm: 228.6
      },

      "14x21": {
        larguraMm: 140,
        alturaMm: 210
      }

    },

    perfis: {

      polux: {

        nome: "Pólux Prosa",

        formato: "A5",

        margens: {
          internaCm: 2.5,
          externaCm: 1.5,
          superiorCm: 2.0,
          inferiorCm: 2.0,
          espelhada: true
        },

        tipografia: {
          fontSizePx: 16,
          lineHeight: 1.6,
          recuoParagrafoEm: 1.5,
          hifenizacao: true
        },

        pagina: {
          iniciarCapituloEmImpar: true,
          evitarOrfa: true,
          evitarViuva: true
        },

        render: {
          mostrarCabecalho: true,
          mostrarRodape: true,
          capitular: false,
          ornamentoSimples: false
        }

      },

      castor: {

        nome: "Castor Poesia",

        formato: "A5",

        margens: {
          internaCm: 2.2,
          externaCm: 1.8,
          superiorCm: 2.0,
          inferiorCm: 2.0,
          espelhada: true
        },

        tipografia: {
          fontSizePx: 17,
          lineHeight: 1.75,
          recuoParagrafoEm: 0,
          hifenizacao: false
        },

        pagina: {
          iniciarCapituloEmImpar: true,
          evitarOrfa: true,
          evitarViuva: true
        },

        render: {
          mostrarCabecalho: false,
          mostrarRodape: true,
          capitular: false,
          ornamentoSimples: false
        }

      },

      centauro: {

        nome: "Centauro Híbrido",

        formato: "A5",

        margens: {
          internaCm: 2.5,
          externaCm: 1.5,
          superiorCm: 2.0,
          inferiorCm: 2.0,
          espelhada: true
        },

        tipografia: {
          fontSizePx: 16,
          lineHeight: 1.65,
          recuoParagrafoEm: 1.5,
          hifenizacao: "seletiva"
        },

        pagina: {
          iniciarCapituloEmImpar: true,
          evitarOrfa: true,
          evitarViuva: true
        },

        render: {
          mostrarCabecalho: true,
          mostrarRodape: true,
          capitular: false,
          ornamentoSimples: false
        }

      },

      quironxada: {

        nome: "Qui(RON)xadá Cordel",

        formato: "A5",

        margens: {
          internaCm: 2.0,
          externaCm: 1.5,
          superiorCm: 2.0,
          inferiorCm: 2.0,
          espelhada: true
        },

        tipografia: {
          fontSizePx: 16,
          lineHeight: 1.7,
          recuoParagrafoEm: 0,
          hifenizacao: false
        },

        pagina: {
          iniciarCapituloEmImpar: true,
          evitarOrfa: true,
          evitarViuva: true
        },

        cordel: {
          versosPorEstrofe: 6
        },

        render: {
          mostrarCabecalho: false,
          mostrarRodape: true,
          capitular: false,
          ornamentoSimples: true
        }

      }

    },

    obterPerfil(nomePerfil) {

      return JSON.parse(
        JSON.stringify(
          this.perfis[nomePerfil] || this.perfis.polux
        )
      );

    },

    obterFormato(nomeFormato) {

      return JSON.parse(
        JSON.stringify(
          this.formatos[nomeFormato] || this.formatos.A5
        )
      );

    }

  };

  global.CONFIG_TIPOGRAFICA = CONFIG_TIPOGRAFICA;

})(window);
