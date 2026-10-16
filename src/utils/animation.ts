import { Assets, Texture } from "pixi.js";
import { randomCyclic } from "./random";

export const getIdleAnimation = (key: string) =>
	randomCyclic(Assets.get(key).animations[key]) as Texture[];

export const getAnimation = (key: string) =>
	Object.values(Assets.get(key).textures) as Texture[];
