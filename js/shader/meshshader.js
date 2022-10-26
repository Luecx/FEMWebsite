
class MeshShader extends Shader{

    constructor() {
        super(
            `
            precision highp float;

            attribute vec2 coordinates;
            attribute vec2 displacement;
            attribute float node_value;
            
            varying float value;
            
            uniform float disp_scalar;
            uniform mat3 viewMatrix;
            
            void main(){
                vec3 transformed_coordinates = viewMatrix * vec3(coordinates + displacement * disp_scalar, 1.0);
                gl_Position = vec4(transformed_coordinates.xy,0.0,1.0);
                value = node_value;
                }`,
            `
            precision highp float;
                        
            varying float value;
            uniform vec4 underflow_color;
            uniform vec4 overflow_color;
            
            vec4 interpolateColors(float x1, float x2, vec4 y1, vec4 y2, float x){
                return y1 + (y2 - y1) * ((x - x1) / (x2 - x1));
            }
           
            uniform vec2 valueRange;
            uniform float renderValues;
            
            vec4 getColorbarEntry(float real, float v){
             
                vec4 c1 = vec4(0.00, 0.00, 0.51, 1.00);  // 0
                vec4 c2 = vec4(0.00, 0.00, 1.00, 1.00);  // 0.2
                vec4 c3 = vec4(0.00, 1.00, 1.00, 1.00);  // 0.4
                vec4 c4 = vec4(1.00, 1.00, 0.00, 1.00);  // 0.6
                vec4 c5 = vec4(1.00, 0.00, 0.00, 1.00);  // 0.85
                vec4 c6 = vec4(0.51, 0.00, 0.00, 1.00);  // 1.0
                
                // vec4 c1 = vec4(168.0 / 255.0,   0.0 / 255.0, 255.0 / 255.0, 1.00);  // 0
                // vec4 c2 = vec4(  0.0 / 255.0, 121.0 / 255.0, 255.0 / 255.0, 1.00);  // 0.2
                // vec4 c3 = vec4(  0.0 / 255.0, 241.0 / 255.0,  29.0 / 255.0, 1.00);  // 0.4
                // vec4 c4 = vec4(255.0 / 255.0, 239.0 / 255.0,   0.0 / 255.0, 1.00);  // 0.6
                // vec4 c5 = vec4(255.0 / 255.0, 127.0 / 255.0,   0.0 / 255.0, 1.00);  // 0.85
                // vec4 c6 = vec4(255.0 / 255.0,   9.0 / 255.0,   0.0 / 255.0, 1.00);  // 1.0
                
                if(real < valueRange.x){
                    return underflow_color;
                }else if(real > valueRange.y){
                    return overflow_color;
                }
                
                float epsilon = 0.0;
                v = floor(v * 30.0) / 30.0;
                if(v < 0.0 - epsilon) {
                    return underflow_color;
                }else if(v < 0.2){
                    return interpolateColors(0.0,0.2,c1,c2,v);
                }else if(v < 0.4){
                    return interpolateColors(0.2,0.4,c2,c3,v);
                }else if(v < 0.6){
                    return interpolateColors(0.4,0.6,c3,c4,v);
                }else if(v < 0.85){
                    return interpolateColors(0.6,0.85,c4,c5,v);
                }else if(v <= 1.0 + epsilon){
                    return interpolateColors(0.85,1.0,c5,c6,v);
                }else{
                    return overflow_color;
                }
            }
            
            
            void main(){
                if(renderValues > 0.5){
                    float normalised = (value - valueRange.x)/(valueRange.y - valueRange.x);
                    gl_FragColor  = vec4(getColorbarEntry(value, normalised));
                    if(gl_FragColor.w < 0.5) discard;
                }else{
                    gl_FragColor  = vec4(0.6,0.6,0.6,1.0);
                }
            }`);
    }

    getAllUniformLocations() {
        super.getAllUniformLocations();
        // this.loc_element_tex     = super.getUniformLocation("elementValues");
        // this.loc_element_tex_dim = super.getUniformLocation("elementValuesDimension");
        this.loc_view_matrix         = super.getUniformLocation("viewMatrix");
        this.loc_render_values       = super.getUniformLocation("renderValues");
        this.loc_value_range         = super.getUniformLocation("valueRange");
        this.loc_underflow_color     = super.getUniformLocation("underflow_color");
        this.loc_overflow_color      = super.getUniformLocation("overflow_color");
        this.loc_displacement_scalar = super.getUniformLocation("disp_scalar")
    }

    getAllAttributeLocations(){
        super.getAllAttributeLocations();
        this.loc_attrib_coords   = super.getAttributeLocation("coordinates");
        this.loc_displacement    = super.getAttributeLocation("displacement");
        this.loc_attrib_nvalue   = super.getAttributeLocation("node_value");
    }

    connectAllTextureUnits() {
        super.connectAllTextureUnits();
    }

    render(model, camera, render_values, underflow_color, overflow_color){

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
        this.loadOverAndUnderflowColors(underflow_color, overflow_color);
        this.loadDisplacementScalar(visual_get_displacement_scaling());

        // bind the index buffer
        model.node_index_buffer.bind();
        // bind node locations
        model.node_location_buffer.bind();
        gl.vertexAttribPointer(this.loc_attrib_coords,2,gl.FLOAT, false,0,0);
        // bind displacement
        model.node_displacement_buffer.bind();
        gl.vertexAttribPointer(this.loc_displacement,2,gl.FLOAT, false,0,0);
        // bind node values
        model.node_value_buffer.bind();
        gl.vertexAttribPointer(this.loc_attrib_nvalue,1,gl.FLOAT, false,0,0);
        // gl.enableVertexAttribArray(1);
        // main render call
        gl.drawElements(gl.TRIANGLES, model.node_index_buffer.data.length, gl.UNSIGNED_INT,0);
        this.stop();
    }

    loadDisplacementScalar(scalar){
        super.loadFloat(this.loc_displacement_scalar, scalar);
    }

    loadViewMatrix(view){
        super.loadMatrix3(this.loc_view_matrix, view.getTransformation())
    }

    loadRenderValues(render_values){
        super.loadBool(this.loc_render_values, render_values);
    }

    loadOverAndUnderflowColors(underflow_color, overflow_color){
        super.loadVector4(this.loc_underflow_color, underflow_color);
        super.loadVector4(this.loc_overflow_color , overflow_color);
    }

    loadValueRange(min,max){
        super.loadVector2(this.loc_value_range, [min,max]);
    }
}
