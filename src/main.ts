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

canvas.addEventListener("mousedown", (pos) => {
    currDrawing = true;
    draw.fillStyle = "white";
    draw.beginPath();
    draw.arc(pos.offsetX, pos.offsetY, 1, 0, Math.PI * 2);
    draw.fill();
    draw.moveTo(pos.offsetX, pos.offsetY);
    canvas.addEventListener("mousemove", mouseMovement);
});

canvas.addEventListener("mouseup", () => {
    currDrawing = false;
    canvas.removeEventListener("mousemove", mouseMovement);
});


const mouseMovement = (pos: MouseEvent) => {
    if (currDrawing) {
        draw.lineTo(pos.offsetX, pos.offsetY);
        draw.stroke();
    }
};

const clear = document.createElement("button");
clear.textContent = "CLEAR";
clear.addEventListener("click", () => {
    draw.clearRect(0, 0, canvas.height, canvas.width);
});
app.appendChild(clear);
