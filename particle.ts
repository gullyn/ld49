class Particle
{
	private position: Vector2;
	private speed: number;
	private rotation: number;
	private color: string;
	private life: number;

	constructor(x: number, y: number, speed: number, rotation: number, color: string, life: number)
	{
		this.position = new Vector2(x, y);
		this.speed = speed;
		this.rotation = rotation;
		this.color = color;
		this.life = life;
	}

	public update(delta: number): boolean
	{
		this.life -= delta;
		this.position.x += Math.cos(this.rotation) * this.speed * delta;
		this.position.y += Math.sin(this.rotation) * this.speed * delta;

		if (this.life <= -30)
			return true;

		return false;
	}

	public render(ctx: CanvasRenderingContext2D)
	{
		let opacity = Math.min(255, (this.life + 30) * 2.55) / 255;
		ctx.beginPath();
		ctx.arc(game.rpx(this.position.x), game.rpy(this.position.y), 5, 0, Math.PI * 2);
		ctx.fillStyle = `rgba(${this.color}, ${opacity})`;
		ctx.fill();
	}
}

function explosion(x: number, y: number, count: number, minAngle: number, maxAngle: number): Particle[]
{
	let particles: Particle[] = [];

	for (let i = 0; i < count; i++)
	{
		let angle = Math.random() * (maxAngle - minAngle) + minAngle;
		let color = ["255, 0, 0", "255, 128, 0", "255, 255, 0"][Math.floor(Math.random() * 3)];
		particles.push(new Particle(x, y, Math.random() * 6 + 1, angle, color, 30));
	}

	return particles;
}