const MotorLapidar = {
  normalizeText(text = "") {
    return String(text)
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\u00A0/g, " ")
      .replace(/\t/g, "    ")
      .replace(/[ ]{2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  },

  splitBlocks(text = "") {
    return this.normalizeText(text)
      .split(/\n\s*\n/)
      .map(block =>
        block
          .split("\n")
          .map(line => line.trim())
          .filter(Boolean)
      )
      .filter(block => block.length);
  },

  countWords(text = "") {
    const clean = this.normalizeText(text);
    if (!clean) return 0;

    return clean
      .replace(/\n/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .length;
  },

  applyLightCorrections(text = "") {
    let out = this.normalizeText(text);

    out = out.replace(/\s+,/g, ",");
    out = out.replace(/\s+\./g, ".");
    out = out.replace(/\s+!/g, "!");
    out = out.replace(/\s+\?/g, "?");
    out = out.replace(/\.{4,}/g, "...");
    out = out.replace(/!!+/g, "!");
    out = out.replace(/\?\?+/g, "?");
    out = out.replace(/\bPra mim fazer\b/g, "Para eu fazer");
    out = out.replace(/\bpra mim fazer\b/g, "para eu fazer");
    out = out.replace(/\bHouveram\b/g, "Houve");
    out = out.replace(/\bhouveram\b/g, "houve");

    return out;
  },

  applyMediumCorrections(text = "") {
    let out = this.applyLightCorrections(text);

    out = out.replace(/\bA gente fomos\b/g, "A gente foi");
    out = out.replace(/\ba gente fomos\b/g, "a gente foi");
    out = out.replace(/\bmais eu\b/g, "mas eu");
    out = out.replace(/\bMais eu\b/g, "Mas eu");
    out = out.replace(/\bmais também\b/g, "mas também");
    out = out.replace(/\bMais também\b/g, "Mas também");

    return out;
  },

  isLikelyTitle(line = "") {
    const clean = String(line).trim();
    if (!clean) return false;
    if (clean.length > 90) return false;
    if (/[.!?…,:;]$/.test(clean)) return false;
    if (/^[a-záéíóúâêôãõàç]/.test(clean)) return false;
    return true;
  },

  isLikelyLowerContinuation(line = "") {
    const clean = String(line).trim();
    if (!clean) return false;
    if (!/^[a-záéíóúâêôãõàç]/.test(clean)) return false;
    if (clean.length < 2) return false;
    return true;
  },

  classify(text = "") {
    const blocks = this.splitBlocks(text);

    let poetry = 0;
    let prose = 0;
    let totalLines = 0;

    for (const block of blocks) {
      totalLines += block.length;

      const avgLen =
        block.reduce((sum, line) => sum + line.length, 0) / block.length;

      if (avgLen < 55) poetry++;
      else prose++;
    }

    let primary = "híbrido";

    if (blocks.length === 0) primary = "vazio";
    else if (poetry > 0 && prose === 0) primary = "poesia";
    else if (prose > 0 && poetry === 0) primary = "prosa";

    return {
      primary,
      blocks: blocks.length,
      totalLines
    };
  },

  detectAlerts(text = "") {
    const alerts = [];
    const blocks = this.splitBlocks(text);

    blocks.forEach((block, i) => {
      const blockNumber = i + 1;

      const avgLen =
        block.reduce((sum, line) => sum + line.length, 0) / block.length;

      if (block.length === 1 && avgLen < 20) {
        alerts.push({
          kind: "short-isolated-line",
          blockIndex: i,
          lineIndex: 0,
          title: "Linha isolada muito curta",
          message: `Bloco ${blockNumber}: verso isolado muito curto.`,
          snippet: block[0],
          suggestion: "Revisar se é título, subtítulo ou verso solto."
        });
      }

      if (block.length > 1 && avgLen > 85) {
        alerts.push({
          kind: "long-block",
          blockIndex: i,
          title: "Bloco longo com aparência de prosa",
          message: `Bloco ${blockNumber}: bloco longo com aparência de prosa.`,
          snippet: block.join("\n"),
          suggestion: "Revisar quebra entre prosa e poesia."
        });
      }

      if (block.length === 2) {
        const first = block[0];
        const second = block[1];

        if (this.isLikelyTitle(first) && this.isLikelyLowerContinuation(second)) {
          alerts.push({
            kind: "title-lowercase-follow",
            blockIndex: i,
            lineIndex: 1,
            title: "Possível quebra incorreta de título",
            message: `Bloco ${blockNumber}: título seguido de linha começando com minúscula.`,
            snippet: `${first}\n${second}`,
            suggestion: "Revisar se a segunda linha deveria subir para o título ou começar com maiúscula."
          });
        }
      }

      for (let lineIndex = 1; lineIndex < block.length; lineIndex++) {
        const prev = block[lineIndex - 1];
        const curr = block[lineIndex];

        const startsLower = /^[a-záéíóúâêôãõàç]/.test(curr);
        const prevEndsSoft = /[,;:–—-]$/.test(prev) || !/[.!?…]$/.test(prev);

        if (startsLower && prevEndsSoft) {
          alerts.push({
            kind: "join-line",
            blockIndex: i,
            lineIndex,
            title: "Possível quebra indevida",
            message: `Bloco ${blockNumber}, linha ${lineIndex + 1}: continuação começando com minúscula.`,
            snippet: `${prev}\n${curr}`,
            suggestion: "Juntar as linhas ou revisar a quebra."
          });
        }
      }

      if (block.length === 1 && this.isLikelyTitle(block[0])) {
        alerts.push({
          kind: "possible-title",
          blockIndex: i,
          lineIndex: 0,
          title: "Possível título ou subtítulo",
          message: `Bloco ${blockNumber}: linha isolada com aparência de título.`,
          snippet: block[0],
          suggestion: "Confirmar se deve ser tratado como título."
        });
      }
    });

    return alerts;
  },

  autoFixTitleLowercase(text = "") {
    const blocks = this.splitBlocks(text);

    const fixedBlocks = blocks.map(block => {
      if (block.length === 2) {
        const first = block[0];
        const second = block[1];

        if (this.isLikelyTitle(first) && this.isLikelyLowerContinuation(second)) {
          const repaired =
            second.charAt(0).toUpperCase() + second.slice(1);
          return [first, repaired];
        }
      }
      return block;
    });

    return fixedBlocks.map(block => block.join("\n")).join("\n\n");
  },

  process(text = "", options = {}) {
    const correctionLevel = options.correctionLevel || "light";
    const autoFixTitleCase = options.autoFixTitleCase || false;

    let corrected =
      correctionLevel === "medium"
        ? this.applyMediumCorrections(text)
        : this.applyLightCorrections(text);

    if (autoFixTitleCase) {
      corrected = this.autoFixTitleLowercase(corrected);
    }

    const classification = this.classify(corrected);
    const alerts = this.detectAlerts(corrected);

    return {
      originalText: this.normalizeText(text),
      processedText: corrected,
      wordCount: this.countWords(corrected),
      ...classification,
      alerts
    };
  }
};
