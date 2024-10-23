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

const drawingArr: number[][][] = [];
let curr: number[][] = [];
let redo: number[][][] = [];

canvas.addEventListener("mousedown", (pos) => {
    currDrawing = true;
    curr = [];
    curr.push([pos.offsetX, pos.offsetY]);
    drawDot([pos.offsetX, pos.offsetY]);

});

canvas.addEventListener("mousemove", (pos) => {
    if (currDrawing) {
        curr.push([pos.offsetX, pos.offsetY]);
    }
});

canvas.addEventListener("mouseup", () => {
    if (currDrawing) {
        drawingArr.push(curr); 
        currDrawing = false;
        drawingChanged();
        redo = [];
    }
});

const drawingChanged = () => {
    const event = new Event("drawing-changed");
    canvas.dispatchEvent(event);
};
const drawDot = (pos: number[]) => {
    draw.beginPath();
    draw.arc(pos[0], pos[1], 1, 0, Math.PI * 2);
    draw.fill();
};

const redrawCanvas = () => {
    drawingArr.forEach((path) => {
        draw.beginPath();
        path.forEach((point, index) => {
            if (index == 0) {
                draw.moveTo(point[0], point[1]);
            } else {
                draw.lineTo(point[0], point[1]);
            }
        });
        draw.stroke();
    });
};

canvas.addEventListener("drawing-changed", () => {
    draw.clearRect(0, 0, canvas.height, canvas.width);
    redrawCanvas();
});

const undoButton = document.createElement("button");
undoButton.textContent = "UNDO";
undoButton.addEventListener("click", () => {
    if (drawingArr.length > 0) {
        const temp = drawingArr.pop();
        if (temp) {
            redo.push(temp);
            drawingChanged();
        }
    }
});
app.appendChild(undoButton);

const redoButton = document.createElement("button");
redoButton.textContent = "REDO";
redoButton.addEventListener("click", () => {
    if (redo.length > 0) {
        const temp = redo.pop();
        if (temp) {
            drawingArr.push(temp);
            drawingChanged();
        }
    }
});
app.appendChild(redoButton);
const clear = document.createElement("button");
clear.textContent = "CLEAR";
clear.addEventListener("click", () => {
    drawingArr.length = 0;
    redo.length = 0;
    draw.clearRect(0, 0, canvas.height, canvas.width);
});
app.appendChild(clear);
