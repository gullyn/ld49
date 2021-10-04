var Game = /** @class */ (function () {
    function Game(canvas, ctx) {
        this.started = false;
        this.canvas = canvas;
        this.canvas.style.cursor = "none";
        this.ctx = ctx;
        this.lastFrameTime = new Date().getTime();
        this.mousePos = new Vector2(0, 0);
        this.mouseDown = false;
        this.keys = {};
        this.particles = [];
        this.asteroids = [new Asteroid(-1400, canvas.height / 2 - 300, 1000, 0, 45, 0, true, ["50, 170, 0", "30, 150, 0"])];
        this.background = [];
        this.createBackground();
        this.player = new Player(0, 0);
        this.shopTarget = null;
        this.shopDialog = null;
        this.blockOpacity = 0;
        this.transitioning = false;
        this.transitionFrame = 0;
        this.won = false;
        this.lost = false;
        this.message = "";
        this.messageTime = 0;
        this.images = {
            "cursor-red": image("assets/cursor-red.png"),
            "cursor-green": image("assets/cursor-green.png"),
            "target-grey": image("assets/target-grey.png"),
            "target-red": image("assets/target-red.png"),
            "coin": image("assets/coin.png"),
            "player": image("assets/ship4.png"),
            "player-off": image("assets/ship4off.png"),
            "enemy1": image("assets/ship2.png"),
            "enemy2": image("assets/ship1on.png"),
            "enemy3": image("assets/ship3.png"),
            "shop": image("assets/shop.png"),
            "shop1": image("assets/shop1.png")
        };
        this.musicNum = 0;
        this.music = null;
    }
    Game.prototype.doMusic = function () {
        if (this.music !== null && !this.music.ended)
            return;
        this.music = audio("audio/music" + ((this.musicNum % 3) + 1) + ".mp3");
        this.music.volume = 0.2;
        this.music.play();
    };
    Game.prototype.update = function () {
        if (this.player.health <= 0)
            this.lost = true;
        if (this.won || this.lost) {
            this.render();
            window.requestAnimationFrame(this.update.bind(this));
            return;
        }
        if (this.music !== null)
            this.doMusic();
        var currentTime = new Date().getTime();
        var delta = (new Date().getTime() - this.lastFrameTime) / (1000 / 60);
        this.lastFrameTime = currentTime;
        if (this.transitioning)
            this.transitionFrame++;
        if (this.transitionFrame === 30 && this.transitioning && !this.started) {
            this.started = true;
            this.startGame();
        }
        if (this.transitionFrame >= 60)
            this.transitioning = false;
        if (!this.started || this.shopDialog !== null) {
            this.render();
            window.requestAnimationFrame(this.update.bind(this));
            return;
        }
        this.player.update(delta, { keys: this.keys, asteroids: this.asteroids });
        if (this.mouseDown) {
            var bullets = this.player.shoot(this.targetLock);
            if (bullets.length > 0)
                audio("audio/shoot.wav").play();
            for (var _i = 0, bullets_1 = bullets; _i < bullets_1.length; _i++) {
                var bullet = bullets_1[_i];
                this.bullets.push(bullet);
            }
        }
        for (var i = this.asteroids.length - 1; i > -1; i--) {
            var as = this.asteroids[i];
            if (as.update(delta, {
                "asteroids": this.asteroids,
                "player": this.player,
                "enemies": this.enemies
            })) {
                for (var _a = 0, _b = explosion(as.position.x, as.position.y, 150, 0, Math.PI * 2); _a < _b.length; _a++) {
                    var particle = _b[_a];
                    this.particles.push(particle);
                }
                this.asteroids.splice(i, 1);
            }
        }
        for (var i = this.coins.length - 1; i > -1; i--) {
            if (this.coins[i].update(delta, this.player)) {
                this.coins.splice(i, 1);
                this.player.coins++;
            }
        }
        for (var i = this.bullets.length - 1; i > -1; i--)
            if (this.bullets[i].update(delta, {
                "asteroids": this.asteroids,
                "enemies": this.enemies,
                "player": this.player
            }))
                this.bullets.splice(i, 1);
        for (var i = this.particles.length - 1; i > -1; i--)
            if (this.particles[i].update(delta))
                this.particles.splice(i, 1);
        for (var i = this.enemies.length - 1; i > -1; i--) {
            var en = this.enemies[i];
            if (dist(en.position.x, en.position.y, this.player.position.x, this.player.position.y) > 2500)
                continue;
            if (en.update(delta, {
                "asteroids": this.asteroids,
                "player": this.player
            })) {
                if (en.isBoss) {
                    this.nextLevel();
                    this.transitioning = true;
                    this.transitionFrame = 0;
                }
                else {
                    for (var _c = 0, _d = explosion(en.position.x, en.position.y, 150, 0, Math.PI * 2); _c < _d.length; _c++) {
                        var particle = _d[_c];
                        this.particles.push(particle);
                    }
                    this.coins.push(new Coin(en.position.x, en.position.y));
                    this.enemies.splice(i, 1);
                }
            }
        }
        for (var _e = 0, _f = this.asteroids; _e < _f.length; _e++) {
            var asteroid = _f[_e];
            for (var i = asteroid.buildings.length - 1; i > -1; i--) {
                var building = asteroid.buildings[i];
                if (asteroid.buildings[i].update(delta)) {
                    for (var _g = 0, _h = explosion(building.position.x + building.asteroidPosition.x, building.position.y + building.asteroidPosition.y, 150, 0, Math.PI * 2); _g < _h.length; _g++) {
                        var particle = _h[_g];
                        this.particles.push(particle);
                    }
                    asteroid.buildings.splice(i, 1);
                }
                else
                    for (var _j = 0, _k = asteroid.buildings[i].shoot(this.player); _j < _k.length; _j++) {
                        var bullet = _k[_j];
                        this.bullets.push(bullet);
                    }
            }
        }
        for (var _l = 0, _m = this.enemies; _l < _m.length; _l++) {
            var enemy = _m[_l];
            for (var _o = 0, _p = enemy.shoot(this.player); _o < _p.length; _o++) {
                var bullet = _p[_o];
                this.bullets.push(bullet);
            }
        }
        this.render();
        window.requestAnimationFrame(this.update.bind(this));
    };
    Game.prototype.startGame = function () {
        this.asteroids = [];
        this.bullets = [];
        this.minimap = new Minimap(150, 10000);
        this.generateAsteroids();
        this.enemies = [];
        this.coins = [];
        this.targetLock = null;
        this.generateEnemies();
        this.createBoss();
        this.level = 0;
        this.message = "Level 1";
        this.messageTime = 120;
    };
    Game.prototype.nextLevel = function () {
        this.level++;
        if (this.level === 3) {
            this.won = true;
        }
        this.asteroids = [];
        this.bullets = [];
        this.targetLock = null;
        this.enemies = [];
        this.coins = [];
        this.player.health = this.player.maxHealth;
        this.player.shieldHealth = this.player.shieldMax;
        this.player.position.x = 0;
        this.player.position.y = 0;
        this.generateAsteroids();
        this.generateEnemies();
        this.createBoss();
        this.message = "Level " + (this.level + 1);
        this.messageTime = 120;
    };
    Game.prototype.render = function () {
        this.ctx.fillStyle = "rgb(20, 20, 20)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.shadowBlur = 5;
        for (var _i = 0, _a = this.background; _i < _a.length; _i++) {
            var star = _a[_i];
            this.ctx.shadowColor = "rgb(100, 100, 130)";
            this.ctx.beginPath();
            this.ctx.fillStyle = "rgb(100, 100, 130)";
            var xPos = (star.position.x - this.player.position.x / 50) % this.canvas.width;
            var yPos = (star.position.y - this.player.position.y / 50) % this.canvas.height;
            xPos += xPos < 0 ? this.canvas.width : 0;
            yPos += yPos < 0 ? this.canvas.height : 0;
            this.ctx.arc(xPos, yPos, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.shadowBlur = 0;
        if (this.won) {
            this.ctx.fillStyle = "white";
            this.ctx.font = "30px Courier New";
            this.ctx.fillText("You won!", this.canvas.width / 2, canvas.height / 2);
            return;
        }
        if (this.lost) {
            this.ctx.fillStyle = "white";
            this.ctx.font = "30px Courier New";
            this.ctx.fillText("You lost....", this.canvas.width / 2, canvas.height / 2);
            return;
        }
        for (var _b = 0, _c = this.particles; _b < _c.length; _b++) {
            var particle = _c[_b];
            particle.render(this.ctx);
        }
        for (var _d = 0, _e = this.asteroids; _d < _e.length; _d++) {
            var asteroid = _e[_d];
            asteroid.render(this.ctx, this.mousePos);
        }
        if (!this.started) {
            this.ctx.drawImage(this.images["target-grey"], this.mousePos.x - 32, this.mousePos.y - 32);
            this.ctx.font = "50px Courier New";
            this.ctx.textAlign = "center";
            this.ctx.fillStyle = "white";
            this.ctx.fillText("The Dark Void", this.canvas.width / 2, this.canvas.height / 2 - 200);
            this.ctx.font = "40px Courier New";
            this.ctx.fillText("Press any key to start", this.canvas.width / 2, this.canvas.height / 2);
            this.blockOpacity = 1 - (Math.abs(30 - this.transitionFrame) / 30);
            ctx.fillStyle = "rgba(0, 0, 0, " + this.blockOpacity + ")";
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }
        for (var _f = 0, _g = this.bullets; _f < _g.length; _f++) {
            var bullet = _g[_f];
            bullet.render(this.ctx);
        }
        for (var _h = 0, _j = this.enemies; _h < _j.length; _h++) {
            var enemy = _j[_h];
            enemy.render(this.ctx);
        }
        for (var _k = 0, _l = this.coins; _k < _l.length; _k++) {
            var coin = _l[_k];
            coin.render(this.ctx);
        }
        this.player.render(this.ctx);
        this.minimap.render(this.ctx, {
            "asteroids": this.asteroids,
            "player": this.player,
            "enemies": this.enemies
        });
        var cursorImage = this.images["cursor-green"];
        if (this.player.weapons[this.player.selectedWeapon].name === "Homing")
            cursorImage = this.images["target-grey"];
        this.targetLock = null;
        var targetX = null;
        var targetY = null;
        for (var _m = 0, _o = this.enemies; _m < _o.length; _m++) {
            var enemy = _o[_m];
            if (dist(this.mousePos.x - this.canvas.width / 2 + this.player.position.x, this.mousePos.y - this.canvas.height / 2 + this.player.position.y, enemy.position.x, enemy.position.y) < 100 &&
                this.player.weapons[this.player.selectedWeapon].id !== "flamethrower") {
                cursorImage = this.images["cursor-red"];
                if (this.player.weapons[this.player.selectedWeapon].name === "Homing")
                    cursorImage = this.images["target-red"];
                this.targetLock = enemy;
                targetX = game.rpx(enemy.position.x);
                targetY = game.rpy(enemy.position.y);
            }
        }
        for (var _p = 0, _q = this.asteroids; _p < _q.length; _p++) {
            var asteroid = _q[_p];
            for (var _r = 0, _s = asteroid.buildings; _r < _s.length; _r++) {
                var building = _s[_r];
                if (building.friendly)
                    continue;
                if (dist(asteroid.position.x + building.position.x, asteroid.position.y + building.position.y, this.mousePos.x - this.canvas.width / 2 + this.player.position.x, this.mousePos.y - this.canvas.height / 2 + this.player.position.y) < 100 &&
                    this.player.weapons[this.player.selectedWeapon].id !== "flamethrower") {
                    cursorImage = this.images["cursor-red"];
                    if (this.player.weapons[this.player.selectedWeapon].name === "Homing")
                        cursorImage = this.images["target-red"];
                    this.targetLock = building;
                    targetX = game.rpx(building.getX());
                    targetY = game.rpy(building.getY());
                }
            }
        }
        if (this.player.shieldUnlocked) {
            this.ctx.fillStyle = "black";
            this.ctx.fillRect(this.canvas.width / 2 - 200, this.canvas.height - 50, 195, 40);
            this.ctx.fillStyle = "red";
            this.ctx.fillRect(this.canvas.width / 2 - 195, this.canvas.height - 45, 185, 30);
            this.ctx.fillStyle = "green";
            this.ctx.fillRect(this.canvas.width / 2 - 195, this.canvas.height - 45, 185 * (Math.max(this.player.health, 0) / this.player.maxHealth), 30);
            this.ctx.fillStyle = "white";
            this.ctx.textAlign = "center";
            this.ctx.font = "15px Courier New";
            this.ctx.fillText("Health: " + Math.max(0, Math.round(this.player.health)) + "/" + this.player.maxHealth, this.canvas.width / 2 - 100, this.canvas.height - 25);
            this.ctx.fillStyle = "black";
            this.ctx.fillRect(this.canvas.width / 2 + 5, this.canvas.height - 50, 195, 40);
            this.ctx.fillStyle = "rgb(0, 100, 255)";
            this.ctx.fillRect(this.canvas.width / 2 + 10, this.canvas.height - 45, 185, 30);
            this.ctx.fillStyle = "blue";
            this.ctx.fillRect(this.canvas.width / 2 + 10, this.canvas.height - 45, 185 * (this.player.shieldHealth / this.player.shieldMax), 30);
            this.ctx.fillStyle = "white";
            this.ctx.fillText("Shield: " + Math.round(this.player.shieldHealth) + "/" + Math.round(this.player.shieldMax), this.canvas.width / 2 + 100, this.canvas.height - 25);
        }
        else {
            this.ctx.fillStyle = "black";
            this.ctx.fillRect(this.canvas.width / 2 - 200, this.canvas.height - 50, 400, 40);
            this.ctx.fillStyle = "red";
            this.ctx.fillRect(this.canvas.width / 2 - 195, this.canvas.height - 45, 390, 30);
            this.ctx.fillStyle = "green";
            this.ctx.fillRect(this.canvas.width / 2 - 195, this.canvas.height - 45, 390 * (this.player.health / this.player.maxHealth), 30);
            this.ctx.fillStyle = "white";
            this.ctx.textAlign = "center";
            this.ctx.font = "20px Courier New";
            this.ctx.fillText("Health: " + Math.round(this.player.health) + "/" + this.player.maxHealth, this.canvas.width / 2, this.canvas.height - 25);
        }
        for (var i = 0; i < this.player.weapons.length; i++) {
            var weapon = this.player.weapons[i];
            this.ctx.fillStyle = i === this.player.selectedWeapon ? "rgb(70, 70, 70)" : "rgb(110, 110, 110)";
            var x = this.canvas.width - (this.player.weapons.length - i) * 100;
            var y = this.canvas.height - 150;
            this.ctx.fillRect(x, y, 90, 140);
            for (var n = 0; n < 5; n++) {
                var sColor = this.player.selectedWeapon === i ? "blue" : "rgb(130, 130, 130)";
                this.ctx.fillStyle = weapon.maxReloadTime - weapon.reloadTime > weapon.maxReloadTime / 5 * n ? sColor : "rgb(150, 150, 150)";
                this.ctx.fillRect(x + 30, (5 - n) * 25 + y - 15, 50, 22);
            }
            this.ctx.save();
            this.ctx.translate(x + 10, y + 70);
            this.ctx.rotate(Math.PI / 2);
            this.ctx.font = "15px Courier New";
            this.ctx.fillStyle = "rgb(250, 250, 250)";
            this.ctx.textAlign = "center";
            this.ctx.fillText(weapon.name, 0, 0);
            this.ctx.restore();
        }
        this.ctx.drawImage(this.images["coin"], 50 - 16, canvas.height - 50 - 16, 32, 32);
        this.ctx.fillStyle = "white";
        this.ctx.font = "20px Arial";
        this.ctx.fillText(this.player.coins.toString(), 100, canvas.height - 45);
        if (this.shopDialog !== null) {
            var bx = (canvas.width - 600) / 2, by = (canvas.height - 500) / 2;
            this.ctx.fillStyle = "rgb(130, 130, 130)";
            this.ctx.fillRect(bx, by, 600, 500);
            for (var i = 0; i < this.shopDialog.items.length; i++) {
                var item = this.shopDialog.items[i];
                this.ctx.fillStyle = "rgb(110, 110, 110)";
                if (item.cost <= this.player.coins && !this.player.hasWeapon(item.id))
                    this.ctx.fillStyle = "rgb(90, 150, 90)";
                this.ctx.fillRect(bx + 15, by + 15 + 60 * i, 570, 50);
                this.ctx.fillStyle = "white";
                this.ctx.textAlign = "left";
                this.ctx.fillText(item.displayName, bx + 30, by + 46 + 60 * i);
                this.ctx.textAlign = "right";
                this.ctx.fillText(item.cost.toString(), bx + 570, by + 46 + 60 * i);
                this.ctx.beginPath();
                this.ctx.fillStyle = "yellow";
                this.ctx.arc(bx + 530, by + 40 + 60 * i, 10, 0, Math.PI * 2);
                this.ctx.fill();
            }
            this.ctx.fillStyle = "white";
            this.ctx.font = "20px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText("Press Escape to quit", canvas.width / 2, by + 450);
        }
        if (this.messageTime-- > 0) {
            this.ctx.font = "30px Courier New";
            this.ctx.fillStyle = "white";
            this.ctx.textAlign = "center";
            this.ctx.fillText(this.message, this.canvas.width / 2, this.canvas.height - 150);
        }
        if (this.shopDialog === null) {
            this.ctx.drawImage(cursorImage, (targetX !== null ? targetX - 32 : this.mousePos.x - 32), (targetY !== null ? targetY - 32 : this.mousePos.y - 32));
        }
        else {
            this.ctx.drawImage(this.images["target-grey"], this.mousePos.x - 32, this.mousePos.y - 32);
        }
    };
    Game.prototype.createBackground = function () {
        for (var i = 0; i < 100; i++) {
            this.background.push({
                position: new Vector2(Math.floor(Math.random() * this.canvas.width), Math.floor(Math.random() * this.canvas.height)),
                size: Math.floor(Math.random() * 2) + 2
            });
        }
    };
    Game.prototype.generateEnemies = function () {
        for (var i = 0; i < 20; i++) {
            var rand = Math.random();
            var enemy = null;
            if (rand < 0.33)
                enemy = Enemy;
            else if (rand < 0.66)
                enemy = TripleShotEnemy;
            else
                enemy = PowerfulEnemy;
            var x = 0, y = 0;
            var inAsteroid = false;
            do {
                inAsteroid = false;
                x = Math.floor(Math.random() * 20000) - 10000;
                y = Math.floor(Math.random() * 20000) - 10000;
                for (var _i = 0, _a = this.asteroids; _i < _a.length; _i++) {
                    var asteroid = _a[_i];
                    if (asteroid.pointInside(x, y))
                        inAsteroid = true;
                }
            } while (inAsteroid);
            this.enemies.push(new enemy(x, y, false, 20));
        }
    };
    Game.prototype.createBoss = function () {
        var angle = Math.random() * Math.PI * 2;
        var x = Math.cos(angle) * 15000;
        var y = Math.sin(angle) * 15000;
        var boss = this.level < 2 ? Boss : TripleShotBoss;
        this.enemies.push(new boss(x, y));
    };
    Game.prototype.generateAsteroids = function () {
        for (var i = 0; i < 300; i++) {
            this.asteroids.push(new Asteroid(Math.cos(i) * (Math.random() * 10000 + 3000) + Math.random() * 5000, Math.sin(i) * (Math.random() * 10000 + 3000) + Math.random() * 5000, 100, 1, 15, 40, false, ["150, 150, 150", "100, 100, 100", "170, 170, 170", "120, 120, 120"]));
        }
        for (var i = 0; i < 5; i++) {
            var r = Math.floor(Math.random() * 200);
            var g = Math.floor(Math.random() * 200);
            var b = Math.floor(Math.random() * 200);
            this.asteroids.push(new Asteroid(Math.floor(Math.random() * 30000) - 15000, Math.floor(Math.random() * 30000) - 15000, 1000, 0, 45, 500, true, [r + ", " + g + ", " + b, r - 40 + ", " + (g - 40) + ", " + (b - 40)]));
        }
        for (var i = this.asteroids.length - 1; i > -1; i--) {
            var ast = this.asteroids[i];
            second: for (var x = 0; x < this.asteroids.length; x++) {
                var ast2 = this.asteroids[x];
                if (dist(ast.position.x, ast.position.y, ast2.position.x, ast2.position.y) > ast.size + ast2.size + 150)
                    continue;
                if (ast === ast2)
                    continue;
                for (var _i = 0, _a = ast.structure; _i < _a.length; _i++) {
                    var point = _a[_i];
                    if (ast2.pointInside(crx(point.x, point.y, ast.rotation) + ast.position.x, cry(point.x, point.y, ast.rotation) + ast.position.y) && (!ast.isPlanet || ast2.isPlanet)) {
                        this.asteroids.splice(i, 1);
                        break second;
                    }
                }
            }
        }
    };
    Game.prototype.mousedown = function () {
        this.mouseDown = true;
        if (this.shopTarget !== null)
            this.shopDialog = this.shopTarget;
        if (this.shopDialog !== null) {
            var bx = (canvas.width - 600) / 2, by = (canvas.height - 500) / 2;
            var x = this.mousePos.x - bx;
            var y = this.mousePos.y - by;
            if (x < 10 || x > 590 || y < 10 || y > 490)
                return;
            var item = Math.floor(y / 60);
            if (item >= this.shopDialog.items.length || item < 0)
                return;
            var selected = this.shopDialog.items[item];
            if (this.player.hasWeapon(selected.id) || this.player.coins < selected.cost)
                return;
            this.player.buy(selected.id);
            this.shopDialog.items.splice(item, 1);
            this.player.coins -= selected.cost;
        }
    };
    Game.prototype.mouseup = function () {
        this.mouseDown = false;
    };
    Game.prototype.mousemove = function (x, y) {
        this.mousePos.x = x;
        this.mousePos.y = y;
    };
    Game.prototype.keydown = function (key) {
        if (!this.started && key.length === 1) {
            this.transitioning = true;
        }
        this.keys[key] = true;
        if (key === "tab") {
            this.player.selectedWeapon = (this.player.selectedWeapon + 1) % this.player.weapons.length;
        }
        if (key === "escape" && this.shopDialog !== null)
            this.shopDialog = null;
        this.doMusic();
    };
    Game.prototype.keyup = function (key) {
        this.keys[key] = false;
    };
    Game.prototype.rpx = function (x) {
        return x - this.player.position.x + this.canvas.width / 2;
    };
    Game.prototype.rpy = function (y) {
        return y - this.player.position.y + this.canvas.height / 2;
    };
    return Game;
}());
