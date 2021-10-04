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
var Building = /** @class */ (function () {
    function Building(x, y, angle, isFriendly, asteroidPosition) {
        this.position = new Vector2(x, y);
        this.angle = angle;
        this.friendly = isFriendly;
        this.asteroidPosition = asteroidPosition;
        this.hitTime = 0;
    }
    Building.prototype.render = function (ctx, x, y, mousePos) { };
    Building.prototype.update = function (delta) { return false; };
    Building.prototype.takeDamage = function (damage) { };
    Building.prototype.shoot = function (player) { return []; };
    Building.prototype.getX = function () {
        return this.position.x + this.asteroidPosition.x;
    };
    Building.prototype.getY = function () {
        return this.position.y + this.asteroidPosition.y;
    };
    return Building;
}());
var Turret = /** @class */ (function (_super) {
    __extends(Turret, _super);
    function Turret(x, y, angle, asteroidPosition) {
        var _this = _super.call(this, x, y, angle, false, asteroidPosition) || this;
        _this.turretAngle = 0;
        _this.reloadTime = 40;
        _this.maxReloadTime = 40;
        _this.health = 25;
        return _this;
    }
    Turret.prototype.update = function (delta) {
        if (this.health <= 0)
            return true;
        this.reloadTime -= delta;
        this.hitTime -= delta;
        return false;
    };
    Turret.prototype.render = function (ctx, x, y, mousePos) {
        ctx.save();
        ctx.translate(game.rpx(x + this.position.x), game.rpy(y + this.position.y));
        ctx.rotate(this.angle);
        ctx.fillStyle = this.hitTime > 0 ? "rgb(120, 120, 120)" : "rgb(100, 100, 100)";
        ctx.beginPath();
        ctx.arc(0, -30, 30, 0, Math.PI);
        ctx.fill();
        ctx.restore();
    };
    Turret.prototype.takeDamage = function (damage) {
        this.health -= damage;
        this.hitTime = 10;
    };
    Turret.prototype.shoot = function (player) {
        if (this.reloadTime > 0)
            return [];
        this.reloadTime = this.maxReloadTime;
        var angle = Math.atan2(player.position.y - (this.position.y + this.asteroidPosition.y), player.position.x - (this.position.x + this.asteroidPosition.x));
        if (Math.abs(Math.cos(angle) - Math.cos(this.angle + Math.PI / 2)) +
            Math.abs(Math.sin(angle) - Math.sin(this.angle + Math.PI / 2)) > 2 ||
            dist(this.position.x + this.asteroidPosition.x, this.position.y + this.asteroidPosition.y, player.position.x, player.position.y) > 900)
            return [];
        return [new Bullet(this.position.x + this.asteroidPosition.x, this.position.y + this.asteroidPosition.y, angle, 12, 1500, 3, this)];
    };
    return Turret;
}(Building));
var Shop = /** @class */ (function (_super) {
    __extends(Shop, _super);
    function Shop(x, y, angle, asteroidPosition) {
        var _this = _super.call(this, x, y, angle, true, asteroidPosition) || this;
        _this.items = [];
        var items = [{
                id: "homing",
                displayName: "Homing Missiles",
                cost: 10
            }, {
                id: "flamethrower",
                displayName: "Flamethrower",
                cost: 25
            }, {
                id: "damage",
                displayName: "+20% Damage",
                cost: 15
            }, {
                id: "shooting-speed",
                displayName: "+20% Shooting Speed",
                cost: 15
            }, {
                id: "shield",
                displayName: "+30% Shield Capacity",
                cost: 10
            }];
        for (var i = 0; i < Math.floor(Math.random() * 2) + 1; i++) {
            var selected = items[Math.floor(Math.random() * items.length)];
            _this.items.push({
                id: selected.id,
                displayName: selected.displayName,
                cost: selected.cost + Math.floor(Math.random() * 4) - 2
            });
        }
        return _this;
    }
    Shop.prototype.render = function (ctx, x, y, mousePos) {
        game.shopTarget = null;
        var rpx = game.rpx(x + this.position.x);
        var rpy = game.rpy(y + this.position.y);
        ctx.save();
        ctx.translate(rpx, rpy);
        ctx.rotate(this.angle + Math.PI);
        ctx.fillStyle = "rgb(100, 100, 100)";
        if (Math.abs(rpx - mousePos.x) + Math.abs(rpy - mousePos.y) < 60 && game.started) {
            game.shopTarget = this;
        }
        ctx.drawImage(game.shopTarget === this ? game.images["shop1"] : game.images["shop"], -64, -64, 128, 128);
        ctx.restore();
    };
    return Shop;
}(Building));
