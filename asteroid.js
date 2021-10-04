var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Asteroid = /** @class */ (function (_super) {
    __extends(Asteroid, _super);
    function Asteroid(x, y, size, velocity, points, rotationSpeed, planet, colors) {
        var _this = _super.call(this, x, y) || this;
        _this.rotationSpeed = rotationSpeed > 400 ? 0 : Math.random() / rotationSpeed - (0.5 / rotationSpeed);
        _this.velocity = new Vector2((Math.random() - 0.5) * velocity, (Math.random() - 0.5) * velocity);
        _this.size = planet ? size : Math.floor(Math.random() * size) + size / 2;
        _this.health = _this.size;
        _this.isPlanet = planet;
        _this.colors = colors;
        _this.buildings = [];
        _this.structure = _this.createStructure(points);
        _this.createBuildings();
        return _this;
    }
    Asteroid.prototype.update = function (delta, data) {
        var p = data["player"];
        if (dist(this.position.x, this.position.y, p.position.x, p.position.y) > 1000 + this.size)
            return;
        if (this.health <= 0)
            return true;
        this.hitTime -= delta;
        this.rotation += this.rotationSpeed * delta;
        this.position.x += this.velocity.x * delta;
        this.position.y += this.velocity.y * delta;
        for (var _i = 0, _a = data["asteroids"]; _i < _a.length; _i++) {
            var asteroid = _a[_i];
            if (this === asteroid || this.isPlanet)
                continue;
            var d = dist(asteroid.position.x, asteroid.position.y, this.position.x, this.position.y);
            if (d > this.size + asteroid.size + 150)
                continue;
            for (var _b = 0, _c = this.structure; _b < _c.length; _b++) {
                var point = _c[_b];
                if (asteroid.pointInside(crx(point.x, point.y, this.rotation) + this.position.x, cry(point.x, point.y, this.rotation) + this.position.y)) {
                    var angle = Math.atan2(this.position.y - asteroid.position.y, this.position.x - asteroid.position.x);
                    this.velocity.x = Math.cos(angle);
                    this.velocity.y = Math.sin(angle);
                }
            }
        }
        if (dist(p.position.x, p.position.y, this.position.x, this.position.y) <= this.size + 75 && !this.isPlanet) {
            if (this.pointInside(crx(-20, -30, p.rotation) + p.position.x, cry(-20, -30, p.rotation) + p.position.y) ||
                this.pointInside(crx(20, -30, p.rotation) + p.position.x, cry(20, -30, p.rotation) + p.position.y) ||
                this.pointInside(crx(-20, 30, p.rotation) + p.position.x, cry(-20, 30, p.rotation) + p.position.y) ||
                this.pointInside(crx(20, 30, p.rotation) + p.position.x, cry(20, 30, p.rotation) + p.position.y)) {
                var angle = Math.atan2(this.position.y - p.position.y, this.position.x - p.position.x);
                this.velocity.x = Math.cos(angle);
                this.velocity.y = Math.sin(angle);
            }
        }
        for (var _d = 0, _e = data["enemies"]; _d < _e.length; _d++) {
            var enemy = _e[_d];
            if (dist(enemy.position.x, enemy.position.y, this.position.x, this.position.y) <= this.size + 75 && !this.isPlanet) {
                if (this.pointInside(crx(-20, -30, enemy.rotation) + enemy.position.x, cry(-20, -30, enemy.rotation) + enemy.position.y) ||
                    this.pointInside(crx(20, -30, enemy.rotation) + enemy.position.x, cry(20, -30, enemy.rotation) + enemy.position.y) ||
                    this.pointInside(crx(-20, 30, enemy.rotation) + enemy.position.x, cry(-20, 30, enemy.rotation) + enemy.position.y) ||
                    this.pointInside(crx(20, 30, enemy.rotation) + enemy.position.x, cry(20, 30, enemy.rotation) + enemy.position.y)) {
                    var angle = Math.atan2(this.position.y - enemy.position.y, this.position.x - enemy.position.x);
                    this.velocity.x = Math.cos(angle);
                    this.velocity.y = Math.sin(angle);
                }
            }
        }
        return false;
    };
    Asteroid.prototype.render = function (ctx, mousePos) {
        if (Math.abs(game.rpx(this.position.x)) > this.size + ctx.canvas.width + 100 ||
            Math.abs(game.rpy(this.position.y)) > this.size + ctx.canvas.height + 100)
            return;
        for (var _i = 0, _a = this.buildings; _i < _a.length; _i++) {
            var building = _a[_i];
            building.render(ctx, this.position.x, this.position.y, mousePos);
        }
        ctx.save();
        ctx.translate(game.rpx(this.position.x), game.rpy(this.position.y));
        ctx.rotate(this.rotation);
        ctx.beginPath();
        if (this.hitTime > 0) {
            ctx.fillStyle = "rgb(" + this.colors[2] + ")";
            ctx.strokeStyle = "rgb(" + this.colors[3] + ")";
        }
        else {
            ctx.fillStyle = "rgb(" + this.colors[0] + ")";
            ctx.strokeStyle = "rgb(" + this.colors[1] + ")";
        }
        ctx.lineWidth = 10;
        for (var i = 0; i < this.structure.length + 1; i++) {
            var point = this.structure[i % this.structure.length];
            ctx.lineTo(point.x, point.y);
        }
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    };
    Asteroid.prototype.createStructure = function (numPoints) {
        var structure = [];
        for (var i = 0; i < numPoints; i++) {
            structure.push(new Vector2(circlePosX(i, numPoints) * (this.size + Math.floor(Math.random() * 75)), circlePosY(i, numPoints) * (this.size + Math.floor(Math.random() * 75))));
        }
        return structure;
    };
    Asteroid.prototype.createBuildings = function () {
        var shopCreated = false;
        if (!this.isPlanet)
            return;
        for (var i = 1; i < this.structure.length + 1; i += 2) {
            if (Math.random() > 0.2)
                continue;
            var p1 = this.structure[i % this.structure.length];
            var p2 = this.structure[(i - 1) % this.structure.length];
            var angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            var className = Math.random() < 0.5 ? Shop : Turret;
            if (shopCreated)
                className = Turret;
            if (className === Shop)
                shopCreated = true;
            this.buildings.push(new className((p1.x + p2.x) / 2 + Math.cos(angle + Math.PI / 2) * 30, (p1.y + p2.y) / 2 + Math.sin(angle + Math.PI / 2) * 30, angle, this.position));
        }
    };
    Asteroid.prototype.pointInside = function (x, y) {
        var g = dist(x, y, this.position.x, this.position.y) + 1000 + this.size;
        var intersections = 0;
        for (var i = 1; i < this.structure.length + 1; i++) {
            var p1 = this.structure[i % this.structure.length];
            var p2 = this.structure[(i - 1) % this.structure.length];
            if (intersect([crx(p1.x, p1.y, this.rotation) + this.position.x, cry(p1.x, p1.y, this.rotation) + this.position.y], [crx(p2.x, p2.y, this.rotation) + this.position.x, cry(p2.x, p2.y, this.rotation) + this.position.y], [x, y], [x - g - 10, y]))
                intersections++;
        }
        return intersections % 2 === 1;
    };
    Asteroid.prototype.takeDamage = function (damage) {
        if (this.isPlanet)
            return;
        this.hitTime = 10;
        this.health -= damage;
    };
    return Asteroid;
}(Entity));
