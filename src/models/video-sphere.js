import video from './Firefox.mp4';
import { model as sphere } from './textured-sphere';

export const model = Object.create(sphere);
model.image = null;
model.video = video;
