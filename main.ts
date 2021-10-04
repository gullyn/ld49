const canvas: HTMLCanvasElement = document.createElement("canvas");
const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const game: Game = new Game(canvas, ctx);
game.update();

document.body.appendChild(canvas);

window.addEventListener("mousedown", event => {
	game.mousedown();
});

window.addEventListener("mousemove", event => {
	game.mousemove(event.clientX, event.clientY);
});

window.addEventListener("mouseup", event => {
	game.mouseup();
});

window.addEventListener("keydown", event => {
	game.keydown(event.key.toLowerCase());
	event.key.toLowerCase() === "tab" && event.preventDefault();
});

window.addEventListener("keyup", event => {
	game.keyup(event.key.toLowerCase());
});

window.onresize = () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}