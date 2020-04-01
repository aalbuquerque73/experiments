import { mat4 } from 'gl-matrix';
import { Observable } from './observable';

export function Animation(dest, orig) {
    const rotation = new Observable(0.0);

    return {
        rotate: (axis = [0, 0, 1]) => mat4.rotate(dest, orig, rotation.value, axis),
        update: (delta) => rotation(delta),
    };
}
