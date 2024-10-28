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

let size = 1.5;
let currDrawing = false;

class preview {
    x: number;
    y: number;
    thickness: number;

    constructor(x: number, y: number, thickness: number) {
        this.x = x;
        this.y = y;
        this.thickness = thickness;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.thickness, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
    }
}
class markerLine {
    coordinates: number[][];
    thickness: number;

    constructor(x: number, y: number, thickness: number) {
        this.coordinates = [[x, y]];
        this.thickness = thickness;
    }

    drag(x: number, y: number) {
        this.coordinates.push([x, y]);
    }

    display(ctx: {
      lineWidth: number; beginPath: () => void; moveTo: (arg0: number, arg1: number) => void; lineTo: (arg0: number, arg1: number) => void; stroke: () => void; 
}) {
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

let redo: markerLine[];
let curr: markerLine | undefined;
const drawingArr: markerLine[] = [];
let prev: preview | undefined;

canvas.addEventListener("mousedown", (pos) => {
    currDrawing = true;
    curr = new markerLine(pos.offsetX, pos.offsetY, size);
});

canvas.addEventListener("mousemove", (pos) => {
    if (curr && currDrawing) {
        curr.drag(pos.offsetX, pos.offsetY);
    }
    else {
        prev = new preview(pos.offsetX, pos.offsetY, size);
    }
    drawingChanged();
});

canvas.addEventListener("mouseup", () => {
    if (curr && currDrawing) {
        drawingArr.push(curr); 
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
    drawingArr.forEach(line => line.display(draw));
    if (prev) {
        prev.draw(draw);
    }
};

canvas.addEventListener("drawing-changed", () => {
    draw.clearRect(0, 0, canvas.height, canvas.width);
    redrawCanvas();
});

const addButton = (text: string, clicked: () => void) => {
    const button = document.createElement("button");
    button.textContent = text;
    button.addEventListener("click", clicked);
    app.appendChild(button);
    return button;
};

const thick = addButton("THICK", () => size = 2.5);
thick.classList.add("tool");

const thin = addButton("THIN", () => size = 0.75);
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


