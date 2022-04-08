
class PointShader extends Shader{

    constructor() {
        super(
            `
            precision highp float;

            attribute vec2 coordinates;
            attribute float node_value;
            varying float value;
            // value = 0, not selected
            // value = 1, selected
            
            uniform float selectionEnabled;
            uniform float displayWidth;
            uniform vec2 cursor;
            uniform mat3 viewMatrix;
            
            void main(){
                vec3 transformed_coordinates = viewMatrix * vec3(coordinates, 1.0);
                gl_Position  = vec4(transformed_coordinates.xy,0.0,1.0);
                gl_PointSize = 7.0;
                
                // if we are not in the selection mode, also no selected nodes shall be displayed
                if(selectionEnabled < 0.5) {
                    value = 0.0;
                    return;
                }
                
                // check the distance to the cursor
                vec2 distance = coordinates.xy - cursor;
                // if the distance is smaller than displayWidth / 50, change the value to 0.5 -> highlight
                if(length(distance) < (displayWidth / 75.0)){
                    value = 0.5;
                    gl_PointSize = 11.0;
                }else{
                    value = node_value;
                }
            }`,
            `
            precision highp float;
                        
            varying float value;
           
            void main(){
                gl_FragColor  = vec4(value,0,0,1.0);
            }`);
    }

    getAllUniformLocations() {
        super.getAllUniformLocations();
        this.loc_view_matrix       = super.getUniformLocation("viewMatrix");
        this.loc_display_width     = super.getUniformLocation("displayWidth");
        this.loc_cursor            = super.getUniformLocation("cursor");
        this.loc_selection_enabled = super.getUniformLocation("selectionEnabled");
    }

    getAllAttributeLocations(){
        super.getAllAttributeLocations();
        this.loc_attrib_coords   = super.getAttributeLocation("coordinates");
        this.loc_attrib_nvalue   = super.getAttributeLocation("node_value");
    }

    connectAllTextureUnits() {
        super.connectAllTextureUnits();
    }

    render(model, camera, mouse, enable_selection){

        let gl = getGLContext();
        if(gl === null) return;

        // check if the model is actually not complete
        if(model                           === null) return;
        if(model.node_location_buffer.data === null) return;

        // start the shader
        this.start();

        // first load the camera and the mouse
        this.loadViewMatrix(camera);
        this.loadCursor(mouse);
        this.loadScreeWidth(camera);
        this.loadSelectionMode(enable_selection);

        // bind node locations
        model.node_location_buffer.bind();
        gl.vertexAttribPointer(this.loc_attrib_coords,2,gl.FLOAT, false,0,0);
        gl.enableVertexAttribArray(0);

        // bind node selected state
        model.node_selected_buffer.bind();
        gl.vertexAttribPointer(this.loc_attrib_nvalue,1,gl.FLOAT, false,0,0);
        gl.enableVertexAttribArray(1);

        // draw
        gl.drawArrays(gl.POINTS, 0, model.node_location_buffer.data.length / 2);
        this.stop();
    }

    loadViewMatrix(view){
        super.loadMatrix3(this.loc_view_matrix, view.getTransformation());
    }

    loadCursor(mouse){
        if(mouse === null){
            super.loadVector2(this.loc_cursor, [-Infinity, -Infinity]);
        }else{
            super.loadVector2(this.loc_cursor, mouse.cursor_location_world_space);
        }
    }

    loadSelectionMode(enable_selection){
        super.loadBool(this.loc_selection_enabled, enable_selection);
    }

    loadScreeWidth(camera){
        super.loadFloat(this.loc_display_width, camera.width);
    }

    // loadTriangleValues(elem_data){
    //     load
    // }
}
