import "./style.css";

const APP_NAME = "Noted";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

const title = document.createElement("h1");
title.textContent = APP_NAME;
app.appendChild(title);

const canvas = document.createElement("canvas");
canvas.height = 256;
canvas.width = 256;
app.appendChild(canvas);

const draw = canvas.getContext("2d")!;
draw.strokeStyle = "white";

const stickers: string[] = ["💀", "👻", "👹"];
let size = 1.5;
let currDrawing = false;
let currEmoji: string | undefined;

// This will show the user a preview of the marker they are going to use
class Preview {
  x: number;
  y: number;
  thickness?: number;
  emoji?: string;

  constructor(x: number, y: number, thickness?: number, emoji?: string) {
    this.x = x;
    this.y = y;
    this.thickness = thickness;
    this.emoji = emoji;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.thickness) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.thickness, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.lineWidth = 1;
      ctx.fill();
      ctx.stroke();
    }
    if (this.emoji) {
      ctx.fillText(this.emoji, this.x, this.y);
    }
  }
}

// Emojis will let the user draw emojis on the canvas
class Emojis {
  emoji: string;
  coordinates: number[][];
  spacing: number;

  constructor(emoji: string, x: number, y: number, spacing: number) {
    this.emoji = emoji;
    this.coordinates = [[x, y]];
    this.spacing = spacing;
  }

  addPosition(x: number, y: number) {
    this.coordinates.push([x, y]);
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.coordinates.forEach(([x, y]) => {
      ctx.fillText(this.emoji, x, y);
    });
  }
}

// Squiggles will track where the user has drawn on the canvas and display a line for each stroke
class Squiggles {
  coordinates: number[][];
  thickness: number;

  constructor(x: number, y: number, thickness: number) {
    this.coordinates = [[x, y]];
    this.thickness = thickness;
  }

  drag(x: number, y: number) {
    this.coordinates.push([x, y]);
  }

  display(ctx: CanvasRenderingContext2D) {
    if (this.coordinates.length < 2) {
      return;
    }
    ctx.beginPath();
    ctx.lineWidth = this.thickness;
    ctx.moveTo(this.coordinates[0][0], this.coordinates[0][1]);

    for (let i = 1; i < this.coordinates.length; i++) {
      const [x, y] = this.coordinates[i];
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

let redo: (Squiggles | Emojis)[] = [];
let curr: Squiggles | Emojis | undefined;
const drawingArr: (Squiggles | Emojis)[] = [];
let prev: Preview | undefined;
const spacing = 10;
let temp: { x: number; y: number } | undefined;

// These event listeners will watch for the users mouse movements and draw on the canvas
canvas.addEventListener("mousedown", (pos) => {
  currDrawing = true;
  if (currEmoji) {
    curr = new Emojis(currEmoji, pos.offsetX, pos.offsetY, spacing);
    drawingArr.push(curr);
  } else {
    curr = new Squiggles(pos.offsetX, pos.offsetY, size);
    drawingArr.push(curr);
  }
});

canvas.addEventListener("mousemove", (pos) => {
  if (curr && currDrawing) {
    if (curr instanceof Squiggles) {
      curr.drag(pos.offsetX, pos.offsetY);
      prev = new Preview(pos.offsetX, pos.offsetY, size);
    } else if (curr instanceof Emojis) {
      const currPos = { x: pos.offsetX, y: pos.offsetY };
      if (
        !temp ||
        Math.abs(currPos.x - temp.x) > spacing ||
        Math.abs(currPos.y - temp.y) > spacing
      ) {
        curr.addPosition(pos.offsetX, pos.offsetY);
        temp = currPos;
      }
      prev = new Preview(pos.offsetX, pos.offsetY, undefined, curr.emoji);
    }
  } else {
    if (currEmoji) {
      prev = new Preview(pos.offsetX, pos.offsetY, undefined, currEmoji);
    } else {
      prev = new Preview(pos.offsetX, pos.offsetY, size);
    }
  }
  drawingChanged();
});

canvas.addEventListener("mouseup", () => {
  if (curr && currDrawing) {
    currDrawing = false;
    curr = undefined;
    prev = undefined;
    drawingChanged();
    redo = [];
  }
});

const drawingChanged = () => {
  const event = new Event("drawing-changed");
  canvas.dispatchEvent(event);
};

const redrawCanvas = () => {
  draw.clearRect(0, 0, canvas.height, canvas.width);
  drawingArr.forEach((item) => {
    if (item instanceof Squiggles) {
      item.display(draw);
    } else {
      item.draw(draw);
    }
  });
  prev?.draw(draw);
};

canvas.addEventListener("drawing-changed", () => {
  redrawCanvas();
});

const addButton = (text: string, clicked: () => void) => {
  const button = document.createElement("button");
  button.textContent = text;
  button.addEventListener("click", clicked);
  app.appendChild(button);
  return button;
};

const initialStickers = () => {
  stickers.forEach((emoji) => addSticker(emoji));
};

const addSticker = (emoji: string) => {
  const button = document.createElement("button");
  button.textContent = emoji;
  button.classList.add("sticker-button");
  button.addEventListener("click", () => {
    currEmoji = emoji;
    drawingChanged();
  });
  app.appendChild(button);
};
initialStickers();

addButton("Custom Sticker Creation", () => {
  const custEmoji = prompt("Enter emoji:", "");
  if (custEmoji) {
    stickers.push(custEmoji);
    addSticker(custEmoji);
    drawingChanged();
  }
});

const randomColor = () => {
  const color = Math.floor(Math.random() * 16777215).toString(16);
  return `#${color}`;
};

// Creating buttons for the user to interact with
const thick = addButton("THICK", () => {
  size = 2.5;
  draw.strokeStyle = randomColor();
  currEmoji = undefined;
});
thick.classList.add("tool");

const thin = addButton("THIN", () => {
  size = 0.75;
  draw.strokeStyle = randomColor();
  currEmoji = undefined;
});
thin.classList.add("tool");

addButton("UNDO", () => {
  if (drawingArr.length > 0) {
    redo.push(drawingArr.pop()!);
    drawingChanged();
  }
});

addButton("REDO", () => {
  if (redo.length > 0) {
    drawingArr.push(redo.pop()!);
    drawingChanged();
  }
});

addButton("CLEAR", () => {
  drawingArr.length = 0;
  redo.length = 0;
  draw.clearRect(0, 0, canvas.width, canvas.height);
});

addButton("EXPORT", () => {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const exported = canvas.getContext("2d")!;

  exported.fillStyle = "black";
  exported.fillRect(0, 0, canvas.width, canvas.height);
  exported.strokeStyle = "white";
  exported.scale(4, 4);

  drawingArr.forEach((item) => {
    if (item instanceof Squiggles) {
      item.display(exported);
    } else {
      item.draw(exported);
    }
  });
  const data = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = data;
  link.download = "noted_export.png";
  link.click();
});
