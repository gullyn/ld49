class Game
{
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private lastFrameTime: number;

	private mousePos: Vector2;
	private mouseDown: boolean;
	public keys: { [id: string]: boolean };

	public player: Player;
	private asteroids: Asteroid[];
	private bullets: Bullet[];
	private particles: Particle[];
	private enemies: Enemy[];
	private coins: Coin[];

	private minimap: Minimap;
	public images: { [id: string]: HTMLImageElement };
	private targetLock: Enemy | Building;

	private background: { position: Vector2, size: number }[];
	private level: number;

	private started: boolean;
	public shopTarget: Shop;
	public shopDialog: Shop;
	public blockOpacity: number;
	public transitioning: boolean;
	public transitionFrame: number;

	private musicNum: number;
	private music: HTMLAudioElement;

	public won: boolean;
	public lost: boolean;

	public message: string;
	public messageTime: number;

	constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D)
	{
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

	private doMusic(): void
	{
		if (this.music !== null && !this.music.ended)
			return;

		this.music = audio(`audio/music${(this.musicNum % 3) + 1}.mp3`);
		this.music.volume = 0.2;
		this.music.play();
	}

	public update(): void
	{
		if (this.player.health <= 0)
			this.lost = true;
		
		if (this.won || this.lost)
		{
			this.render();
			window.requestAnimationFrame(this.update.bind(this));
			return;
		}
		if (this.music !== null)
			this.doMusic();
		let currentTime: number = new Date().getTime();
		let delta: number = (new Date().getTime() - this.lastFrameTime) / (1000 / 60);
		this.lastFrameTime = currentTime;
		if (this.transitioning)
			this.transitionFrame++;

		if (this.transitionFrame === 30 && this.transitioning && !this.started)
		{
			this.started = true;
			this.startGame();
		}

		if (this.transitionFrame >= 60)
			this.transitioning = false;

		if (!this.started || this.shopDialog !== null)
		{
			this.render();
			window.requestAnimationFrame(this.update.bind(this));
			return;
		}

		this.player.update(delta, { keys: this.keys, asteroids: this.asteroids });

		if (this.mouseDown)
		{
			let bullets: Bullet[] = this.player.shoot(this.targetLock);

			if (bullets.length > 0)
				audio("audio/shoot.wav").play();

			for (let bullet of bullets)
				this.bullets.push(bullet);
		}

		for (let i = this.asteroids.length - 1; i > -1; i--)
		{
			let as = this.asteroids[i];
			if (as.update(delta, {
				"asteroids": this.asteroids,
				"player": this.player,
				"enemies": this.enemies
			}))
			{
				for (let particle of explosion(as.position.x, as.position.y, 150, 0, Math.PI * 2))
					this.particles.push(particle);
				this.asteroids.splice(i, 1);
			}
		}

		for (let i = this.coins.length - 1; i > -1; i--)
		{
			if (this.coins[i].update(delta, this.player))
			{
				this.coins.splice(i, 1);
				this.player.coins++;
			}
		}

		for (let i = this.bullets.length - 1; i > -1; i--)
			if (this.bullets[i].update(delta, {
				"asteroids": this.asteroids,
				"enemies": this.enemies,
				"player": this.player
			}))
				this.bullets.splice(i, 1);

		for (let i = this.particles.length - 1; i > -1; i--)
			if (this.particles[i].update(delta))
				this.particles.splice(i, 1);

		for (let i = this.enemies.length - 1; i > -1; i--)
		{
			let en = this.enemies[i];
			if (dist(en.position.x, en.position.y, this.player.position.x, this.player.position.y) > 2500)
				continue;

			if (en.update(delta, {
				"asteroids": this.asteroids,
				"player": this.player
			}))
			{
				if (en.isBoss)
				{
					this.nextLevel();
					this.transitioning = true;
					this.transitionFrame = 0;
				}
				else
				{
					for (let particle of explosion(en.position.x, en.position.y, 150, 0, Math.PI * 2))
						this.particles.push(particle);
					this.coins.push(new Coin(en.position.x, en.position.y));
					this.enemies.splice(i, 1);
				}
			}
		}

		for (let asteroid of this.asteroids)
		{
			for (let i = asteroid.buildings.length - 1; i > -1; i--)
			{
				let building = asteroid.buildings[i];
				if (asteroid.buildings[i].update(delta))
				{
					for (let particle of explosion(
						building.position.x + building.asteroidPosition.x,
						building.position.y + building.asteroidPosition.y,
						150, 0, Math.PI * 2))
						this.particles.push(particle);
					asteroid.buildings.splice(i, 1);
				}
				else
					for (let bullet of asteroid.buildings[i].shoot(this.player))
						this.bullets.push(bullet);
			}
		}

		for (let enemy of this.enemies)
			for (let bullet of enemy.shoot(this.player))
				this.bullets.push(bullet);

		this.render();
		window.requestAnimationFrame(this.update.bind(this));
	}

	private startGame(): void
	{
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
	}

	private nextLevel(): void
	{
		this.level++;

		if (this.level === 3)
		{
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
	}

	private render(): void
	{
		this.ctx.fillStyle = "rgb(20, 20, 20)";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.ctx.shadowBlur = 5;
		for (let star of this.background)
		{
			this.ctx.shadowColor = "rgb(100, 100, 130)";
			this.ctx.beginPath();
			this.ctx.fillStyle = "rgb(100, 100, 130)";
			let xPos = (star.position.x - this.player.position.x / 50) % this.canvas.width;
			let yPos = (star.position.y - this.player.position.y / 50) % this.canvas.height;

			xPos += xPos < 0 ? this.canvas.width : 0;
			yPos += yPos < 0 ? this.canvas.height : 0;

			this.ctx.arc(xPos, yPos, star.size, 0, Math.PI * 2);
			this.ctx.fill();
		}
		this.ctx.shadowBlur = 0;

		if (this.won)
		{
			this.ctx.fillStyle = "white";
			this.ctx.font = "30px Courier New";
			this.ctx.fillText("You won!", this.canvas.width / 2, canvas.height / 2);
			return;
		}

		if (this.lost)
		{
			this.ctx.fillStyle = "white";
			this.ctx.font = "30px Courier New";
			this.ctx.fillText("You lost....", this.canvas.width / 2, canvas.height / 2);
			return;
		}

		for (let particle of this.particles)
			particle.render(this.ctx);

		for (let asteroid of this.asteroids)
			asteroid.render(this.ctx, this.mousePos);

		if (!this.started)
		{
			this.blockOpacity = 1 - (Math.abs(30 - this.transitionFrame) / 30);
			ctx.fillStyle = `rgba(0, 0, 0, ${this.blockOpacity})`;
			ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

			this.ctx.drawImage(this.images["target-grey"], this.mousePos.x - 32, this.mousePos.y - 32);

			this.ctx.font = "40px Courier New";
			this.ctx.textAlign = "center";
			this.ctx.fillStyle = "white";
			this.ctx.fillText("Press any key to start", this.canvas.width / 2, this.canvas.height / 2);

			return;
		}

		for (let bullet of this.bullets)
			bullet.render(this.ctx);

		for (let enemy of this.enemies)
			enemy.render(this.ctx);

		for (let coin of this.coins)
			coin.render(this.ctx);

		this.player.render(this.ctx);
		this.minimap.render(this.ctx, {
			"asteroids": this.asteroids,
			"player": this.player,
			"enemies": this.enemies
		});

		let cursorImage: HTMLImageElement = this.images["cursor-green"];

		if (this.player.weapons[this.player.selectedWeapon].name === "Homing")
			cursorImage = this.images["target-grey"];

		this.targetLock = null;
		let targetX = null;
		let targetY = null;

		for (let enemy of this.enemies)
		{
			if (dist(this.mousePos.x - this.canvas.width / 2 + this.player.position.x,
					this.mousePos.y - this.canvas.height / 2 + this.player.position.y,
					enemy.position.x,
					enemy.position.y) < 100 &&
				this.player.weapons[this.player.selectedWeapon].id !== "flamethrower")
			{
				cursorImage = this.images["cursor-red"];
				if (this.player.weapons[this.player.selectedWeapon].name === "Homing")
					cursorImage = this.images["target-red"];
				this.targetLock = enemy;
				targetX = game.rpx(enemy.position.x);
				targetY = game.rpy(enemy.position.y);
			}
		}

		for (let asteroid of this.asteroids)
		{
			for (let building of asteroid.buildings)
			{
				if (building.friendly)
					continue;

				if (dist(asteroid.position.x + building.position.x,
						asteroid.position.y + building.position.y,
						this.mousePos.x - this.canvas.width / 2 + this.player.position.x,
						this.mousePos.y - this.canvas.height / 2 + this.player.position.y) < 100 &&
					this.player.weapons[this.player.selectedWeapon].id !== "flamethrower")
				{
					cursorImage = this.images["cursor-red"];
					if (this.player.weapons[this.player.selectedWeapon].name === "Homing")
						cursorImage = this.images["target-red"];
					this.targetLock = building;
					targetX = game.rpx(building.getX());
					targetY = game.rpy(building.getY());
				}
			}
		}

		if (this.player.shieldUnlocked)
		{
			this.ctx.fillStyle = "black";
			this.ctx.fillRect(this.canvas.width / 2 - 200, this.canvas.height - 50, 195, 40);
			this.ctx.fillStyle = "red";
			this.ctx.fillRect(this.canvas.width / 2 - 195, this.canvas.height - 45, 185, 30);
			this.ctx.fillStyle = "green";
			this.ctx.fillRect(this.canvas.width / 2 - 195, this.canvas.height - 45, 185 * (Math.max(this.player.health, 0) / this.player.maxHealth), 30);
			this.ctx.fillStyle = "white";
			this.ctx.textAlign = "center";
			this.ctx.font = "15px Courier New";
			this.ctx.fillText(`Health: ${Math.max(0, Math.round(this.player.health))}/${this.player.maxHealth}`, this.canvas.width / 2 - 100, this.canvas.height - 25);

			this.ctx.fillStyle = "black";
			this.ctx.fillRect(this.canvas.width / 2 + 5, this.canvas.height - 50, 195, 40);
			this.ctx.fillStyle = "rgb(0, 100, 255)";
			this.ctx.fillRect(this.canvas.width / 2 + 10, this.canvas.height - 45, 185, 30);
			this.ctx.fillStyle = "blue";
			this.ctx.fillRect(this.canvas.width / 2 + 10, this.canvas.height - 45, 185 * (this.player.shieldHealth / this.player.shieldMax), 30);
			this.ctx.fillStyle = "white";
			this.ctx.fillText(`Shield: ${Math.round(this.player.shieldHealth)}/${Math.round(this.player.shieldMax)}`, this.canvas.width / 2 + 100, this.canvas.height - 25);
		}
		else
		{
			this.ctx.fillStyle = "black";
			this.ctx.fillRect(this.canvas.width / 2 - 200, this.canvas.height - 50, 400, 40);
			this.ctx.fillStyle = "red";
			this.ctx.fillRect(this.canvas.width / 2 - 195, this.canvas.height - 45, 390, 30);
			this.ctx.fillStyle = "green";
			this.ctx.fillRect(this.canvas.width / 2 - 195, this.canvas.height - 45, 390 * (this.player.health / this.player.maxHealth), 30);
			this.ctx.fillStyle = "white";
			this.ctx.textAlign = "center";
			this.ctx.font = "20px Courier New";
			this.ctx.fillText(`Health: ${Math.round(this.player.health)}/${this.player.maxHealth}`, this.canvas.width / 2, this.canvas.height - 25);
		}

		for (let i = 0; i < this.player.weapons.length; i++)
		{
			let weapon = this.player.weapons[i];
			this.ctx.fillStyle = i === this.player.selectedWeapon ? "rgb(70, 70, 70)" : "rgb(110, 110, 110)";
			let x = this.canvas.width - (this.player.weapons.length - i) * 100;
			let y = this.canvas.height - 150;
			this.ctx.fillRect(x, y, 90, 140);
			for (let n = 0; n < 5; n++)
			{
				let sColor = this.player.selectedWeapon === i ? "blue" : "rgb(130, 130, 130)";
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

		if (this.shopDialog !== null)
		{
			let bx = (canvas.width - 600) / 2, by = (canvas.height - 500) / 2;
			this.ctx.fillStyle = "rgb(130, 130, 130)";
			this.ctx.fillRect(bx, by, 600, 500);

			for (let i = 0; i < this.shopDialog.items.length; i++)
			{
				let item = this.shopDialog.items[i];
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

		if (this.messageTime-- > 0)
		{
			this.ctx.font = "30px Courier New";
			this.ctx.fillStyle = "white";
			this.ctx.textAlign = "center";
			this.ctx.fillText(this.message, this.canvas.width / 2, this.canvas.height - 150);
		}

		if (this.shopDialog === null)
		{
			this.ctx.drawImage(
				cursorImage,
				(targetX !== null ? targetX - 32 : this.mousePos.x - 32),
				(targetY !== null ? targetY - 32 : this.mousePos.y - 32)
			);
		}
		else
		{
			this.ctx.drawImage(
				this.images["target-grey"],
				this.mousePos.x - 32,
				this.mousePos.y - 32
			);
		}
	}

	private createBackground(): void
	{
		for (let i = 0; i < 100; i++)
		{
			this.background.push({
				position: new Vector2(
					Math.floor(Math.random() * this.canvas.width),
					Math.floor(Math.random() * this.canvas.height)
				),
				size: Math.floor(Math.random() * 2) + 2
			});
		}
	}

	private generateEnemies(): void
	{
		for (let i = 0; i < 20; i++)
		{
			let rand = Math.random();
			let enemy: typeof Enemy = null;
			if (rand < 0.33)
				enemy = Enemy;
			else if (rand < 0.66)
				enemy = TripleShotEnemy;
			else
				enemy = PowerfulEnemy;
			let x = 0, y = 0;
			let inAsteroid = false;
			do {
				inAsteroid = false;
				x = Math.floor(Math.random() * 20000) - 10000;
				y = Math.floor(Math.random() * 20000) - 10000;

				for (let asteroid of this.asteroids)
					if (asteroid.pointInside(x, y))
						inAsteroid = true;
			} while (inAsteroid);

			this.enemies.push(new enemy(x, y, false, 20));
		}
	}

	private createBoss(): void
	{
		let angle = Math.random() * Math.PI * 2;
		let x = Math.cos(angle) * 15000;
		let y = Math.sin(angle) * 15000;

		let boss = this.level < 2 ? Boss : TripleShotBoss;
		this.enemies.push(new boss(x, y));
	}

	private generateAsteroids(): void
	{
		for (let i = 0; i < 300; i++)
		{
			this.asteroids.push(new Asteroid(
				Math.cos(i) * (Math.random() * 10000 + 3000) + Math.random() * 5000,
				Math.sin(i) * (Math.random() * 10000 + 3000) + Math.random() * 5000,
				100, 1, 15, 40, false,
				["150, 150, 150", "100, 100, 100", "170, 170, 170", "120, 120, 120"]
			));
		}

		for (let i = 0; i < 5; i++)
		{
			let r = Math.floor(Math.random() * 200);
			let g = Math.floor(Math.random() * 200);
			let b = Math.floor(Math.random() * 200);

			this.asteroids.push(new Asteroid(
				Math.floor(Math.random() * 30000) - 15000,
				Math.floor(Math.random() * 30000) - 15000,
				1000, 0, 45, 500, true,
				[`${r}, ${g}, ${b}`, `${r - 40}, ${g - 40}, ${b - 40}`]
			));
		}

		for (let i = this.asteroids.length - 1; i > -1; i--)
		{
			let ast = this.asteroids[i];
			second: for (let x = 0; x < this.asteroids.length; x++)
			{
				let ast2 = this.asteroids[x];

				if (dist(ast.position.x, ast.position.y, ast2.position.x, ast2.position.y) > ast.size + ast2.size + 150)
					continue;

				if (ast === ast2)
					continue;

				for (let point of ast.structure)
				{
					if (ast2.pointInside(
						crx(point.x, point.y, ast.rotation) + ast.position.x,
						cry(point.x, point.y, ast.rotation) + ast.position.y) && (!ast.isPlanet || ast2.isPlanet))
					{
						this.asteroids.splice(i, 1);
						break second;
					}
				}
			}
		}
	}

	public mousedown(): void
	{
		this.mouseDown = true;

		if (this.shopTarget !== null)
			this.shopDialog = this.shopTarget;

		if (this.shopDialog !== null)
		{
			let bx = (canvas.width - 600) / 2, by = (canvas.height - 500) / 2;

			let x = this.mousePos.x - bx;
			let y = this.mousePos.y - by;

			if (x < 10 || x > 590 || y < 10 || y > 490)
				return;

			let item = Math.floor(y / 60);

			if (item >= this.shopDialog.items.length || item < 0)
				return;

			let selected = this.shopDialog.items[item];

			if (this.player.hasWeapon(selected.id) || this.player.coins < selected.cost)
				return;

			this.player.buy(selected.id);
			this.shopDialog.items.splice(item, 1);
			this.player.coins -= selected.cost;
		}
	}

	public mouseup(): void
	{
		this.mouseDown = false;
	}

	public mousemove(x: number, y: number): void
	{
		this.mousePos.x = x;
		this.mousePos.y = y;
	}

	public keydown(key: string): void
	{
		if (!this.started && key.length === 1)
		{
			this.transitioning = true;
		}
		this.keys[key] = true;
		if (key === "tab")
		{
			this.player.selectedWeapon = (this.player.selectedWeapon + 1) % this.player.weapons.length;
		}

		if (key === "escape" && this.shopDialog !== null)
			this.shopDialog = null;

		this.doMusic();
	}

	public keyup(key: string): void
	{
		this.keys[key] = false;
	}

	public rpx(x: number): number
	{
		return x - this.player.position.x + this.canvas.width / 2;
	}

	public rpy(y: number): number
	{
		return y - this.player.position.y + this.canvas.height / 2;
	}
}