import { mat4 } from 'gl-matrix';
import { Observable } from './observable';

export function Animation(dest, orig, axis = [0, 0, 1]) {
    const rotation = new Observable(0.0);

    return {
        rotate: () => mat4.rotate(dest, orig, rotation.value, axis),
        update: (delta) => rotation(delta),
    };
}
