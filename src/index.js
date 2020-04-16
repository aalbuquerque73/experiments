import $ from 'jquery';
import { doError } from './error';
import { initProgramInfo, vsSourceWithTexture, fsSourceWithTexture, vsSourceWithNormals, fsSourceWithNormals } from './shaders';
import { model as sphereWithVideo } from './models/video-sphere';
import { model as sphereWithTexture } from './models/textured-sphere';
import { model as sphere } from './models/sphere';
import { model as cubeWithVideo } from './models/video-cube';
import { model as cubeWithNormals } from './models/textured-cube-normals';
import { model as cubeWithTexture } from './models/textured-cube';
import { model as cube } from './models/cube';
import { model as squareWithTexture } from './models/textured-square';
import { model as squareWithVideo } from './models/video-square';
import { model as square } from './models/square';
import { initBuffers } from './models/model';
import { drawScene } from './render';
import { Engine } from './engine';
import { Observable } from './observable';
import { ObservableDelta } from './observable-delta';
import WebGLDebugUtils from './webgl-debug';
import { updateTexture } from './models/texture';

//
// start here
//
function main() {
    const list = { sphereWithVideo, sphereWithTexture, sphere, cubeWithVideo, cubeWithNormals, cubeWithTexture, cube, squareWithVideo, squareWithTexture, square };
    const model = new Observable();

    $('.nav').on('click', 'a', (ev) => {
        const selected = list[$(ev.target).attr('data-text')];
        if (selected) {
            $('.nav a.active').toggleClass('active', false);
            model(selected);
            $(ev.target).toggleClass('active', true);
        }
    })

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

    const buffers = new Observable()
        .filter(value => value && Array.isArray(value.vertices))
        .map(value => initBuffers(gl, value));
    model.each(value => buffers(value));

    const programInfo = new Observable()
        .filter(value => value && value.vertices instanceof WebGLBuffer)
        .map(value => value.normals ? initProgramInfo(gl, ['aVertexPosition', 'aVertexNormal', 'aTextureCoord'], ['uProjectionMatrix', 'uModelViewMatrix', 'uNormalMatrix', 'uSampler'], vsSourceWithNormals, fsSourceWithNormals) : value)
        .map(value => value.texture ? initProgramInfo(gl, ['aVertexPosition', 'aTextureCoord'], ['uProjectionMatrix', 'uModelViewMatrix', 'uSampler'], vsSourceWithTexture, fsSourceWithTexture) : value)
        .map(value => !value.program ? initProgramInfo(gl, ['aVertexPosition', 'aVertexColor'], ['uProjectionMatrix', 'uModelViewMatrix']) : value);
    buffers.each(value => programInfo(value));

    model(list[$('.nav a.active').attr('data-text')]);

    const engine = new Engine(gl);
    programInfo.each(engine.reset);

    const time = new ObservableDelta(0)
        .map(value => value * 0.001);
    requestAnimationFrame(now => render(gl, now, time, programInfo, buffers, engine));
}

function render(gl, now, time, programInfo, buffers, engine) {
    time(now);
    if (programInfo.value) {
        if (buffers.value.canUpdate.value) {
            updateTexture(gl, buffers.value.texture, buffers.value.video);
        }
        drawScene(gl, programInfo.value, buffers.value, engine);
        if (buffers.value.indices) {
            engine.rotate([0, 0, 1]);
            engine.update(time.delta, [0, 1, 0]);
        } else {
            engine.update(time.delta);
        }
    }
    requestAnimationFrame(now => render(gl, now, time, programInfo, buffers, engine));
}

window.onload = main;

function logGLCall(functionName, args) {
    console.log("gl." + functionName + "(" +
    WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
}
