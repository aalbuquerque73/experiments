import { doError } from './error';
import { initProgramInfo } from './shaders';
import { initBuffers } from './buffers';
import { drawScene } from './render';

//
// start here
//
function main() {
    const canvas = document.querySelector("#glCanvas");
    // Initialize the GL context
    const gl = canvas.getContext("webgl");
  
    // Only continue if WebGL is available and working
    if (gl === null) {
        doError('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }
  
    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    const programInfo = initProgramInfo(gl, ['aVertexPosition', 'aVertexColor'], ['uProjectionMatrix', 'uModelViewMatrix'])
    const buffers = initBuffers(gl);
    
    drawScene(gl, programInfo, buffers);
}
  
  window.onload = main;
