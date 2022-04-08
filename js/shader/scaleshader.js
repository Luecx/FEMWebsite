
class ScaleShader extends Shader{

    constructor() {
        super(
            `
            precision highp float;
            attribute vec2 coordinates;
            
            uniform vec2 x_area; // contains the x start and end value of the total area in pixel coords
            uniform vec2 y_area; // contains the y start value and end value in pixel coordinates
            
            uniform vec2 screen_size; // screen size in pixel space
            
            void main(){
                
                vec2 coords = coordinates;
                
                // check if left or right node
                if(coords.x < 0.5){
                    //         [range 0 -> 1          ] * 2.0 - 1.0 --> screen space
                    coords.x = (x_area.x / screen_size.x) * 2.0 - 1.0;
                }else{
                    coords.x = (x_area.y / screen_size.x) * 2.0 - 1.0;
                }

                // check if top or bot node
                if(coords.y < 0.5){
                    // bot:
                    coords.y = (1.0 - y_area.y / screen_size.y) * 2.0 - 1.0;;
                }else{
                    // top (1.0 - ...) because y_area.x measures from the top
                    coords.y = (1.0 - y_area.x / screen_size.y) * 2.0 - 1.0;
                }
                
                gl_Position = vec4(coords,0.0,1.0);
            }
            `
            ,
            `
            precision highp float;
            
            uniform vec2 x_bar; // contains the x start value and width of where to draw the colorbar in pixel
                                // space
            uniform vec2 y_bar; // contains the y start value and height of where to draw the colorbar in pixel
                                // space
            uniform vec2 screen_size; // screen size in pixel space                     
            
            
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
            
            void main(){
            
                vec2 pixel_space = gl_FragCoord.xy;
                // invert pixel space y coordinate
                pixel_space.y = screen_size.y - pixel_space.y;
                
                if(   pixel_space.x > x_bar.x 
                   && pixel_space.x < x_bar.y
                   && pixel_space.y > y_bar.x 
                   && pixel_space.y < y_bar.y
                   ){
                   float value = (pixel_space.y - y_bar.x) / (y_bar.y - y_bar.x);
                   gl_FragColor  = vec4(getColorbarEntry(1.0 - value),1.0);
                }else{
                    gl_FragColor  = vec4(0.0,0.0,0.0,0.7);
                }
            
            }`);
        this.vertex_buffer = new NodeDataBuffer();
        let n1 = [0,0];
        let n2 = [1,0];
        let n3 = [0,1];
        let n4 = [1,1];
        let coords = [];
        coords.push(...n1);
        coords.push(...n2);
        coords.push(...n3);
        coords.push(...n2);
        coords.push(...n3);
        coords.push(...n4);

        this.vertex_buffer.setValues(coords);
    }

    getAllUniformLocations() {
        super.getAllUniformLocations();
        this.loc_value_range = super.getUniformLocation("value_range");
        this.loc_screen_size = super.getUniformLocation("screen_size");
        this.loc_x_bar       = super.getUniformLocation("x_bar");
        this.loc_y_bar       = super.getUniformLocation("y_bar");
        this.loc_x_area      = super.getUniformLocation("x_area");
        this.loc_y_area      = super.getUniformLocation("y_area");
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

        // start the shader
        this.start();
        // load uniforms
        this.loadScreenSize(camera);
        this.loadAreaLocation(camera);
        this.loadBarLocation(camera);

        // bind the vertices
        this.vertex_buffer.bind();

        // enable blending
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // connect the attrib pointer
        gl.vertexAttribPointer(this.loc_attrib_coords,2,gl.FLOAT, false,0,0);

        this.writeText(model, camera);

        // render
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // reset
        gl.disable(gl.BLEND);
        this.stop();
    }

    writeText(model, camera){
        let tex = getGLTextContext();
        if(tex === null) return;

        // write some text
        tex.font = "18px Arial";

        let top_v = model.node_max_value;
        let bot_v = model.node_min_value;
        let mid_v = (top_v + bot_v) / 2;

        let top_y = 30;
        let bot_y = camera.getScreenSize()[1] / 2 - 20;
        let mid_y = (top_y + bot_y) / 2;

        tex.fillText(top_v.toExponential(1), 55, top_y);
        tex.fillText(mid_v.toExponential(1), 55, mid_y);
        tex.fillText(bot_v.toExponential(1), 55, bot_y);
    }

    loadScreenSize(camera){
        super.loadVector2(this.loc_screen_size, camera.getScreenSize());
    }

    loadBarLocation(camera){
        super.loadVector2(this.loc_x_bar, [20,50]);
        super.loadVector2(this.loc_y_bar, [20,camera.getScreenSize()[1] / 2 - 20])
    }

    loadAreaLocation(camera){
        super.loadVector2(this.loc_x_area, [10,120]);
        super.loadVector2(this.loc_y_area, [10,camera.getScreenSize()[1] / 2])
    }

    // loadViewMatrix(view){
    //     super.loadMatrix3(this.loc_view_matrix, view.getTransformation())
    // }

    // loadTriangleValues(elem_data){
    //     load
    // }
}
