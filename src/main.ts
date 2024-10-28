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
draw.lineWidth = 1;

let currDrawing = false;

class markerLine {
    coordinates: number[][];

    constructor(x: number, y: number) {
        this.coordinates = [[x, y]];
    }

    drag(x: number, y: number) {
        this.coordinates.push([x, y]);
    }

    display(ctx: { beginPath: () => void; moveTo: (arg0: number, arg1: number) => void; lineTo: (arg0: number, arg1: number) => void; stroke: () => void; }) {
        if (this.coordinates.length < 2) {
            return;
        }
        ctx.beginPath();
        ctx.moveTo(this.coordinates[0][0], this.coordinates[0][1]);

        for (let i = 1; i < this.coordinates.length; i++) {
            const [x, y] = this.coordinates[i];
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}

let redo: markerLine[];
let curr: markerLine | null = null;
const drawingArr: markerLine[] = [];

canvas.addEventListener("mousedown", (pos) => {
    currDrawing = true;
    curr = new markerLine(pos.offsetX, pos.offsetY);
    curr.display(draw);
});

canvas.addEventListener("mousemove", (pos) => {
    if (curr && currDrawing) {
        curr.drag(pos.offsetX, pos.offsetY);
        drawingChanged();
    }
});

canvas.addEventListener("mouseup", () => {
    if (curr && currDrawing) {
        drawingArr.push(curr); 
        currDrawing = false;
        curr = null;
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
};

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


