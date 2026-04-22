(function (global) {
  "use strict";

  const MotorLapidar = {
    version: "1.0.0",

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

    splitParagraphs(text = "") {
      return this.normalizeText(text)
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
    },

    countWords(text = "") {
      const clean = this.normalizeText(text);
      if (!clean) return 0;
      return clean.replace(/\n/g, " ").split(/\s+/).filter(Boolean).length;
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
      out = out.replace(/ ,/g, ",");
      out = out.replace(/ ;/g, ";");
      out = out.replace(/ :/g, ":");
      out = out.replace(/ \)/g, ")");
      out = out.replace(/\( /g, "(");

      out = out.replace(/\bHouveram\b/g, "Houve");
      out = out.replace(/\bhouveram\b/g, "houve");
      out = out.replace(/\bPra mim fazer\b/g, "Para eu fazer");
      out = out.replace(/\bpra mim fazer\b/g, "para eu fazer");
      out = out.replace(/\bA gente fomos\b/g, "A gente foi");
      out = out.replace(/\ba gente fomos\b/g, "a gente foi");
      out = out.replace(/\bA nível de\b/g, "Em nível de");
      out = out.replace(/\ba nível de\b/g, "em nível de");
      out = out.replace(/\bmais eu\b/g, "mas eu");
      out = out.replace(/\bMais eu\b/g, "Mas eu");
      out = out.replace(/\bmais também\b/g, "mas também");
      out = out.replace(/\bMais também\b/g, "Mas também");

      return out;
    },

    hyphenateWordPT(word, level = "light") {
      if (word.length < 7) return word;
      if (/^\d+$/.test(word)) return word;

      const vowels = "aeiouáéíóúâêôãõàüAEIOUÁÉÍÓÚÂÊÔÃÕÀÜ";
      const points = [];

      for (let i = 2; i < word.length - 2; i++) {
        const a = word[i - 1];
        const b = word[i];
        const prev = word[i - 2];
        const next = word[i + 1];

        const aV = vowels.includes(a);
        const bV = vowels.includes(b);
        const prevV = vowels.includes(prev);
        const nextV = vowels.includes(next);

        if (aV && !bV && nextV) {
          points.push(i);
        } else if (prevV && !aV && !bV && nextV) {
          points.push(i);
        } else if (!aV && bV && !nextV && i < word.length - 3) {
          points.push(i + 1);
        }
      }

      const unique = [...new Set(points)].filter((p) => p > 2 && p < word.length - 2);
      if (!unique.length) return word;

      const chosen =
        level === "light"
          ? unique.filter((_, idx) => idx % 2 === 0)
          : unique;

      let out = "";
      for (let i = 0; i < word.length; i++) {
        out += word[i];
        if (chosen.includes(i + 1)) out += "\u00AD";
      }
      return out;
    },

    hyphenateText(text = "", level = "light") {
      let count = 0;

      const result = String(text).replace(/[A-Za-zÀ-ÿ-]{7,}/g, (word) => {
        const hyphenated = this.hyphenateWordPT(word, level);
        if (hyphenated !== word) count += 1;
        return hyphenated;
      });

      return { text: result, count };
    },

    detectChapter(line = "") {
      return /^cap[ií]tulo\s+\d+/i.test(line.trim());
    },

    detectShortSubtitle(line = "") {
      const clean = line.trim();
      if (!clean) return false;
      if (clean.length > 90) return false;
      if (/[.!?…:]$/.test(clean)) return false;
      if (this.detectChapter(clean)) return false;
      return true;
    },

    detectTechnicalTitle(line = "") {
      const clean = line.trim();
      if (!clean) return false;
      if (clean.length > 60) return false;
      if (/^cap[ií]tulo/i.test(clean)) return false;
      if (/[.!?]$/.test(clean)) return false;
      if (!/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(clean)) return false;
      return true;
    },

    isLikelyPoetryLine(line = "") {
      const clean = line.trim();
      if (!clean) return false;
      if (clean.length > 70) return false;
      return true;
    },

    detectStanzas(text = "") {
      const blocks = this.normalizeText(text)
        .split(/\n\s*\n/)
        .map((b) =>
          b
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean)
        )
        .filter((arr) => arr.length);

      return blocks;
    },

    detectCordelSextilhas(text = "") {
      const stanzas = this.detectStanzas(text);
      let sextilhas = 0;

      for (const stanza of stanzas) {
        if (stanza.length === 6) sextilhas += 1;
      }

      return {
        totalStanzas: stanzas.length,
        sextilhas,
        allSextilhas: stanzas.length > 0 && sextilhas === stanzas.length
      };
    },

    classifyStructure(text = "") {
      const clean = this.normalizeText(text);
      const paragraphs = this.splitParagraphs(clean);
      const stanzas = this.detectStanzas(clean);
      const cordel = this.detectCordelSextilhas(clean);

      let chapterCount = 0;
      let technicalTitleCount = 0;
      let shortLineBlocks = 0;
      let proseLikeBlocks = 0;

      for (const block of stanzas) {
        if (block.length === 1) {
          if (this.detectChapter(block[0])) chapterCount += 1;
          if (this.detectTechnicalTitle(block[0])) technicalTitleCount += 1;
        }

        const avgLen =
          block.reduce((sum, line) => sum + line.length, 0) / block.length;

        if (avgLen <= 42) shortLineBlocks += 1;
        else proseLikeBlocks += 1;
      }

      let primary = "prosa";
      let secondary = null;
      let tertiary = null;

      if (cordel.allSextilhas) {
        primary = "cordel";
        secondary = "poesia";
      } else if (shortLineBlocks > proseLikeBlocks && stanzas.length >= 3) {
        primary = "poesia";
      } else if (shortLineBlocks > 0 && proseLikeBlocks > 0) {
        primary = "híbrido";
        secondary = "prosa/poesia";
      }

      if (chapterCount > 0) {
        tertiary = "capitulado";
      } else if (technicalTitleCount > 0) {
        tertiary = "técnico";
      }

      return {
        primary,
        secondary,
        tertiary,
        chapterCount,
        technicalTitleCount,
        stanzaCount: stanzas.length,
        paragraphCount: paragraphs.length,
        cordel
      };
    },

    detectIssues(text = "") {
      const issues = [];
      const paragraphs = this.splitParagraphs(text);

      paragraphs.forEach((p, idx) => {
        if (/\b(\w+)\s+\1\b/i.test(p)) {
          issues.push({
            kind: "repeat-word",
            paragraphIndex: idx,
            title: "Palavra repetida",
            snippet: p.match(/\b(\w+)\s+\1\b/i)[0]
          });
        }

        if (/[ ]{2,}/.test(p)) {
          issues.push({
            kind: "double-space",
            paragraphIndex: idx,
            title: "Espaço duplo",
            snippet: p
          });
        }

        const lines = p.split("\n").map((v) => v.trim()).filter(Boolean);
        if (lines.length > 1) {
          for (let i = 1; i < lines.length; i++) {
            const prev = lines[i - 1];
            const curr = lines[i];
            const startsLower = /^[a-záéíóúâêôãõàç]/.test(curr);
            const prevEndsSoft = /[,;:–—-]$/.test(prev) || !/[.!?…]$/.test(prev);

            if (startsLower && prevEndsSoft) {
              issues.push({
                kind: "join-line",
                paragraphIndex: idx,
                lineIndex: i,
                title: "Possível quebra indevida",
                snippet: prev + "\n" + curr
              });
            }
          }
        }

        if (this.detectTechnicalTitle(p)) {
          issues.push({
            kind: "possible-title3",
            paragraphIndex: idx,
            title: "Possível Título 3",
            snippet: p
          });
        }
      });

      return issues;
    },

    detectWidowOrphanWarnings(text = "", mode = "off") {
      if (mode === "off") return [];

      const warnings = [];
      const paragraphs = this.splitParagraphs(text);

      paragraphs.forEach((p, idx) => {
        const words = p.replace(/\n/g, " ").split(/\s+/).filter(Boolean);

        if (words.length >= 10) {
          const lastWords = words.slice(-1).join(" ");
          if (lastWords.length <= 3) {
            warnings.push(`Parágrafo ${idx + 1}: fechamento fraco na última linha.`);
          }
        }

        if (mode === "tight" && words.length > 22) {
          warnings.push(`Parágrafo ${idx + 1}: revisar possível viúva/órfã na diagramação.`);
        }
      });

      return warnings;
    },

    detectTextKinds(text = "") {
      const clean = this.normalizeText(text);
      const paragraphs = this.splitParagraphs(clean);
      const stanzas = this.detectStanzas(clean);

      const result = {
        hasChapters: false,
        hasTechnicalTitles: false,
        hasPoetrySignals: false,
        hasCordelSignals: false,
        hasHybridSignals: false
      };

      for (const p of paragraphs) {
        if (this.detectChapter(p)) result.hasChapters = true;
        if (this.detectTechnicalTitle(p)) result.hasTechnicalTitles = true;
      }

      if (stanzas.length >= 3) {
        let shortBlocks = 0;
        let sextilhas = 0;

        for (const block of stanzas) {
          const avgLen =
            block.reduce((sum, line) => sum + line.length, 0) / block.length;

          if (avgLen <= 42) shortBlocks += 1;
          if (block.length === 6) sextilhas += 1;
        }

        if (shortBlocks > 0) result.hasPoetrySignals = true;
        if (sextilhas > 0) result.hasCordelSignals = true;
        if (shortBlocks > 0 && paragraphs.length > shortBlocks) result.hasHybridSignals = true;
      }

      return result;
    },

    process(text = "", options = {}) {
      const settings = {
        correctionLevel: options.correctionLevel || "light",
        hyphenationMode: options.hyphenationMode || "off",
        widowOrphanMode: options.widowOrphanMode || "off"
      };

      const original = this.normalizeText(text);
      let corrected = original;

      if (settings.correctionLevel === "medium") {
        corrected = this.applyMediumCorrections(corrected);
      } else {
        corrected = this.applyLightCorrections(corrected);
      }

      let hyphenatedCount = 0;
      if (settings.hyphenationMode !== "off") {
        const hyp = this.hyphenateText(
          corrected,
          settings.hyphenationMode === "medium" ? "medium" : "light"
        );
        corrected = hyp.text;
        hyphenatedCount = hyp.count;
      }

      const paragraphs = this.splitParagraphs(corrected);
      const issues = this.detectIssues(corrected);
      const widowOrphanWarnings = this.detectWidowOrphanWarnings(
        corrected,
        settings.widowOrphanMode
      );
      const structure = this.classifyStructure(corrected);
      const textKinds = this.detectTextKinds(corrected);

      return {
        originalText: original,
        processedText: corrected,
        paragraphs,
        wordCount: this.countWords(corrected),
        paragraphCount: paragraphs.length,
        hyphenatedCount,
        issues,
        widowOrphanWarnings,
        structure,
        textKinds,
        settings
      };
    }
  };

  global.MotorLapidar = MotorLapidar;
})(window);
