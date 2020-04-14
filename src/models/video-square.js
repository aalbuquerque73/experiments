import { model as square } from './square';
import video from './Firefox.mp4';

export const model = Object.create(square);

model.textureCoords = [
    0.0, 1.0,
    1.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
];
model.video = video;
