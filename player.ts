class Player extends Entity
{
	private velocity: number;
	private maxVelocity: number;

	public health: number;
	public maxHealth: number;

	public shieldUnlocked: boolean;
	public shieldHealth: number;
	public shieldMax: number;

	public weapons: {
		reloadTime: number,
		maxReloadTime: number,
		name: string,
		id: string
	}[];
	public selectedWeapon: number;
	public coins: number;

	public damageBonus: number;
	public shootingBonus: number;

	constructor(x: number, y: number)
	{
		super(x, y);

		this.velocity = 0;
		this.maxVelocity = 10;

		this.health = 100;
		this.maxHealth = 100;

		this.shieldUnlocked = true;
		this.shieldHealth = 25;
		this.shieldMax = 25;
		this.coins = 0;

		this.weapons = [{
			reloadTime: 0,
			maxReloadTime: 20,
			name: "Machine Gun",
			id: "machine-gun"
		}];
		this.selectedWeapon = 0;

		this.damageBonus = 0;
		this.shootingBonus = 0;
	}

	public update(delta: number, data: {
		"keys": { [id: string]: boolean },
		"asteroids": Asteroid[]
	}): void
	{
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
	}

	public render(ctx: CanvasRenderingContext2D): void
	{
		ctx.save();
		ctx.translate(game.rpx(this.position.x), game.rpy(this.position.y));
		ctx.rotate(this.rotation + Math.PI / 2);
		ctx.drawImage(game.keys["w"] ? game.images["player"] : game.images["player-off"], -32, -32, 64, 64);
		ctx.restore();
	}

	public shoot(target: Enemy | Building): Bullet[]
	{
		let weapon = this.weapons[this.selectedWeapon];
		if (weapon.reloadTime > 0)
			return [];

		let multiple = 1;

		for (let i = 0; i < this.shootingBonus; i++)
			multiple *= 0.8;

		weapon.reloadTime = weapon.maxReloadTime * multiple;
		let direction = this.rotation;
		
		if (target !== null)
		{
			let x = target.position.x + target.asteroidPosition.x;
			let y = target.position.y + target.asteroidPosition.y;

			let angle = Math.atan2(y - this.position.y, x - this.position.x);
			if (Math.abs(Math.cos(angle) - Math.cos(this.rotation)) + Math.abs(Math.sin(angle) - Math.sin(this.rotation)) < 0.5)
				direction = angle;
		}

		switch (this.weapons[this.selectedWeapon].name)
		{
			case "Machine Gun":
				return [new Bullet(this.position.x, this.position.y, direction, 18, 2500, 5, this)];
			case "Homing":
				if (target === null)
				{
					this.weapons[this.selectedWeapon].reloadTime = 0;
					return [];
				}
				return [new HomingBullet(this.position.x, this.position.y, direction, 15, 3000, 5, this, target)];
			case "Flamethrower":
				return [new FlamethrowerBullet(this.position.x, this.position.y, direction, 12, 700, 0.5, this)];
			default:
				return [];
		}
	}

	public takeDamage(damage: number): void
	{
		if (this.shieldUnlocked && this.shieldHealth > 0)
		{
			this.shieldHealth -= damage;
			damage = 0;
			if (this.shieldHealth <= 0)
			{
				damage = 0 - this.shieldHealth;
				this.shieldHealth = 0;
			}
		}

		this.health -= damage;
	}

	public hasWeapon(id: string): boolean
	{
		for (let i of this.weapons)
			if (i.id === id)
				return true;
		return false;
	}

	public buy(id: string): void
	{
		switch (id)
		{
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
	}
}