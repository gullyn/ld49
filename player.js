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
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player(x, y) {
        var _this = _super.call(this, x, y) || this;
        _this.velocity = 0;
        _this.maxVelocity = 10;
        _this.health = 100;
        _this.maxHealth = 100;
        _this.shieldUnlocked = true;
        _this.shieldHealth = 25;
        _this.shieldMax = 25;
        _this.coins = 0;
        _this.weapons = [{
                reloadTime: 0,
                maxReloadTime: 20,
                name: "Machine Gun",
                id: "machine-gun"
            }];
        _this.selectedWeapon = 0;
        _this.damageBonus = 0;
        _this.shootingBonus = 0;
        return _this;
    }
    Player.prototype.update = function (delta, data) {
        this.weapons[this.selectedWeapon].reloadTime -= delta;
        this.shieldHealth = Math.min(this.shieldMax, this.shieldHealth + 0.01);
        if (data["keys"]["w"])
            this.velocity = Math.min(this.maxVelocity, this.velocity + 0.1 * delta);
        if (data["keys"]["s"])
            this.velocity = Math.max(0, this.velocity - 0.1 * delta);
        if (data["keys"]["a"])
            this.rotation -= 0.07 * delta;
        if (data["keys"]["d"])
            this.rotation += 0.07 * delta;
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
    };
    Player.prototype.render = function (ctx) {
        ctx.save();
        ctx.translate(game.rpx(this.position.x), game.rpy(this.position.y));
        ctx.rotate(this.rotation + Math.PI / 2);
        ctx.drawImage(game.keys["w"] ? game.images["player"] : game.images["player-off"], -32, -32, 64, 64);
        ctx.restore();
    };
    Player.prototype.shoot = function (target) {
        var weapon = this.weapons[this.selectedWeapon];
        if (weapon.reloadTime > 0)
            return [];
        var multiple = 1;
        for (var i = 0; i < this.shootingBonus; i++)
            multiple *= 0.8;
        weapon.reloadTime = weapon.maxReloadTime * multiple;
        var direction = this.rotation;
        if (target !== null) {
            var x = target.position.x + target.asteroidPosition.x;
            var y = target.position.y + target.asteroidPosition.y;
            var angle = Math.atan2(y - this.position.y, x - this.position.x);
            if (Math.abs(Math.cos(angle) - Math.cos(this.rotation)) + Math.abs(Math.sin(angle) - Math.sin(this.rotation)) < 0.5)
                direction = angle;
        }
        switch (this.weapons[this.selectedWeapon].name) {
            case "Machine Gun":
                return [new Bullet(this.position.x, this.position.y, direction, 18, 2500, 5, this)];
            case "Homing":
                if (target === null) {
                    this.weapons[this.selectedWeapon].reloadTime = 0;
                    return [];
                }
                return [new HomingBullet(this.position.x, this.position.y, direction, 15, 3000, 5, this, target)];
            case "Flamethrower":
                return [new FlamethrowerBullet(this.position.x, this.position.y, direction, 12, 700, 0.5, this)];
            default:
                return [];
        }
    };
    Player.prototype.takeDamage = function (damage) {
        if (this.shieldUnlocked && this.shieldHealth > 0) {
            this.shieldHealth -= damage;
            damage = 0;
            if (this.shieldHealth <= 0) {
                damage = 0 - this.shieldHealth;
                this.shieldHealth = 0;
            }
        }
        this.health -= damage;
    };
    Player.prototype.hasWeapon = function (id) {
        for (var _i = 0, _a = this.weapons; _i < _a.length; _i++) {
            var i = _a[_i];
            if (i.id === id)
                return true;
        }
        return false;
    };
    Player.prototype.buy = function (id) {
        switch (id) {
            case "homing":
                this.weapons.push({
                    reloadTime: 0,
                    maxReloadTime: 100,
                    name: "Homing",
                    id: "homing"
                });
                break;
            case "flamethrower":
                this.weapons.push({
                    reloadTime: 0,
                    maxReloadTime: 1,
                    name: "Flamethrower",
                    id: "flamethrower"
                });
                break;
            case "damage":
                this.damageBonus++;
                break;
            case "shooting-speed":
                this.shootingBonus++;
                break;
            case "shield":
                this.shieldMax += 25 * 0.3;
                break;
            default:
                break;
        }
    };
    return Player;
}(Entity));
