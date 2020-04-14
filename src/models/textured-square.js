import { model as square } from './square';
import image from './cubetexture.png';

export const model = Object.create(square);

model.textureCoords = [
    0.0, 1.0,
    1.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
];
model.image = image;
