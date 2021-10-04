class Vector2
{
	public x: number;
	public y: number;

	constructor(x: number, y: number)
	{
		this.x = x;
		this.y = y;
	}
}

function dist(x1: number, y1: number, x2: number, y2: number): number
{
	let a = Math.abs(x1 - x2);
	let b = Math.abs(y1 - y2);

	return Math.sqrt(a * a + b * b);
}

const circlePosX = (i: number, num: number) => Math.cos(i * (Math.PI * 2 / num));
const circlePosY = (i: number, num: number) => Math.sin(i * (Math.PI * 2 / num));

const crx = (x: number, y: number, angle: number) => x * Math.cos(angle) - y * Math.sin(angle);
const cry = (x: number, y: number, angle: number) => y * Math.cos(angle) + x * Math.sin(angle);

const ccw = (a: number[], b: number[], c: number[]) => (c[1] - a[1]) * (b[0] - a[0]) > (b[1] - a[1]) * (c[0] - a[0]);

const intersect = (a: number[], b: number[], c: number[], d: number[]) => {
	return ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d);
}

const image = (url: string) => {
	const img = document.createElement("img");
	img.src = url;
	return img;
}

const audio = (url: string) => {
	const a = document.createElement("audio");
	a.src = url;
	return a;
}