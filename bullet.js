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
var Bullet = /** @class */ (function (_super) {
    __extends(Bullet, _super);
    function Bullet(x, y, rotation, speed, range, damage, owner) {
        var _this = _super.call(this, x, y) || this;
        _this.rotation = rotation;
        _this.speed = speed;
        _this.owner = owner;
        _this.range = range;
        _this.damage = damage;
        _this.travelled = 0;
        if (_this.owner === game.player)
            _this.damage *= 1 + game.player.damageBonus * 0.2;
        return _this;
    }
    Bullet.prototype.update = function (delta, data) {
        this.move(delta);
        var tx = Math.cos(this.rotation) * this.speed * delta;
        var ty = Math.sin(this.rotation) * this.speed * delta;
        this.travelled += Math.abs(tx) + Math.abs(ty);
        this.position.x += tx;
        this.position.y += ty;
        for (var _i = 0, _a = data["asteroids"]; _i < _a.length; _i++) {
            var asteroid = _a[_i];
            var d = dist(asteroid.position.x, asteroid.position.y, this.position.x, this.position.y);
            if (d > asteroid.size + 75)
                continue;
            if (asteroid.pointInside(this.position.x, this.position.y)) {
                asteroid.takeDamage(this.damage);
                return true;
            }
            for (var _b = 0, _c = asteroid.buildings; _b < _c.length; _b++) {
                var building = _c[_b];
                if (dist(building.position.x + building.asteroidPosition.x, building.position.y + building.asteroidPosition.y, this.position.x, this.position.y) < 50 && this.owner !== building) {
                    building.takeDamage(this.damage);
                    return true;
                }
            }
        }
        var p = data["player"];
        if (dist(p.position.x, p.position.y, this.position.x, this.position.y) <= 20 && this.owner !== p) {
            p.takeDamage(this.damage);
            return true;
        }
        if (this.owner === p) {
            for (var _d = 0, _e = data["enemies"]; _d < _e.length; _d++) {
                var enemy = _e[_d];
                if (dist(enemy.position.x, enemy.position.y, this.position.x, this.position.y) <= 20) {
                    enemy.takeDamage(this.damage);
                    return true;
                }
            }
        }
        if (this.range < this.travelled)
            return true;
        return false;
    };
    Bullet.prototype.render = function (ctx) {
        ctx.shadowBlur = 5;
        ctx.save();
        ctx.translate(game.rpx(this.position.x), game.rpy(this.position.y));
        ctx.rotate(this.rotation - Math.PI / 2);
        ctx.fillStyle = "red";
        ctx.fillRect(-5, -10, 10, 20);
        ctx.restore();
        ctx.shadowBlur = 0;
    };
    Bullet.prototype.move = function (delta) { };
    return Bullet;
}(Entity));
var HomingBullet = /** @class */ (function (_super) {
    __extends(HomingBullet, _super);
    function HomingBullet(x, y, rotation, speed, range, damage, owner, target) {
        var _this = _super.call(this, x, y, rotation, speed, range, damage, owner) || this;
        _this.target = target;
        return _this;
    }
    HomingBullet.prototype.move = function (delta) {
        if (this.target.health <= 0)
            return;
        var angle = Math.atan2(this.target.getY() - this.position.y, this.target.getX() - this.position.x);
        this.rotation += this.rotateTo(angle) * (Math.PI / 32) * delta;
    };
    HomingBullet.prototype.rotateTo = function (rotation) {
        var tempr = this.rotation, r1 = tempr, n1 = 0, n2 = 0;
        var r = ((rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        while (Math.abs(r - r1) > Math.PI / 32) {
            tempr += Math.PI / 64;
            r1 = ((tempr % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            n1++;
        }
        tempr = this.rotation, r1 = tempr;
        while (Math.abs(r - r1) > Math.PI / 32) {
            tempr -= Math.PI / 64;
            r1 = ((tempr % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            n2++;
        }
        return n1 <= n2 ? 1 : -1;
    };
    return HomingBullet;
}(Bullet));
var FlamethrowerBullet = /** @class */ (function (_super) {
    __extends(FlamethrowerBullet, _super);
    function FlamethrowerBullet(x, y, rotation, speed, range, damage, owner) {
        return _super.call(this, x, y, rotation, speed, range, damage, owner) || this;
    }
    FlamethrowerBullet.prototype.render = function (ctx) {
        ctx.shadowBlur = 5;
        ctx.save();
        ctx.translate(game.rpx(this.position.x), game.rpy(this.position.y));
        ctx.rotate(this.rotation - Math.PI / 2);
        ctx.fillStyle = "orange";
        ctx.fillRect(-5, -5, 10, 10);
        ctx.restore();
        ctx.shadowBlur = 0;
    };
    return FlamethrowerBullet;
}(Bullet));
var PowerfulBullet = /** @class */ (function (_super) {
    __extends(PowerfulBullet, _super);
    function PowerfulBullet(x, y, rotation, speed, range, damage, owner) {
        return _super.call(this, x, y, rotation, speed, range, damage, owner) || this;
    }
    PowerfulBullet.prototype.render = function (ctx) {
        ctx.shadowBlur = 10;
        ctx.save();
        ctx.translate(game.rpx(this.position.x), game.rpy(this.position.y));
        ctx.rotate(this.rotation - Math.PI / 2);
        ctx.fillStyle = "blue";
        ctx.fillRect(-10, -10, 20, 20);
        ctx.restore();
        ctx.shadowBlur = 0;
    };
    return PowerfulBullet;
}(Bullet));
