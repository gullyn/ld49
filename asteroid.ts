class Asteroid extends Entity
{
	public structure: Vector2[];
	public rotationSpeed: number;
	public velocity: Vector2;
	public size: number;

	public health: number;
	public isPlanet: boolean;
	public colors: string[];
	public buildings: Building[];

	constructor(
		x: number, y: number, size: number,
		velocity: number, points: number,
		rotationSpeed: number, planet: boolean,
		colors: string[]
	)
	{
		super(x, y);

		this.rotationSpeed = rotationSpeed > 400 ? 0 : Math.random() / rotationSpeed - (0.5 / rotationSpeed);
		this.velocity = new Vector2((Math.random() - 0.5) * velocity, (Math.random() - 0.5) * velocity);
		this.size = planet ? size : Math.floor(Math.random() * size) + size / 2;
		this.health = this.size;
		this.isPlanet = planet;
		this.colors = colors;
		this.buildings = [];
		this.structure = this.createStructure(points);
		this.createBuildings();
	}

	public update(delta: number, data: {
		"asteroids": Asteroid[],
		"player": Player,
		"enemies": Enemy[]
	}): boolean
	{
		let p = data["player"];
	
		if (dist(this.position.x, this.position.y, p.position.x, p.position.y) > 1000 + this.size)
			return;

		if (this.health <= 0)
			return true;

		this.hitTime -= delta;
		this.rotation += this.rotationSpeed * delta;
		this.position.x += this.velocity.x * delta;
		this.position.y += this.velocity.y * delta;

		for (let asteroid of data["asteroids"])
		{
			if (this === asteroid || this.isPlanet)
				continue;

			let d = dist(asteroid.position.x, asteroid.position.y, this.position.x, this.position.y);
			if (d > this.size + asteroid.size + 150)
				continue;

			for (let point of this.structure)
			{
				if (asteroid.pointInside(
					crx(point.x, point.y, this.rotation) + this.position.x,
					cry(point.x, point.y, this.rotation) + this.position.y))
				{
					let angle: number = Math.atan2(
						this.position.y - asteroid.position.y,
						this.position.x - asteroid.position.x
					);
					this.velocity.x = Math.cos(angle);
					this.velocity.y = Math.sin(angle);
				}
			}
		}

		if (dist(p.position.x, p.position.y, this.position.x, this.position.y) <= this.size + 75 && !this.isPlanet)
		{
			if (this.pointInside(crx(-20, -30, p.rotation) + p.position.x, cry(-20, -30, p.rotation) + p.position.y) ||
				this.pointInside(crx(20, -30, p.rotation) + p.position.x, cry(20, -30, p.rotation) + p.position.y) ||
				this.pointInside(crx(-20, 30, p.rotation) + p.position.x, cry(-20, 30, p.rotation) + p.position.y) ||
				this.pointInside(crx(20, 30, p.rotation) + p.position.x, cry(20, 30, p.rotation) + p.position.y))
			{
				let angle: number = Math.atan2(
					this.position.y - p.position.y,
					this.position.x - p.position.x
				);
				this.velocity.x = Math.cos(angle);
				this.velocity.y = Math.sin(angle);
			}
		}

		for (let enemy of data["enemies"])
		{
			if (dist(enemy.position.x, enemy.position.y, this.position.x, this.position.y) <= this.size + 75 && !this.isPlanet)
			{
				if (this.pointInside(crx(-20, -30, enemy.rotation) + enemy.position.x, cry(-20, -30, enemy.rotation) + enemy.position.y) ||
					this.pointInside(crx(20, -30, enemy.rotation) + enemy.position.x, cry(20, -30, enemy.rotation) + enemy.position.y) ||
					this.pointInside(crx(-20, 30, enemy.rotation) + enemy.position.x, cry(-20, 30, enemy.rotation) + enemy.position.y) ||
					this.pointInside(crx(20, 30, enemy.rotation) + enemy.position.x, cry(20, 30, enemy.rotation) + enemy.position.y))
				{
					let angle: number = Math.atan2(
						this.position.y - enemy.position.y,
						this.position.x - enemy.position.x
					);
					this.velocity.x = Math.cos(angle);
					this.velocity.y = Math.sin(angle);
				}
			}
		}

		return false;
	}

	public render(ctx: CanvasRenderingContext2D, mousePos: Vector2): void
	{
		if (Math.abs(game.rpx(this.position.x)) > this.size + ctx.canvas.width + 100 ||
			Math.abs(game.rpy(this.position.y)) > this.size + ctx.canvas.height + 100)
			return;

		for (let building of this.buildings)
		{
			building.render(ctx, this.position.x, this.position.y, mousePos);
		}

		ctx.save();
		ctx.translate(game.rpx(this.position.x), game.rpy(this.position.y));
		ctx.rotate(this.rotation);
		ctx.beginPath();
		if (this.hitTime > 0)
		{
			ctx.fillStyle = `rgb(${this.colors[2]})`;
			ctx.strokeStyle = `rgb(${this.colors[3]})`;
		}
		else
		{
			ctx.fillStyle = `rgb(${this.colors[0]})`;
			ctx.strokeStyle = `rgb(${this.colors[1]})`;
		}
		ctx.lineWidth = 10;

		for (let i = 0; i < this.structure.length + 1; i++)
		{
			let point: Vector2 = this.structure[i % this.structure.length];
			
			ctx.lineTo(point.x, point.y);
		}

		ctx.fill();
		ctx.stroke();
		ctx.restore();
	}

	private createStructure(numPoints: number): Vector2[]
	{
		let structure: Vector2[] = [];
		for (let i = 0; i < numPoints; i++)
		{
			structure.push(new Vector2(
				circlePosX(i, numPoints) * (this.size + Math.floor(Math.random() * 75)),
				circlePosY(i, numPoints) * (this.size + Math.floor(Math.random() * 75))
			));
		}
		return structure;
	}

	private createBuildings(): void
	{
		let shopCreated = false;

		if (!this.isPlanet)
			return;
		
		for (let i = 1; i < this.structure.length + 1; i += 2)
		{
			if (Math.random() > 0.2)
				continue;

			let p1 = this.structure[i % this.structure.length];
			let p2 = this.structure[(i - 1) % this.structure.length];

			let angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

			let className = Math.random() < 0.5 ? Shop : Turret;

			if (shopCreated)
				className = Turret;

			if (className === Shop)
				shopCreated = true;

			this.buildings.push(new className(
				(p1.x + p2.x) / 2 + Math.cos(angle + Math.PI / 2) * 30,
				(p1.y + p2.y) / 2 + Math.sin(angle + Math.PI / 2) * 30,
				angle, this.position
			));
		}
	}

	public pointInside(x: number, y: number): boolean
	{
		let g: number = dist(x, y, this.position.x, this.position.y) + 1000 + this.size;

		let intersections: number = 0;
		
		for (let i = 1; i < this.structure.length + 1; i++)
		{
			let p1 = this.structure[i % this.structure.length];
			let p2 = this.structure[(i - 1) % this.structure.length];

			if (intersect(
				[crx(p1.x, p1.y, this.rotation) + this.position.x, cry(p1.x, p1.y, this.rotation) + this.position.y],
				[crx(p2.x, p2.y, this.rotation) + this.position.x, cry(p2.x, p2.y, this.rotation) + this.position.y],
				[x, y],
				[x - g - 10, y]
			))
				intersections++;
		}

		return intersections % 2 === 1;
	}

	public takeDamage(damage: number): void
	{
		if (this.isPlanet)
			return;

		this.hitTime = 10;
		this.health -= damage;
	}
}