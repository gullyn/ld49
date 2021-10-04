var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var game = new Game(canvas, ctx);
game.update();
document.body.appendChild(canvas);
window.addEventListener("mousedown", function (event) {
    game.mousedown();
});
window.addEventListener("mousemove", function (event) {
    game.mousemove(event.clientX, event.clientY);
});
window.addEventListener("mouseup", function (event) {
    game.mouseup();
});
window.addEventListener("keydown", function (event) {
    game.keydown(event.key.toLowerCase());
    event.key.toLowerCase() === "tab" && event.preventDefault();
});
window.addEventListener("keyup", function (event) {
    game.keyup(event.key.toLowerCase());
});
window.onresize = function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};
