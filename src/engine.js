import { mat4 } from 'gl-matrix';
import { Animation } from './animation';

export function Engine(gl) {
    const projection = createProjectionMatrix(gl);
    const modelView = createModelViewMatrix();
    const rotation = new Animation(modelView, modelView);

    return {
        projection,
        modelView,
        update(...args) {
            rotation.rotate();
            rotation.update(...args);
        }
    };
}

function createProjectionMatrix(gl) {
    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.
  
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
  
    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(
        projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar
    );

    return projectionMatrix;
}

function createModelViewMatrix() {
    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();
  
    // Now move the drawing position a bit to where we want to
    // start drawing the square.
  
    mat4.translate(
        modelViewMatrix,     // destination matrix
        modelViewMatrix,     // matrix to translate
        [-0.0, 0.0, -6.0])
    ;  // amount to translate

    return modelViewMatrix;
}