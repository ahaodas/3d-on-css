function print() {
  for (let key in W) {
    const out = window[key];
    if (out) {
      window[key].dataset.d = W[key];
    }
  }
  if (window.performance.memory) {
    tm.dataset.d = window.performance.memory.totalJSHeapSize / 1024;
    am.dataset.d = window.performance.memory.usedJSHeapSize / 1024;
  }
}

let W = { x: 0, y: 100, z: 100, rx: 0, rz: 0, ry: 0, s: 0 };

const offset = 0;

function changeWorld({ x, y, z, rx, rz, ry, s }) {
  world.style.transform = `translateY(${y}px) translateX(${x}px) translateZ(${-z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotate(${rz}deg)`;
  world.style.transformOrigin = `calc(50vw - ${
    x > 0 ? x + offset : x - offset
  }px) calc(50vw - ${y > 0 ? y + offset : y - offset}px) ${
    z > 0 ? z + offset : z - offset
  }px`;
}

const rad = (deg) => (deg * Math.PI) / 180;

class Control {
  static w = (w) => Control.move({ ...w, s: 10 });
  static s = (w) => Control.move({ ...w, s: -10 });
  static ArrowUp = (w) => ({ ...w, rx: (w.rx -= 1) % 360 });
  static ArrowDown = (w) => ({ ...w, rx: (w.rx += 1) % 360 });
  static ArrowLeft = (w) => ({ ...w, rz: (w.rz += 1) % 360 });
  static ArrowRight = (w) => ({ ...w, rz: (w.rz -= 1) % 360 });
  static move = (w) => {
    const zFilter = Math.cos(rad(w.rx));
    let y = w.y + zFilter * w.s * Math.cos(rad(w.rz));
    let x = w.x + zFilter * w.s * Math.sin(rad(w.rz));
    let z = w.z + w.s * Math.sin(rad(w.rx));
    y = +y.toFixed(3);
    x = +x.toFixed(3);
    z = +z.toFixed(3);
    return { ...w, x, y, z };
  };
}

let ListenMouse = false;
let Run = false;

window.addEventListener("keydown", (e) => !Run && animation(true, e));
window.addEventListener("keyup", (e) => (Run = false));
window.addEventListener(
  "mousemove",
  (e) => (e.movementX || e.movementY) && rotateCam(e.movementX, e.movementY)
);
window.addEventListener("click", () => (ListenMouse = !ListenMouse));

function rotateCam(deltaZ = 0, deltaX = 0, invertZ = -1, invertX = -1) {
  print();
  ListenMouse &&
    changeWorld({
      ...W,
      rx: (W.rx += deltaX * invertX) % 360,
      rz: (W.rz += (deltaZ * invertZ) % 360),
    });
}

function animation(run, e) {
  print();
  let { key } = e;
  Run = run;
  let control = Control[key];

  //.map(axis => W[axis] > frameCopacity && W[axis] = 0)

  if (control) {
    const next = control(W);

    // Array.from(['x', 'y', 'z']).forEach(axis => {
    //   if(next[axis] > frameCopacity || next[axis] < -frameCopacity ){
    //     next[axis] = 0
    //     console.log(axis, next[axis])
    //   }
    // })
    W = next;
  }

  changeWorld(W);

  if (Run) {
    requestAnimationFrame(() => animation(Run, e), 16);
  }
}

const figureStyle = ({ x, y, z, dx, dy }) => ({
  height: `${dx}vw`,
  width: `${dy}vw`,
  bottom: `${y}vw`,
  left: `${x}vw`,
  transform: `translateZ(${z}vw)`,
});

const injectFigure = (figure) => {
  let wrapper = document.createElement("div");
  wrapper.className = "figure";
  const style = figureStyle(figure);
  for (rule in style) {
    wrapper.style[rule] = style[rule];
  }
  for (let i = 0; i < 5; i++) {
    let side = document.createElement("div");
    wrapper.appendChild(side);
    if (i === 4) side.style.transform = `translateZ(${figure.dy}vw)`;
  }
  world.appendChild(wrapper);
};

injectFigure({ x: 0, y: 10, z: 103, dx: 10, dy: 10 });
injectFigure({ x: 20, y: 20, z: 120, dx: 15, dy: 15 });
injectFigure({ x: 30, y: 30, z: 130, dx: 30, dy: 30 });
