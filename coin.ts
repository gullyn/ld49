class Coin extends Entity
{
	constructor(x: number, y: number)
	{
		super(x, y);
	}

	public update(delta: number, player: Player): boolean
	{
		if (dist(this.position.x, this.position.y, player.position.x, player.position.y) < 50)
			return true;
		
		return false;
	}

	public render(ctx: CanvasRenderingContext2D): void
	{
		ctx.drawImage(game.images["coin"], game.rpx(this.position.x) - 16, game.rpy(this.position.y) - 16, 32, 32);
	}
}