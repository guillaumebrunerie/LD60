import "pixi.js/math-extras";
import { sound } from "@pixi/sound";

import { setApp, setNavigation } from "./getEngine";
import { userSettings } from "./utils/userSettings";

/**
 * Importing these modules will automatically register their plugins with the engine.
 */
import "@pixi/sound";
import { Navigation } from "./navigation";
import { Application, Assets } from "pixi.js";

// import "pixi.js/advanced-blend-modes";
sound.disableAutoPause = true;

// Create a new creation engine instance
const app = new Application();
setApp(app);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - This is a dynamically generated file by AssetPack
import manifest from "./manifest.json";

const main = async () => {
	// Initialize the creation engine instance
	await app.init({
		backgroundAlpha: 1,
		backgroundColor: "#090a11",
		resolution: window.devicePixelRatio || 1,
	});

	// Append the application canvas to the document body
	document.getElementById("pixi-container")!.appendChild(app.canvas);

	// Init PixiJS assets with this asset manifest
	await Assets.init({ manifest, basePath: "assets" });
	await Assets.loadBundle("preload");

	// List all existing bundles names
	const allBundles = manifest.bundles.map(
		(item: { name: string }) => item.name,
	);
	// Start up background loading of all bundles
	Assets.backgroundLoadBundle(allBundles);

	// Initialize the user settings
	userSettings.init();

	const navigation = setNavigation(app.stage.addChild(new Navigation()));

	const resize = () => {
		app.renderer.resize(900, 1600);
		navigation.resize(window.innerWidth, window.innerHeight);
	};
	resize();
	window.addEventListener("resize", resize);

	document.addEventListener("visibilitychange", () => {
		if (document.hidden) {
			sound.pauseAll();
			navigation.blur();
		} else {
			sound.resumeAll();
			navigation.focus();
		}
	});

	await navigation.loadGame();
	// await navigation.loadPlayground();
};

main();
