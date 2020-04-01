import { mat4 } from 'gl-matrix';

export function drawScene(gl, programInfo, buffers, engine) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
  
    // Clear the canvas before we start drawing on it.
  
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    {
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next
                                    // 0 = use type and numComponents above
        const offset = 0;         // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            buffers.components.position,
            type,
            normalize,
            stride,
            offset
        );
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition
        );
    }

    // Tell WebGL how to pull out the colors from the color buffer
    // into the vertexColor attribute.
    {
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            buffers.components.color,
            type,
            normalize,
            stride,
            offset
        );
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexColor
        );
    }
    
    if (buffers.indices) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    }
  
    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);
  
    // Set the shader uniforms
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        engine.projection
    );
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        engine.modelView
    );
  
    {
        const offset = 0;
        if (buffers.indices) {
            const type = gl.UNSIGNED_SHORT;
            gl.drawElements(gl.TRIANGLES, buffers.count, type, offset);
        } else {
            gl.drawArrays(gl.TRIANGLE_STRIP, offset, buffers.count);
        }
    }
}