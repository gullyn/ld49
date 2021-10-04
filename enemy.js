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
var Enemy = /** @class */ (function (_super) {
    __extends(Enemy, _super);
    function Enemy(x, y, boss, health) {
        var _this = _super.call(this, x, y) || this;
        _this.velocity = 0;
        _this.maxVelocity = 5;
        _this.reloadTime = 60;
        _this.maxReloadTime = 60;
        _this.health = health;
        _this.maxHealth = 20;
        _this.asteroidPosition = new Vector2(0, 0);
        _this.isBoss = boss;
        return _this;
    }
    Enemy.prototype.update = function (delta, data) {
        if (this.health <= 0)
            return true;
        this.reloadTime -= delta;
        this.hitTime -= delta;
        var p = data["player"];
        var mul = dist(this.position.x, this.position.y, p.position.x, p.position.y) < 400 ? -0.5 : 1;
        this.velocity = Math.min(this.maxVelocity, this.velocity + 0.07 * delta * mul);
        this.rotation += this.rotateTo(Math.atan2(p.position.y - this.position.y, p.position.x - this.position.x)) * Math.PI / 64 * delta;
        var newX = Math.cos(this.rotation) * this.velocity * delta + this.position.x;
        var newY = Math.sin(this.rotation) * this.velocity * delta + this.position.y;
        var colliding = false;
        for (var _i = 0, _a = data["asteroids"]; _i < _a.length; _i++) {
            var asteroid = _a[_i];
            if (asteroid.pointInside(crx(-20, -30, this.rotation) + newX, cry(-20, -30, this.rotation) + newY) ||
                asteroid.pointInside(crx(20, -30, this.rotation) + newX, cry(20, -30, this.rotation) + newY) ||
                asteroid.pointInside(crx(-20, 30, this.rotation) + newX, cry(-20, 30, this.rotation) + newY) ||
                asteroid.pointInside(crx(20, 30, this.rotation) + newX, cry(20, 30, this.rotation) + newY)) {
                colliding = true;
                this.velocity = 0;
            }
        }
        if (!colliding) {
            this.position.x = newX;
            this.position.y = newY;
        }
        return false;
    };
    Enemy.prototype.render = function (ctx) {
        ctx.save();
        ctx.translate(game.rpx(this.position.x), game.rpy(this.position.y));
        ctx.rotate(this.rotation + Math.PI / 2);
        ctx.drawImage(game.images["enemy1"], -32, -32, 64, 64);
        ctx.restore();
    };
    Enemy.prototype.shoot = function (player) {
        if (this.reloadTime > 0)
            return [];
        this.reloadTime = this.maxReloadTime;
        var angle = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x);
        return [new Bullet(this.position.x, this.position.y, angle, 12, 1500, 5, this)];
    };
    Enemy.prototype.rotateTo = function (rotation) {
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
    Enemy.prototype.takeDamage = function (damage) {
        this.hitTime = 10;
        this.health -= damage;
    };
    return Enemy;
}(Entity));
var TripleShotEnemy = /** @class */ (function (_super) {
    __extends(TripleShotEnemy, _super);
    function TripleShotEnemy(x, y) {
        return _super.call(this, x, y, false, 20) || this;
    }
    TripleShotEnemy.prototype.shoot = function (player) {
        if (this.reloadTime > 0)
            return [];
        this.reloadTime = this.maxReloadTime;
        var angle = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x);
        return [
            new Bullet(this.position.x, this.position.y, angle - Math.PI / 16, 12, 1500, 1, this),
            new Bullet(this.position.x, this.position.y, angle, 12, 1500, 1, this),
            new Bullet(this.position.x, this.position.y, angle + Math.PI / 16, 12, 1500, 1, this)
        ];
    };
    return TripleShotEnemy;
}(Enemy));
var PowerfulEnemy = /** @class */ (function (_super) {
    __extends(PowerfulEnemy, _super);
    function PowerfulEnemy(x, y) {
        var _this = _super.call(this, x, y, false, 30) || this;
        _this.maxReloadTime = 60;
        return _this;
    }
    PowerfulEnemy.prototype.render = function (ctx) {
        ctx.save();
        ctx.translate(game.rpx(this.position.x), game.rpy(this.position.y));
        ctx.rotate(this.rotation + Math.PI / 2);
        ctx.drawImage(game.images["enemy3"], -48, -48, 96, 96);
        ctx.restore();
    };
    PowerfulEnemy.prototype.shoot = function (player) {
        if (this.reloadTime > 0)
            return [];
        this.reloadTime = this.maxReloadTime;
        var angle = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x);
        return [
            new PowerfulBullet(this.position.x, this.position.y, angle, 9, 2000, 5, this)
        ];
    };
    return PowerfulEnemy;
}(Enemy));
var Boss = /** @class */ (function (_super) {
    __extends(Boss, _super);
    function Boss(x, y) {
        var _this = _super.call(this, x, y, true, 150) || this;
        _this.reloadTime = 0;
        _this.maxReloadTime = 60;
        return _this;
    }
    Boss.prototype.render = function (ctx) {
        ctx.save();
        ctx.translate(game.rpx(this.position.x), game.rpy(this.position.y));
        ctx.rotate(this.rotation + Math.PI / 2);
        ctx.drawImage(game.images["enemy1"], -64, -64, 128, 128);
        ctx.restore();
    };
    Boss.prototype.shoot = function () {
        if (this.reloadTime > 0)
            return [];
        this.reloadTime = this.maxReloadTime;
        var bullets = [];
        for (var i = 0; i < 25; i++) {
            bullets.push(new Bullet(this.position.x, this.position.y, (Math.PI * 2) * (i / 25), 10, 1000, 3, this));
        }
        return bullets;
    };
    return Boss;
}(Enemy));
var TripleShotBoss = /** @class */ (function (_super) {
    __extends(TripleShotBoss, _super);
    function TripleShotBoss(x, y) {
        var _this = _super.call(this, x, y, true, 350) || this;
        _this.reloadTime = 0;
        _this.maxReloadTime = 60;
        return _this;
    }
    TripleShotBoss.prototype.render = function (ctx) {
        ctx.save();
        ctx.translate(game.rpx(this.position.x), game.rpy(this.position.y));
        ctx.rotate(this.rotation + Math.PI / 2);
        ctx.drawImage(game.images["enemy2"], -64, -64, 128, 128);
        ctx.restore();
    };
    TripleShotBoss.prototype.shoot = function (player) {
        if (this.reloadTime > 0)
            return [];
        this.reloadTime = this.maxReloadTime;
        var bullets = [];
        var angle = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x);
        bullets.push(new PowerfulBullet(this.position.x, this.position.y, angle + Math.PI / 16, 10, 1000, 5, this));
        bullets.push(new PowerfulBullet(this.position.x, this.position.y, angle, 10, 1000, 5, this));
        bullets.push(new PowerfulBullet(this.position.x, this.position.y, angle - Math.PI / 16, 10, 1000, 5, this));
        return bullets;
    };
    return TripleShotBoss;
}(Enemy));
