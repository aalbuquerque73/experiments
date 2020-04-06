import { doError } from './error';
import { initProgramInfo, vsSourceWithTexture, fsSourceWithTexture, vsSourceWithNormals, fsSourceWithNormals } from './shaders';
import { model } from './models/textured-cube-normals';
import { initBuffers } from './models/model';
import { drawScene } from './render';
import { Engine } from './engine';
import { ObservableDelta } from './observable-delta';
import WebGLDebugUtils from './webgl-debug';

//
// start here
//
function main() {
    const canvas = document.querySelector("#glCanvas");
    // Initialize the GL context
    // const gl = WebGLDebugUtils.makeDebugContext(canvas.getContext("webgl"), undefined, logGLCall);
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

    const buffers = initBuffers(gl, model);
    const programInfo = buffers.texture 
        ? buffers.normals
            ? initProgramInfo(gl, ['aVertexPosition', 'aVertexNormal', 'aTextureCoord'], ['uProjectionMatrix', 'uModelViewMatrix', 'uNormalMatrix', 'uSampler'], vsSourceWithNormals, fsSourceWithNormals)
            : initProgramInfo(gl, ['aVertexPosition', 'aTextureCoord'], ['uProjectionMatrix', 'uModelViewMatrix', 'uSampler'], vsSourceWithTexture, fsSourceWithTexture)
        : initProgramInfo(gl, ['aVertexPosition', 'aVertexColor'], ['uProjectionMatrix', 'uModelViewMatrix']);
    
    const engine = new Engine(gl);
    const time = new ObservableDelta(0)
        .map(value => value * 0.001);
    requestAnimationFrame(now => render(gl, now, time, programInfo, buffers, engine));
}

function render(gl, now, time, programInfo, buffers, engine) {
    time(now);
    drawScene(gl, programInfo, buffers, engine);
    if (buffers.indices) {
        engine.rotate([0, 0, 1]);
        engine.update(time.delta, [0, 1, 0]);
    } else {
        engine.update(time.delta);
    }
    requestAnimationFrame(now => render(gl, now, time, programInfo, buffers, engine));
}

window.onload = main;

function logGLCall(functionName, args) {   
    console.log("gl." + functionName + "(" + 
    WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");   
} 
