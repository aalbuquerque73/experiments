import { doError } from './error';

// Vertex shader program
export const vsSource = `
attribute vec4 aVertexPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}
`;

export const fsSource = `
    void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
`;

export function initProgramInfo(gl, attributes = [], uniforms = []) {
    const program = initShaderProgram(gl, vsSource, fsSource);
    const info = {
        program,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(program, 'aVertexPosition'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(program, 'uModelViewMatrix'),
        },
    };
    attributes.forEach(attr => info.attribLocations[nameOf(attr)] = gl.getAttribLocation(program, attr));
    uniforms.forEach(uni => info.uniformLocations[nameOf(uni)] = gl.getUniformLocation(program, uni));
    return info;
}

export function initShaders(gl) {
    return initShaderProgram(gl, vsSource, fsSource);
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
export function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  
    // Create the shader program
  
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
  
    // If creating the shader program failed, alert
  
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        doError(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
        return null;
    }
  
    return shaderProgram;
  }
  
  //
  // creates a shader of the given type, uploads the source and
  // compiles it.
  //
export function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
  
    // Send the source to the shader object
  
    gl.shaderSource(shader, source);
  
    // Compile the shader program
  
    gl.compileShader(shader);
  
    // See if it compiled successfully
  
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        doError(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
        gl.deleteShader(shader);
        return null;
    }
  
    return shader;
}

function nameOf(param) {
    return param.replace(/^[au]([A-Z])/, (match, param) => param.toLowerCase());
}