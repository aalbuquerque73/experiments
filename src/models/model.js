import { createTexture, updateTexture } from './texture';
import { setupImage } from './image';
import { setupVideo } from './video';

export function initBuffers(gl, model) {
    const bufferInfo = {
        sizes: model.sizes,
        count: model.count,
        canUpdate: {
            value: false,
        },
    };
    if (model.vertices) {
        bufferInfo.vertices = createBuffer(gl, model.vertices);
    }
    if (model.indices) {
        bufferInfo.indices = createBuffer(gl, model.indices, gl.ELEMENT_ARRAY_BUFFER, Uint16Array);
    }
    if (model.colors) {
        bufferInfo.colors = createBuffer(gl, model.colors);
    }
    if (model.normals) {
        bufferInfo.normals = createBuffer(gl, model.normals);
    }
    if (model.textureCoords) {
        bufferInfo.textureCoords = createBuffer(gl, model.textureCoords);
    }
    if (model.image) {
        bufferInfo.texture = createTexture(gl);
        setupImage(model.image, image => updateTexture(gl, bufferInfo.texture, image));
    }
    if (model.video) {
        bufferInfo.texture = createTexture(gl);
        const video = setupVideo(model.video);
        bufferInfo.video = video.video;
        bufferInfo.canUpdate = video.canUpdate;
    }
  
    return bufferInfo;
}

export function createBuffer(gl, array, type = gl.ARRAY_BUFFER, arrayType = Float32Array) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, new arrayType(array), gl.STATIC_DRAW);
    return buffer;
}
