var Minimap = /** @class */ (function () {
    function Minimap(size, range) {
        this.size = size;
        this.range = range;
    }
    Minimap.prototype.render = function (ctx, data) {
        var p = data["player"];
        ctx.beginPath();
        ctx.arc(this.size + 20, this.size + 20, this.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgb(50, 50, 50)";
        ctx.fill();
        for (var _i = 0, _a = data["asteroids"]; _i < _a.length; _i++) {
            var asteroid = _a[_i];
            if (dist(asteroid.position.x, asteroid.position.y, p.position.x, p.position.y) > this.range)
                continue;
            ctx.beginPath();
            ctx.arc((asteroid.position.x - p.position.x) / this.range * this.size + this.size + 20, (asteroid.position.y - p.position.y) / this.range * this.size + this.size + 20, Math.ceil(asteroid.size / 100 + 2), 0, Math.PI * 2);
            ctx.fillStyle = "rgb(" + asteroid.colors[0] + ")";
            ctx.fill();
        }
        for (var _b = 0, _c = data["enemies"]; _b < _c.length; _b++) {
            var enemy = _c[_b];
            if (enemy.isBoss) {
                var angle = Math.atan2(enemy.position.y - p.position.y, enemy.position.x - p.position.x);
                ctx.beginPath();
                ctx.arc(Math.min(Math.cos(angle) * this.size, Math.max(-Math.cos(angle) * this.size, (enemy.position.x - p.position.x) / this.range * this.size)) + this.size + 20, Math.min(Math.sin(angle) * this.size, Math.max(-Math.sin(angle) * this.size, (enemy.position.y - p.position.y) / this.range * this.size)) + this.size + 20, 5, 0, Math.PI * 2);
                ctx.fillStyle = "rgb(255, 255, 0)";
                ctx.fill();
                continue;
            }
            if (dist(enemy.position.x, enemy.position.y, p.position.x, p.position.y) > this.range)
                continue;
            ctx.beginPath();
            ctx.arc((enemy.position.x - p.position.x) / this.range * this.size + this.size + 20, (enemy.position.y - p.position.y) / this.range * this.size + this.size + 20, 5, 0, Math.PI * 2);
            ctx.fillStyle = "rgb(255, 0, 0)";
            ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(this.size + 20, this.size + 20, 5, 0, Math.PI * 2);
        ctx.fillStyle = "rgb(0, 0, 255)";
        ctx.fill();
    };
    return Minimap;
}());
