class Entity
{
	public position: Vector2;
	public rotation: number;

	public hitTime: number;

	constructor(x: number, y: number)
	{
		this.position = new Vector2(x, y);
		this.rotation = 0;
		this.hitTime = 0;
	}

	public update(delta: number, data: {}): void {}

	public render(ctx: CanvasRenderingContext2D, mousePos: Vector2): void {}

	public getX(): number
	{
		return this.position.x;
	}

	public getY(): number
	{
		return this.position.y;
	}
}