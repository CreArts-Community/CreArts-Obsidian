// ╔════════════════════════════════════════════════════════════════════════════════════════════════════════[─]═[□]═[×]═╗
// ║ CreArts Script                                                                                                     ║
// ╠══════════════════════════╦═════════════════════════════════════════════════════════════════════════════════════════╣
// ║ Name:                    ║ SVGO Config                                                                             ║
// ║ Version:                 ║ 1.0.0                                                                                   ║
// ║ Author:                  ║ AI                                                                                      ║
// ║ License:                 ║ MIT                                                                                     ║
// ╚══════════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════╝

/**
 * SVGO-Konfiguration für Icons, die als CSS-Mask genutzt werden
 * (background: ...; -webkit-mask: var(--icon) ...; mask: var(--icon) ...;).
 *
 * Farbe kommt immer aus CSS, nie aus dem SVG selbst -> fill/stroke/style
 * können komplett raus. Die Größe kommt immer vom Container -> width/height
 * sind ebenfalls tot, viewBox allein reicht.
 */

// Viele Export-Tools (Figma, Illustrator) hängen einen <clipPath> an, der
// exakt dem viewBox entspricht. Das ist ein No-Op, wenn das SVG als Mask/
// Image-Source genutzt wird, weil das Root-<svg> eh schon auf den viewBox
// clippt. Wird erkannt und entfernt -- inkl. Log, damit man's nachprüfen kann.
const stripRedundantViewboxClip = {
  name: "stripRedundantViewboxClip",
  fn: (root) => {
    let viewBox = null;

    const parseRectLike = (node) => {
      if (node.name === "rect") {
        const x = parseFloat(node.attributes.x || "0");
        const y = parseFloat(node.attributes.y || "0");
        const w = parseFloat(node.attributes.width);
        const h = parseFloat(node.attributes.height);
        if (![x, y, w, h].some(Number.isNaN)) return { x, y, w, h };
      }
      if (node.name === "path" && node.attributes.d) {
        const m = node.attributes.d.match(
          /^M\s*([\d.-]+)[ ,]([\d.-]+)\s*[Hh]\s*([\d.-]+)\s*[Vv]\s*([\d.-]+)\s*[Hh]\s*([\d.-]+)\s*[Zz]?$/,
        );
        if (m) {
          const x = parseFloat(m[1]);
          const y = parseFloat(m[2]);
          return { x, y, w: parseFloat(m[3]) - x, h: parseFloat(m[4]) - y };
        }
      }
      return null;
    };

    return {
      element: {
        enter: (node) => {
          if (node.name === "svg" && node.attributes.viewBox) {
            const [x, y, w, h] = node.attributes.viewBox.trim().split(/\s+/).map(Number);
            viewBox = { x, y, w, h };
          }
        },
        exit: (node, parentNode) => {
          if (node.name !== "clipPath" || !viewBox || node.children.length !== 1) return;
          const rect = parseRectLike(node.children[0]);
          if (!rect) return;
          const matches =
            Math.abs(rect.x - viewBox.x) < 0.01 &&
            Math.abs(rect.y - viewBox.y) < 0.01 &&
            Math.abs(rect.w - viewBox.w) < 0.01 &&
            Math.abs(rect.h - viewBox.h) < 0.01;
          if (!matches) return;

          const clipId = node.attributes.id;
          if (!clipId) return;

          parentNode.children = parentNode.children.filter((c) => c !== node);

          const walk = (n) => {
            if (n.attributes && n.attributes["clip-path"] === `url(#${clipId})`) {
              delete n.attributes["clip-path"];
            }
            (n.children || []).forEach(walk);
          };
          walk(root);
        },
      },
    };
  },
};

module.exports = {
  config: {
    multipass: true,
    plugins: [
      "preset-default",
      "removeDimensions",
      { name: "removeAttrs", params: { attrs: ["fill", "stroke", "style"] } },
      stripRedundantViewboxClip,
    ],
  },
};
