const fs = require("fs");
const postcss = require("postcss");
const tailwind = require("@tailwindcss/postcss");
const autoprefixer = require("autoprefixer");

const input = "src/styles/tailwind.css";
const output = "public/css/tailwind.build.css";

const css = fs.readFileSync(input, "utf8");

postcss([tailwind("./tailwind.config.cjs"), autoprefixer])
  .process(css, { from: input, to: output })
  .then((result) => {
    fs.mkdirSync(require("path").dirname(output), { recursive: true });
    fs.writeFileSync(output, result.css);
    if (result.map) fs.writeFileSync(output + ".map", result.map.toString());
    console.log("Tailwind built to", output);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
