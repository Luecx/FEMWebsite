
// ---------------------------------------------------------------------------------------------------------------------
// SHADER
// ---------------------------------------------------------------------------------------------------------------------

class Shader {

    constructor(vertex_shader_src, fragment_shader_src) {
        let gl = getGLContext();
        if(gl === null) {
            return;
        }

        // load shaders
        this.vertex_shader_id   = readSource(gl, vertex_shader_src  , gl.VERTEX_SHADER);
        this.fragment_shader_id = readSource(gl, fragment_shader_src, gl.FRAGMENT_SHADER);
        // Create program
        this.program_id = gl.createProgram();

        // Attach and link shaders to the program
        gl.attachShader(this.program_id, this.vertex_shader_id);
        gl.attachShader(this.program_id, this.fragment_shader_id);
        // bind attributes
        this.bindAttributes();
        // link program
        gl.linkProgram(this.program_id);
        // validate
        gl.validateProgram(this.program_id);
        // get uniforms
        this.getAllUniformLocations();
        this.getAllAttributeLocations();
        this.connectAllTextureUnits();

        // final checks
        if (!gl.getProgramParameter(this.program_id, gl.LINK_STATUS)) {
            alert("Unable to initialize the shader program");
            return false;
        }
    }

    connectAllTextureUnits(){};
    getAllAttributeLocations(){};
    getAllUniformLocations(){};
    bindAttributes(){};
    getAttributeLocation(name){
        let gl = getGLContext();
        if(gl === null) return 0;
        let location = gl.getAttribLocation(this.program_id, name);
        if(location === null || location < 0){
            console.log("Warning: ", name, "is unused or cannot be found inside the shader!");
        }
        return location;
    }
    getUniformLocation(name){
        let gl = getGLContext();
        if(gl === null) return 0;
        let location = gl.getUniformLocation(this.program_id, name);
        if(location === null){
            console.log("Warning: ", name, "is unused or cannot be found inside the shader!");
        }
        return location;
    }
    start(){
        let gl = getGLContext();
        if(gl === null) return;
        gl.useProgram(this.program_id);
        gl.program = this.program_id;
    }
    stop(){
        let gl = getGLContext();
        if(gl === null) return;
        gl.useProgram(null);
    }

    loadFloat(location, value){
        let gl = getGLContext();
        if(gl === null) return;
        gl.uniform1f(location, value);
    }
    loadInt(location, value){
        let gl = getGLContext();
        if(gl === null) return;
        gl.uniform1i(location, value);
    }
    loadVector2(location, array){
        let gl = getGLContext();
        if(gl === null) return;
        gl.uniform2f(location, array[0], array[1]);
    }
    loadVector3(location, array){
        let gl = getGLContext();
        if(gl === null) return;
        gl.uniform3f(location, array[0], array[1], array[2]);
    }
    loadBool(location, value){
        let gl = getGLContext();
        if(gl === null) return;
        let toLoad = 0;
        if (value) {
            toLoad = 1;
        }
        gl.uniform1f(location, toLoad);
    }
    loadMatrix3(location, mat){
        let gl = getGLContext();
        if(gl === null) return;
        gl.uniformMatrix3fv(location, false, mat);
    }
}

function readSource(gl, source, type){
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("Error compiling shader: " + gl.getShaderInfoLog(shader));
        return;
    }
    return shader;
}