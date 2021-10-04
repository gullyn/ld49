var Particle = /** @class */ (function () {
    function Particle(x, y, speed, rotation, color, life) {
        this.position = new Vector2(x, y);
        this.speed = speed;
        this.rotation = rotation;
        this.color = color;
        this.life = life;
    }
    Particle.prototype.update = function (delta) {
        this.life -= delta;
        this.position.x += Math.cos(this.rotation) * this.speed * delta;
        this.position.y += Math.sin(this.rotation) * this.speed * delta;
        if (this.life <= -30)
            return true;
        return false;
    };
    Particle.prototype.render = function (ctx) {
        var opacity = Math.min(255, (this.life + 30) * 2.55) / 255;
        ctx.beginPath();
        ctx.arc(game.rpx(this.position.x), game.rpy(this.position.y), 5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + this.color + ", " + opacity + ")";
        ctx.fill();
    };
    return Particle;
}());
function explosion(x, y, count, minAngle, maxAngle) {
    var particles = [];
    for (var i = 0; i < count; i++) {
        var angle = Math.random() * (maxAngle - minAngle) + minAngle;
        var color = ["255, 0, 0", "255, 128, 0", "255, 255, 0"][Math.floor(Math.random() * 3)];
        particles.push(new Particle(x, y, Math.random() * 6 + 1, angle, color, 30));
    }
    return particles;
}
