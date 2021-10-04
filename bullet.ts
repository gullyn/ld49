class Bullet extends Entity
{
	private speed: number;
	private range: number;
	private travelled: number;
	private damage: number;
	private owner: Entity | Building;

	constructor(x: number, y: number, rotation: number, speed: number, range: number, damage: number, owner: Entity | Building)
	{
		super(x, y);

		this.rotation = rotation;
		this.speed = speed;
		this.owner = owner;
		this.range = range;
		this.damage = damage;
		this.travelled = 0;

		if (this.owner === game.player)
			this.damage *= 1 + game.player.damageBonus * 0.2;
	}

	public update(delta: number, data: {
		"asteroids": Asteroid[],
		"enemies": Enemy[],
		"player": Player
	}): boolean
	{
		this.move(delta);
		let tx = Math.cos(this.rotation) * this.speed * delta;
		let ty = Math.sin(this.rotation) * this.speed * delta;

		this.travelled += Math.abs(tx) + Math.abs(ty);
		this.position.x += tx;
		this.position.y += ty;

		for (let asteroid of data["asteroids"])
		{
			let d = dist(asteroid.position.x, asteroid.position.y, this.position.x, this.position.y);
			if (d > asteroid.size + 75)
				continue;

			if (asteroid.pointInside(this.position.x, this.position.y))
			{
				asteroid.takeDamage(this.damage);
				return true;
			}

			for (let building of asteroid.buildings)
			{
				if (dist(building.position.x + building.asteroidPosition.x,
						 building.position.y + building.asteroidPosition.y,
						 this.position.x,
						 this.position.y) < 50 && this.owner !== building)
				{
					building.takeDamage(this.damage);
					return true;
				}
			}
		}

		let p = data["player"];

		if (dist(p.position.x, p.position.y, this.position.x, this.position.y) <= 20 && this.owner !== p)
		{
			p.takeDamage(this.damage);
			return true;
		}

		if (this.owner === p)
		{
			for (let enemy of data["enemies"])
			{
				if (dist(enemy.position.x, enemy.position.y, this.position.x, this.position.y) <= 20)
				{
					enemy.takeDamage(this.damage);
					return true;
				}
			}
		}

		if (this.range < this.travelled)
			return true;

		return false;
	}

	public render(ctx: CanvasRenderingContext2D)
	{
		ctx.shadowBlur = 5;
		ctx.save();
		ctx.translate(game.rpx(this.position.x), game.rpy(this.position.y));
		ctx.rotate(this.rotation - Math.PI / 2);
		ctx.fillStyle = "red";
		ctx.fillRect(-5, -10, 10, 20);
		ctx.restore();
		ctx.shadowBlur = 0;
	}

	public move(delta: number): void {}
}

class HomingBullet extends Bullet
{
	private target: Enemy | Building;

	constructor(x: number, y: number, rotation: number,
		speed: number, range: number, damage: number,
		owner: Entity | Building, target: Enemy | Building)
	{
		super(x, y, rotation, speed, range, damage, owner);
		this.target = target;
	}

	public move(delta: number): void
	{
		if (this.target.health <= 0)
			return;

		let angle = Math.atan2(this.target.getY() - this.position.y, this.target.getX() - this.position.x);
		this.rotation += this.rotateTo(angle) * (Math.PI / 32) * delta;
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
}

class FlamethrowerBullet extends Bullet
{
	constructor(x: number, y: number, rotation: number,
		speed: number, range: number, damage: number, owner: Entity | Building)
	{
		super(x, y, rotation, speed, range, damage, owner);
	}

	public render(ctx: CanvasRenderingContext2D)
	{
		ctx.shadowBlur = 5;
		ctx.save();
		ctx.translate(game.rpx(this.position.x), game.rpy(this.position.y));
		ctx.rotate(this.rotation - Math.PI / 2);
		ctx.fillStyle = "orange";
		ctx.fillRect(-5, -5, 10, 10);
		ctx.restore();
		ctx.shadowBlur = 0;
	}
}

class PowerfulBullet extends Bullet
{
	constructor(x: number, y: number, rotation: number,
		speed: number, range: number, damage: number, owner: Entity | Building)
	{
		super(x, y, rotation, speed, range, damage, owner);
	}

	public render(ctx: CanvasRenderingContext2D)
	{
		ctx.shadowBlur = 10;
		ctx.save();
		ctx.translate(game.rpx(this.position.x), game.rpy(this.position.y));
		ctx.rotate(this.rotation - Math.PI / 2);
		ctx.fillStyle = "blue";
		ctx.fillRect(-10, -10, 20, 20);
		ctx.restore();
		ctx.shadowBlur = 0;
	}
}