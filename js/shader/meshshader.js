
class MeshShader extends Shader{

    constructor() {
        super(
            `
            precision highp float;

            attribute vec2 coordinates;
            attribute float node_value;
            varying float value;
            
            uniform mat3 viewMatrix;
            
            void main(){
                vec3 transformed_coordinates = viewMatrix * vec3(coordinates, 1.0);
                gl_Position = vec4(transformed_coordinates.xy,0.0,1.0);
                value = node_value;
                }`,
            `
            precision highp float;
                        
            varying float value;
            
            vec3 interpolateColors(float x1, float x2, vec3 y1, vec3 y2, float x){
                return y1 + (y2 - y1) * ((x - x1) / (x2 - x1));
            }
           
            vec3 getColorbarEntry(float v){
             
                vec3 c1 = vec3(0.5, 0.0, 0.5);
                vec3 c2 = vec3(0.0, 0.0, 1.0);
                vec3 c3 = vec3(0.2, 1.0, 1.0);
                vec3 c4 = vec3(0.0, 1.0, 0.0);
                vec3 c5 = vec3(1.0, 1.0, 0.0);
                vec3 c6 = vec3(1.0, 0.0, 0.0);
                
                if(v < 0.2){
                    return interpolateColors(0.0,0.2,c1,c2,v);
                }else if(v < 0.4){
                    return interpolateColors(0.2,0.4,c2,c3,v);
                }else if(v < 0.6){
                    return interpolateColors(0.4,0.6,c3,c4,v);
                }else if(v < 0.8){
                    return interpolateColors(0.6,0.8,c4,c5,v);
                }else {
                    return interpolateColors(0.8,1.0,c5,c6,v);
                }
                
                return vec3(0,0,0);
            }
            
            uniform vec2 valueRange;
            uniform float renderValues;
            
            void main(){
                if(renderValues > 0.5){
                    float normalised = (value - valueRange.x)/(valueRange.y - valueRange.x);
                    if(normalised > 1.0) normalised = 1.0;
                    if(normalised < 0.0) normalised = 0.0;
                    gl_FragColor  = vec4(getColorbarEntry(normalised),1.0);
                }else{
                    gl_FragColor  = vec4(0.6,0.6,0.6,1.0);
                }
            }`);
    }

    getAllUniformLocations() {
        super.getAllUniformLocations();
        // this.loc_element_tex     = super.getUniformLocation("elementValues");
        // this.loc_element_tex_dim = super.getUniformLocation("elementValuesDimension");
        this.loc_view_matrix     = super.getUniformLocation("viewMatrix");
        this.loc_render_values   = super.getUniformLocation("renderValues");
        this.loc_value_range     = super.getUniformLocation("valueRange");
    }

    getAllAttributeLocations(){
        super.getAllAttributeLocations();
        this.loc_attrib_coords   = super.getAttributeLocation("coordinates");
        this.loc_attrib_nvalue   = super.getAttributeLocation("node_value");
    }

    connectAllTextureUnits() {
        super.connectAllTextureUnits();
    }

    render(model, camera, render_values){

        let gl = getGLContext();
        if(gl === null) return;

        // check if the model is actually not complete
        if(model                           === null) return;
        if(model.node_index_buffer.data    === null) return;
        if(model.node_location_buffer.data === null) return;

        // start the shader
        this.start();

        // first load the camera and other uniforms
        this.loadViewMatrix(camera);
        this.loadRenderValues(render_values);
        this.loadValueRange(model.node_min_value, model.node_max_value);

        // bind the index buffer
        model.node_index_buffer.bind();
        // bind node locations
        model.node_location_buffer.bind();
        gl.vertexAttribPointer(this.loc_attrib_coords,2,gl.FLOAT, false,0,0);
        // gl.enableVertexAttribArray(0);
        // bind node values
        // connect the attrib pointer
        model.node_value_buffer.bind();
        gl.vertexAttribPointer(this.loc_attrib_nvalue,1,gl.FLOAT, false,0,0);
        // gl.enableVertexAttribArray(1);
        // main render call
        gl.drawElements(gl.TRIANGLES, model.node_index_buffer.data.length, gl.UNSIGNED_INT,0);
        this.stop();
    }

    loadViewMatrix(view){
        super.loadMatrix3(this.loc_view_matrix, view.getTransformation())
    }

    loadRenderValues(render_values){
        super.loadBool(this.loc_render_values, render_values);
    }

    loadValueRange(min,max){
        super.loadVector2(this.loc_value_range, [min,max]);
    }
    // loadTriangleValues(elem_data){
    //     load
    // }
}
