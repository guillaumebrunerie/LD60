import type { Application } from "pixi.js";
import type { Navigation } from "./navigation";

let instance: Application | null = null;

/**
 * Get the main application engine
 * This is a simple way to access the engine instance from anywhere in the app
 */
export function app(): Application {
	return instance!;
}

export function setApp(app: Application) {
	instance = app;
}

let instance2: Navigation;

/**
 * Get the main application engine
 * This is a simple way to access the engine instance from anywhere in the app
 */
export function navigation(): Navigation {
	return instance2!;
}

export function setNavigation(navigation: Navigation) {
	return (instance2 = navigation);
}
