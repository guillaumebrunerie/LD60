import { Circle, Graphics, Rectangle, type Container } from "pixi.js";

export const showHitArea = (container: Container) => {
	const graphics = new Graphics();
	const hitArea = container.hitArea;
	if (hitArea instanceof Rectangle) {
		graphics
			.rect(hitArea.x, hitArea.y, hitArea.width, hitArea.height)
			.fill("#FF00FF60");
	} else if (hitArea instanceof Circle) {
		graphics.circle(hitArea.x, hitArea.y, hitArea.radius).fill("#FF00FF60");
	}
	container.addChild(graphics);
};
