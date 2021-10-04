var Vector2 = /** @class */ (function () {
    function Vector2(x, y) {
        this.x = x;
        this.y = y;
    }
    return Vector2;
}());
function dist(x1, y1, x2, y2) {
    var a = Math.abs(x1 - x2);
    var b = Math.abs(y1 - y2);
    return Math.sqrt(a * a + b * b);
}
var circlePosX = function (i, num) { return Math.cos(i * (Math.PI * 2 / num)); };
var circlePosY = function (i, num) { return Math.sin(i * (Math.PI * 2 / num)); };
var crx = function (x, y, angle) { return x * Math.cos(angle) - y * Math.sin(angle); };
var cry = function (x, y, angle) { return y * Math.cos(angle) + x * Math.sin(angle); };
var ccw = function (a, b, c) { return (c[1] - a[1]) * (b[0] - a[0]) > (b[1] - a[1]) * (c[0] - a[0]); };
var intersect = function (a, b, c, d) {
    return ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d);
};
var image = function (url) {
    var img = document.createElement("img");
    img.src = url;
    return img;
};
var audio = function (url) {
    var a = document.createElement("audio");
    a.src = url;
    return a;
};
