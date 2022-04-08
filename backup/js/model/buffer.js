// data synchronised on the gpu and the cpu for nodes and triangles
// triangles have their data stored within textures whereas nodes use buffers

class NodeDataBuffer{
    constructor() {
        let gl = getGLContext();
        if(gl === null) {
            alert("cannot create node data. GL Context is missing");
            return;
        }
        this.buffer_id = gl.createBuffer();
        this.data = null;
    }

    deleteData(){
        let gl = getGLContext();
        if(gl === null) {
            return;
        }
        if(this.buffer_id === -1) return;
        gl.deleteBuffer(this.buffer_id);
        this.buffer_id = -1;
    }

    setValue(idx, value){
        let gl = getGLContext();
        if(gl === null) {
            return;
        }
        // if there is no gpu buffer, return
        if(this.buffer_id === -1) return;
        // if there is no data, create the data
        if(this.data === null) {
            this.data = new Float32Array(idx+1);
        }
        // if the data isnt big enough, resize the data
        if(idx >= this.data.size){
            this.data.resize(idx+1);
        }

        // adjust the value in the local data array
        this.data[idx] = value;
        // bind and adjust the value
        this.bind();
        gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STATIC_DRAW);
    }

    setValues(values){
        // get the context
        let gl = getGLContext();
        if(gl === null) {
            return;
        }
        if(this.buffer_id === -1) return;

        // overwrite the local values
        this.data = new Float32Array(values);

        // bind and set the texture data
        this.bind();
        gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STATIC_DRAW);
    }

    bind(){
        let gl = getGLContext();
        if(gl === null) {
            return;
        }
        if(this.buffer_id === -1) return;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer_id);
    }

    unbind(){
        let gl = getGLContext();
        if(gl === null) {
            return;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
}

class IndexBuffer{
    constructor() {
        let gl = getGLContext();
        if(gl === null) {
            alert("cannot create node data. GL Context is missing");
            return;
        }
        this.buffer_id = gl.createBuffer();
        this.data = null;
    }

    deleteData(){
        let gl = getGLContext();
        if(gl === null) {
            return;
        }
        if(this.buffer_id === -1) return;
        gl.deleteBuffer(this.buffer_id);
        this.buffer_id = -1;
    }

    setValues(values){
        // get the context
        let gl = getGLContext();
        if(gl === null) {
            return;
        }
        if(this.buffer_id === -1) return;

        // overwrite the local values
        this.data = new Uint32Array(values);

        // bind and set the texture data
        this.bind();
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.data, gl.STATIC_DRAW);
    }

    bind(){
        let gl = getGLContext();
        if(gl === null) {
            return;
        }
        if(this.buffer_id === -1) return;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer_id);
    }

    unbind(){
        let gl = getGLContext();
        if(gl === null) {
            return;
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
}

class TriangleDataBuffer{
    constructor() {
        let gl = getGLContext();
        if(gl === null) {
            alert("cannot create triangle data. GL Context is missing");
            return;
        }
        this.dimension  = gl.getParameter(gl.MAX_TEXTURE_SIZE)
        this.texture_id = gl.createTexture();
        this.data = null;
    }

    deleteData(){
        let gl = getGLContext();
        if(gl === null) {
            return;
        }
        if(this.texture_id === -1) return;

        gl.deleteTexture(this.texture_id);
        this.texture_id = -1;
    }

    setValue(idx, value){
        // get the context
        let gl = getGLContext();
        // if no context, return
        if(gl === null) {
            return;
        }
        // if there is no texture, return
        if(this.texture_id === -1) return;
        // if there is no data, create the data
        if(this.data === null) {
            this.data = new Float32Array(idx+1);
        }
        // if the data isnt big enough, resize the data
        if(idx >= this.data.size){
            this.data.resize(idx+1);
        }


        // compute which x and y offset we are looking at
        let x_coord = idx % this.dimension;
        let y_coord = idx / this.dimension;
        // create a temporary array for copying values
        let val_ar  = new Float32Array([value]);
        // adjust the value in the local data array
        this.data[idx] = value;
        // bind and adjust the value
        this.bind();
        gl.texSubImage2D(gl.TEXTURE_2D, 0, x_coord, y_coord, this.dimension, this.dimension, gl.RED, gl.FLOAT, val_ar);
    }

    setValues(values){
        // get the context
        let gl = getGLContext();
        if(gl === null) {
            return;
        }
        if(this.texture_id === -1) return;

        if(values.length > this.dimension * this.dimension){
            alert("Cannt handle this many elements");
        }

        // overwrite the local values
        this.data = values;

        // bind and set the texture data
        this.bind();
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, this.dimension, this.dimension, 0, gl.RED, gl.FLOAT, this.data);
    }

    bind(){
        let gl = getGLContext();
        if(gl === null) {
            return;
        }
        if(this.texture_id === -1) return;
        gl.bindTexture(gl.TEXTURE_2D, this.texture_id);
    }
}