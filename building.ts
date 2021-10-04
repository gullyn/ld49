class Building
{
	public position: Vector2;
	public angle: number;
	public friendly: boolean;

	public asteroidPosition: Vector2;
	public hitTime: number;
	public health: number;

	constructor(x: number, y: number, angle: number, isFriendly: boolean, asteroidPosition: Vector2)
	{
		this.position = new Vector2(x, y);
		this.angle = angle;
		this.friendly = isFriendly;
		this.asteroidPosition = asteroidPosition;
		this.hitTime = 0;
	}

	public render(ctx: CanvasRenderingContext2D, x: number, y: number, mousePos: Vector2): void {}

	public update(delta: number): boolean { return false }
	public takeDamage(damage: number): void {}
	public shoot(player: Player): Bullet[] { return [] }

	public getX(): number
	{
		return this.position.x + this.asteroidPosition.x;
	}

	public getY(): number
	{
		return this.position.y + this.asteroidPosition.y;
	}
}

class Turret extends Building
{
	public turretAngle: number;

	private reloadTime: number;
	private maxReloadTime: number;

	public health: number;

	constructor(x: number, y: number, angle: number, asteroidPosition: Vector2)
	{
		super(x, y, angle, false, asteroidPosition);
		this.turretAngle = 0;

		this.reloadTime = 40;
		this.maxReloadTime = 40;

		this.health = 25;
	}

	public update(delta: number): boolean
	{
		if (this.health <= 0)
			return true;

		this.reloadTime -= delta;
		this.hitTime -= delta;
		
		return false;
	}

	public render(ctx: CanvasRenderingContext2D, x: number, y: number, mousePos: Vector2): void
	{
		ctx.save();
		ctx.translate(game.rpx(x + this.position.x), game.rpy(y + this.position.y));
		ctx.rotate(this.angle);
		ctx.fillStyle = this.hitTime > 0 ? "rgb(120, 120, 120)" : "rgb(100, 100, 100)";
		ctx.beginPath();
		ctx.arc(0, -30, 30, 0, Math.PI);
		ctx.fill();
		ctx.restore();
	}

	public takeDamage(damage: number): void
	{
		this.health -= damage;
		this.hitTime = 10;
	}

	public shoot(player: Player): Bullet[]
	{
		if (this.reloadTime > 0)
			return [];

		this.reloadTime = this.maxReloadTime;
		let angle = Math.atan2(
			player.position.y - (this.position.y + this.asteroidPosition.y),
			player.position.x - (this.position.x + this.asteroidPosition.x)
		);
		if (Math.abs(Math.cos(angle) - Math.cos(this.angle + Math.PI / 2)) +
			Math.abs(Math.sin(angle) - Math.sin(this.angle + Math.PI / 2)) > 2 ||
			dist(this.position.x + this.asteroidPosition.x, this.position.y + this.asteroidPosition.y, player.position.x, player.position.y) > 900)
			return [];

		return [new Bullet(this.position.x + this.asteroidPosition.x, this.position.y + this.asteroidPosition.y, angle, 12, 1500, 3, this)];
	}
}

class Shop extends Building
{
	public items: {
		id: string,
		displayName: string,
		cost: number
	}[];

	constructor(x: number, y: number, angle: number, asteroidPosition: Vector2)
	{
		super(x, y, angle, true, asteroidPosition);
		this.items = [];

		let items = [{
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

		for (let i = 0; i < Math.floor(Math.random() * 2) + 1; i++)
		{
			let selected = items[Math.floor(Math.random() * items.length)];
			this.items.push({
				id: selected.id,
				displayName: selected.displayName,
				cost: selected.cost + Math.floor(Math.random() * 4) - 2
			});
		}
	}

	public render(ctx: CanvasRenderingContext2D, x: number, y: number, mousePos: Vector2)
	{
		game.shopTarget = null;
		let rpx = game.rpx(x + this.position.x);
		let rpy = game.rpy(y + this.position.y);
		ctx.save();
		ctx.translate(rpx, rpy);
		ctx.rotate(this.angle + Math.PI);
		ctx.fillStyle = "rgb(100, 100, 100)";
		if (Math.abs(rpx - mousePos.x) + Math.abs(rpy - mousePos.y) < 60 && game.started)
		{
			game.shopTarget = this;
		}
		ctx.drawImage(game.shopTarget === this ? game.images["shop1"] : game.images["shop"], -64, -64, 128, 128);
		ctx.restore();
	}
}