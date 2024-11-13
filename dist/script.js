import { SVG } from "https://cdn.skypack.dev/@svgdotjs/svg.js";
import SimplexNoise from "https://cdn.skypack.dev/simplex-noise@2.4.0";
import { map } from "https://cdn.skypack.dev/@georgedoescode/generative-utils@1.0.38";
import debounce from "https://cdn.skypack.dev/debounce@1.2.1";
import copy from "https://cdn.skypack.dev/copy-to-clipboard@3.3.1";

const simplex = new SimplexNoise();

const width = 200;
const height = 200;

let res = 10;

let cols = width / res;
let rows = height / res;

const svg = SVG(".generator__canvas");

let mode = "LINES";
let color = "#1a1a1a";

let noiseInc = 0.05;

function generate() {
  svg.clear();

  let xOff = Math.random() * 1000;

  for (let i = 0; i < cols; i++) {
    let yOff = 0;

    xOff += noiseInc;
    for (let j = 0; j < rows; j++) {
      const noise = simplex.noise2D(xOff, yOff);
      const scale = map(noise, -1, 1, 0.125, 0.75);
      const rotate = map(noise, -1, 1, 0, 360);

      if (mode === "LINES") {
        svg
          .line(i * res, j * res, i * res + res, j * res + res)
          .scale(0.25)
          .stroke({
            color: color,
            width: 4,
            linecap: "round"
          })
          .rotate(rotate);
      } else {
        svg
          .circle(res)
          .x(i * res)
          .y(j * res)

          .fill(color)
          .scale(scale);
      }

      yOff += noiseInc;
    }
  }
}

generate();

document.querySelector(".generate").addEventListener("click", () => {
  generate();
});

document.querySelector("#cellSizeSlider").addEventListener("input", (e) => {
  const val = parseInt(e.target.value);
  const options = [10, 20, 25, 40];

  res = options[val];
  cols = width / res;
  rows = height / res;

  console.log(res);

  generate();
});

document.querySelector("#variance").addEventListener(
  "input",
  debounce((e) => {
    const val = parseFloat(e.target.value);
    noiseInc = map(val, 0, 1, 0.025, 0.075);
    generate();
  }, 10)
);

document.querySelector("#modeSwitch").addEventListener("click", (e) => {
  if (e.target.getAttribute("aria-pressed") === "false") {
    mode = "DOTS";
  } else {
    mode = "LINES";
  }
  generate();
});

document.querySelector("#color").addEventListener(
  "input",
  debounce((e) => {
    color = e.target.value;

    svg.node.querySelectorAll("*").forEach((el) => {
      console.log(el);
      if (mode === "DOTS") {
        el.setAttribute("fill", color);
      } else {
        el.setAttribute("stroke", color);
      }
    });
  }, 10)
);

document.querySelectorAll(".switch-btn").forEach((el) => {
  el.addEventListener("click", (e) => {
    const pressed = e.target.getAttribute("aria-pressed") === "true";
    e.target.setAttribute("aria-pressed", String(!pressed));
  });
});

document.querySelector(".clipboard").addEventListener("click", (e) => {
  copy(svg.node.outerHTML);

  e.target.innerHTML = "Copied to Clipboard!";

  setTimeout(() => {
    e.target.innerHTML = "Copy SVG";
  }, 1500);
});