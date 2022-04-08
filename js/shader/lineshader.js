
class LineShader extends Shader{

    constructor() {
        super(
            `
            attribute vec2 coordinates;
            
            uniform mat3 viewMatrix;
            
            void main(){
                vec3 transformed_coordinates = viewMatrix * vec3(coordinates, 1.0);
                gl_Position = vec4(transformed_coordinates.xy,0.0,1.0);
            }
            `
            ,
            `
            void main(){
                gl_FragColor  = vec4(0.0,0.0,0.0,1.0);
            }`);
    }

    getAllUniformLocations() {
        super.getAllUniformLocations();
        this.loc_view_matrix     = super.getUniformLocation("viewMatrix");
    }

    getAllAttributeLocations(){
        super.getAllAttributeLocations();
        this.loc_attrib_coords   = super.getAttributeLocation("coordinates");
    }

    connectAllTextureUnits() {
        super.connectAllTextureUnits();
    }

    render(model, camera){
        let gl = getGLContext();
        if(gl === null) return;

        // check if the model is actually not complete
        if(model.node_index_buffer.data    === null) return;
        if(model.node_location_buffer.data === null) return;

        // start the shader
        this.start();
        // load the view matrix
        this.loadViewMatrix(camera);
        // bind the indices to draw the surrounding of the elements
        model.surround_index_buffer.bind();
        // bind the surround buffer
        model.node_location_buffer.bind();
        // connect the attrib pointer
        gl.vertexAttribPointer(this.loc_attrib_coords,2,gl.FLOAT, false,0,0);
        gl.enableVertexAttribArray(0);

        gl.drawElements(gl.LINES, model.surround_index_buffer.data.length , gl.UNSIGNED_INT, 0);
        this.stop();
    }

    loadViewMatrix(view){
        super.loadMatrix3(this.loc_view_matrix, view.getTransformation())
    }

    // loadTriangleValues(elem_data){
    //     load
    // }
}
