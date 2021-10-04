class Enemy extends Entity
{
	private velocity: number;
	private maxVelocity: number;

	public reloadTime: number;
	public maxReloadTime: number;

	public health: number;
	public maxHealth: number;

	public asteroidPosition: Vector2;
	public isBoss: boolean;

	constructor(x: number, y: number, boss: boolean, health: number)
	{
		super(x, y);

		this.velocity = 0;
		this.maxVelocity = 5;

		this.reloadTime = 60;
		this.maxReloadTime = 60;

		this.health = health;
		this.maxHealth = 20;
		this.asteroidPosition = new Vector2(0, 0);
		this.isBoss = boss;
	}

	public update(delta: number, data: {
		"player": Player,
		"asteroids": Asteroid[]
	}): boolean
	{
		if (this.health <= 0)
			return true;
			
		this.reloadTime -= delta;
		this.hitTime -= delta;
		let p = data["player"];

		let mul = dist(this.position.x, this.position.y, p.position.x, p.position.y) < 400 ? -0.5 : 1;
		this.velocity = Math.min(this.maxVelocity, this.velocity + 0.07 * delta * mul);
		
		this.rotation += this.rotateTo(Math.atan2(p.position.y - this.position.y, p.position.x - this.position.x)) * Math.PI / 64 * delta;

		let newX: number = Math.cos(this.rotation) * this.velocity * delta + this.position.x;
		let newY: number = Math.sin(this.rotation) * this.velocity * delta + this.position.y;

		let colliding: boolean = false;

		for (let asteroid of data["asteroids"])
		{
			if (asteroid.pointInside(crx(-20, -30, this.rotation) + newX, cry(-20, -30, this.rotation) + newY) ||
				asteroid.pointInside(crx(20, -30, this.rotation) + newX, cry(20, -30, this.rotation) + newY) ||
				asteroid.pointInside(crx(-20, 30, this.rotation) + newX, cry(-20, 30, this.rotation) + newY) ||
				asteroid.pointInside(crx(20, 30, this.rotation) + newX, cry(20, 30, this.rotation) + newY))
			{
				colliding = true;
				this.velocity = 0;
			}
		}

		if (!colliding)
		{
			this.position.x = newX;
			this.position.y = newY;	
		}

		return false;
	}

	public render(ctx: CanvasRenderingContext2D)
	{
		ctx.save();
		ctx.translate(game.rpx(this.position.x), game.rpy(this.position.y));
		ctx.rotate(this.rotation + Math.PI / 2);
		ctx.drawImage(game.images["enemy1"], -32, -32, 64, 64);
		ctx.restore();
	}

	public shoot(player: Player): Bullet[]
	{
		if (this.reloadTime > 0)
			return [];

		this.reloadTime = this.maxReloadTime;
		let angle = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x);
		return [new Bullet(this.position.x, this.position.y, angle, 12, 1500, 5, this)];
	}

	private rotateTo(rotation: number): number
	{
		let tempr = this.rotation, r1 = tempr, n1 = 0, n2 = 0;
		let r = ((rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
		while (Math.abs(r - r1) > Math.PI / 32)
		{
			tempr += Math.PI / 64;
			r1 = ((tempr % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
			n1++;
		}
		tempr = this.rotation, r1 = tempr;
		while (Math.abs(r - r1) > Math.PI / 32)
		{
			tempr -= Math.PI / 64;
			r1 = ((tempr % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
			n2++;
		}
		return n1 <= n2 ? 1 : -1;
	}

	public takeDamage(damage: number): void
	{
		this.hitTime = 10;
		this.health -= damage;
	}
}

class TripleShotEnemy extends Enemy
{
	constructor(x: number, y: number)
	{
		super(x, y, false, 20);
	}

	shoot(player: Player)
	{
		if (this.reloadTime > 0)
			return [];

		this.reloadTime = this.maxReloadTime;
		let angle = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x);
		return [
			new Bullet(this.position.x, this.position.y, angle - Math.PI / 16, 12, 1500, 1, this),
			new Bullet(this.position.x, this.position.y, angle, 12, 1500, 1, this),
			new Bullet(this.position.x, this.position.y, angle + Math.PI / 16, 12, 1500, 1, this)
		];
	}
}

class PowerfulEnemy extends Enemy
{
	constructor(x: number, y: number)
	{
		super(x, y, false, 30);

		this.maxReloadTime = 60;
	}

	public render(ctx: CanvasRenderingContext2D)
	{
		ctx.save();
		ctx.translate(game.rpx(this.position.x), game.rpy(this.position.y));
		ctx.rotate(this.rotation + Math.PI / 2);
		ctx.drawImage(game.images["enemy3"], -48, -48, 96, 96);
		ctx.restore();
	}

	shoot(player: Player)
	{
		if (this.reloadTime > 0)
			return [];

		this.reloadTime = this.maxReloadTime;
		let angle = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x);
		return [
			new PowerfulBullet(this.position.x, this.position.y, angle, 9, 2000, 5, this)
		];
	}
}

class Boss extends Enemy
{
	constructor(x: number, y: number)
	{
		super(x, y, true, 150);
		this.reloadTime = 0;
		this.maxReloadTime = 60;
	}

	public render(ctx: CanvasRenderingContext2D)
	{
		ctx.save();
		ctx.translate(game.rpx(this.position.x), game.rpy(this.position.y));
		ctx.rotate(this.rotation + Math.PI / 2);
		ctx.drawImage(game.images["enemy1"], -64, -64, 128, 128);
		ctx.restore();
	}

	public shoot(): Bullet[]
	{
		if (this.reloadTime > 0)
			return [];

		this.reloadTime = this.maxReloadTime;
		let bullets: Bullet[] = [];

		for (let i = 0; i < 25; i++)
		{
			bullets.push(new Bullet(this.position.x, this.position.y, (Math.PI * 2) * (i / 25), 10, 1000, 3, this));
		}

		return bullets;
	}
}

class TripleShotBoss extends Enemy
{
	constructor(x: number, y: number)
	{
		super(x, y, true, 350);
		this.reloadTime = 0;
		this.maxReloadTime = 60;
	}

	public render(ctx: CanvasRenderingContext2D)
	{
		ctx.save();
		ctx.translate(game.rpx(this.position.x), game.rpy(this.position.y));
		ctx.rotate(this.rotation + Math.PI / 2);
		ctx.drawImage(game.images["enemy2"], -64, -64, 128, 128);
		ctx.restore();
	}

	public shoot(player: Player): Bullet[]
	{
		if (this.reloadTime > 0)
			return [];

		this.reloadTime = this.maxReloadTime;
		let bullets: Bullet[] = [];
		let angle = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x);

		bullets.push(new PowerfulBullet(this.position.x, this.position.y, angle + Math.PI / 16, 10, 1000, 5, this));
		bullets.push(new PowerfulBullet(this.position.x, this.position.y, angle, 10, 1000, 5, this));
		bullets.push(new PowerfulBullet(this.position.x, this.position.y, angle - Math.PI / 16, 10, 1000, 5, this));

		return bullets;
	}
}