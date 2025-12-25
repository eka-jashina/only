import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import VitePluginSvgSpritemap from "@spiriit/vite-plugin-svg-spritemap";
import { resolve } from "path";
import handlebars from "vite-plugin-handlebars";
import Handlebars from "handlebars";

import largestCompanies from "./source/data/standart-projects/largest-companies.json";
import developers from "./source/data/standart-projects/developers.json";
import b2c from "./source/data/standart-projects/b2c.json";
import clients from "./source/data/clients.json";
import largeProjects from "./source/data/large-projects.json";
import banners from "./source/data/banners.json";
import prizes from "./source/data/prizes.json";
import awards from "./source/data/awards.json";

/** @type {import('vite').UserConfig} */
export default {
  plugins: [
    // SVG спрайт
    VitePluginSvgSpritemap("source/img/sprite/*.svg", {
      styles: false,
      injectSVGOnDev: true,
      output: "sprite.svg",
    }),

    // Оптимизация изображений
    ViteImageOptimizer({
      test: /\.(jpe?g|png|svg)$/i,
      includePublic: false,
      logStats: true,
      ansiColors: true,
      exclude: [/sprite\.svg$/],
      svg: {
        multipass: true,
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                cleanupNumericValues: false,
                convertPathData: {
                  floatPrecision: 2,
                  forceAbsolutePath: false,
                  utilizeAbsolute: false,
                },
                removeViewBox: false,
                cleanupIds: false,
              },
            },
          },
          "removeDimensions",
        ],
      },
      png: { quality: 80, palette: true },
      jpeg: { quality: 80, progressive: true },
      jpg: { quality: 80, progressive: true },
      cache: true,
      cacheLocation: "./.cache",
    }),

    // Handlebars + хелперы
    handlebars({
      partialDirectory: resolve(__dirname, "source/partials"),
      extensions: ["hbs", "html"],
      reloadOnPartialChange: true,
      compileOptions: { preventIndent: true },
      context: {
        largestCompanies,
        developers,
        b2c,
        clients,
        largeProjects,
        banners,
        prizes,
        awards
      },
      helpers: {
        sprite(name) {
          const isDev = process.env.NODE_ENV === "development";
          return isDev
            ? `__spritemap#sprite-${name}`
            : `./assets/sprite.svg#sprite-${name}`;
        },

        decorateTitle(title, options) {
          const decorations = options.hash.decorations || [];
          const words = title.split(/\s+/);

          // ---------------------------------------------------------
          // Вспомогательные функции
          // ---------------------------------------------------------

          // Иконка
          const mode = options.hash.iconSet || "banner";

          const renderIcon = (icon) => {
            if (!icon) return "";

            const { name, width, height, highlight } = icon;
            const classes = ["word-decor__icon"];
            if (highlight) classes.push("word-decor__highlight");

            // SVG
            if (mode === "awards") {
              return `
                <span class="${classes.join(" ")}">
                  <span class="scale-img" style="--img-w: ${width}; --img-h: ${height};">
                    <img
                      src="img/content/awards-icons/${name}.svg"
                      width="${width}"
                      height="${height}"
                      alt="Логотип премии"
                      aria-hidden="true"
                      loading="lazy"
                    >
                  </span>
                </span>
              `;
            }

            // PNG/WebP
            return `
              <span class="${classes.join(" ")}">
                <span class="scale-img" style="--img-w: ${width}; --img-h: ${height};">
                  <picture>
                    <source
                      type="image/webp"
                      width="${width}"
                      height="${height}"
                      srcset="img/decor/banner-icons/${name}.webp 1x, img/decor/banner-icons/${name}@2x.webp 2x"
                    >
                    <img
                      src="img/decor/banner-icons/${name}.png"
                      srcset="img/decor/banner-icons/${name}@2x.png"
                      width="${width}"
                      height="${height}"
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                    >
                  </picture>
                </span>
            </span>
            `;
          };

          // Группа слов
          const renderGroup = (groupRule, groupWords) => {
            const classes = ["word-decor", "word-decor--group"];

            const before = renderIcon(groupRule.iconBefore);
            const after = renderIcon(groupRule.iconAfter);
            const chunk = groupWords
              .map((w) => `<span class="word">${w}</span>`)
              .join(" ");

            const wordsClasses = ["word-decor__words"];
            if (groupRule.highlight) wordsClasses.push("word-decor__highlight");

            return `
              <span class="${classes.join(" ")}">
                ${before}
                <span class="${wordsClasses.join(" ")}">${chunk}</span>
                ${after}
              </span>
            `;
          };

          // Одиночное слово
          const renderSingleWord = (word, rule) => {
            const classes = ["word-decor__word"];
            let before = "";
            let after = "";

            if (rule) {
              if (rule.highlight) classes.push("word-decor__highlight");
              if (rule.iconBefore) before = renderIcon(rule.iconBefore);
              if (rule.iconAfter) after = renderIcon(rule.iconAfter);
            }

            return `
              <span class="${classes.join(" ")}">
                ${before}
                <span class="word-decor__text">${word}</span>
                ${after}
              </span>
            `;
          };

          // ---------------------------------------------------------
          // Сбор групп
          // ---------------------------------------------------------
          const groups = decorations
            .filter((d) => Array.isArray(d.group))
            .map((d) => {
              const groupWords = d.group;
              const len = groupWords.length;

              const startIndex = words.findIndex((w, idx) => {
                return groupWords.every((gw, i) => words[idx + i] === gw);
              });

              if (startIndex === -1) return null;

              return {
                rule: d,
                start: startIndex,
                end: startIndex + len - 1,
              };
            })
            .filter(Boolean);

          // ---------------------------------------------------------
          // Рендер всех слов по порядку
          // ---------------------------------------------------------
          let html = "";
          let i = 0;

          while (i < words.length) {
            const group = groups.find((g) => g.start === i);

            if (group) {
              const chunk = words.slice(group.start, group.end + 1);
              html += renderGroup(group.rule, chunk);
              i = group.end + 1;
              continue;
            }

            const rule = decorations.find((d) => d.word === words[i]);
            html += renderSingleWord(words[i], rule);
            i++;
          }

          return new Handlebars.SafeString(html);
        },
      },
    }),
  ],

  esbuild: { exclude: [".//*.hbs"] },
  css: { devSourcemap: true },
  publicDir: "public",
  root: "./source",
  build: { outDir: "../dist" },
  base: "./",
  server: { port: 3000 },
  optimizeDeps: { exclude: ["*.hbs"] },
};
