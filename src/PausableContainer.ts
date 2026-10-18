import { animate, type AnimationPlaybackControlsWithThen } from "motion";
import {
	Container as PixiContainer,
	type ContainerChild,
	type ContainerOptions,
	AnimatedSprite,
	type DestroyOptions,
	Ticker,
} from "pixi.js";
import { app } from "./getEngine";

type MyContainerOptions<C extends ContainerChild = ContainerChild> =
	ContainerOptions<C> & {
		onResize?: (child: Container, width: number, height: number) => void;
	};

export class Container<
	C extends ContainerChild = ContainerChild,
> extends PixiContainer<C> {
	#controls: AnimationPlaybackControlsWithThen[] = [];
	isPaused = false;
	onResize?: (width: number, height: number) => void;

	constructor(options?: MyContainerOptions<C>) {
		super(options);
		const onResize = options?.onResize;
		if (onResize) {
			this.onResize = (width: number, height: number) =>
				onResize(this, width, height);
			onResize(this, app().renderer.width, app().renderer.height);
		}
	}

	update(ticker: Ticker) {
		for (const child of this.children) {
			if (child instanceof Container) {
				child.update?.(ticker);
			}
		}
	}

	destroy(options?: DestroyOptions) {
		for (const control of this.#controls) {
			control.stop();
		}
		// requestAnimationFrame(() => {
		super.destroy(options);
		// });
	}

	// @ts-expect-error Magic
	animate: typeof animate = function (this: Container, ...args) {
		// @ts-expect-error Magic
		const controls = animate(...args);
		this.#controls.push(controls);
		controls.then(() => {
			this.#controls = this.#controls.filter((c) => c !== controls);
		});
		return controls;
	};

	pause() {
		this.isPaused = true;
		for (const control of this.#controls) {
			control.pause();
		}
		for (const child of this.children) {
			if (child instanceof Container) {
				child.pause();
			}
			if (child instanceof AnimatedSprite) {
				child.stop();
			}
		}
	}

	resume() {
		this.isPaused = false;
		for (const control of this.#controls) {
			control.play();
		}
		for (const child of this.children) {
			if (child instanceof Container) {
				child.resume();
			}
			if (child instanceof AnimatedSprite) {
				child.play();
			}
		}
	}

	resize(width: number, height: number) {
		if (this.onResize) {
			this.onResize(width, height);
		}
		for (const child of this.children) {
			if (child instanceof Container) {
				child.resize(width, height);
			}
		}
	}

	addDynamicChild<U extends C>(
		child: U,
		onResize: (child: Container, width: number, height: number) => void,
	) {
		const container = new Container({
			onResize,
			children: [child],
		});

		this.addChild(container as unknown as C);
		return child;
	}
}
