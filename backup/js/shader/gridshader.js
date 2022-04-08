
class GridShader extends Shader{

    constructor() {
        super(
            `
            precision highp float;
            attribute vec2 coordinates;
            
            uniform float is_vertical;
            uniform float begin;    // which global coordinate to start from
            uniform float step;     // gaps between lines in global coordinates
            uniform float screen_start;    // the start of the screen / camera
            uniform float screen_size;     // view size of the camera
                        
            void main(){
                
                float idx = 0.0;
                
                if(is_vertical > 0.0){
                    idx = coordinates.x;
                }else{
                    idx = coordinates.y;
                }
                
                float corrected_coord = begin + step * idx;
                float screen_coord    = ((corrected_coord - screen_start) / screen_size) * 2.0 - 1.0;
                
                if(is_vertical > 0.0){
                    gl_Position = vec4(screen_coord, coordinates.y,0.0,1.0);
                }else{
                    gl_Position = vec4(coordinates.x,screen_coord, 0.0,1.0);
                }
                
            }
            `
            ,
            `
            precision highp float;
            void main(){
                gl_FragColor  = vec4(0.3,0.3,0.3,1.0);
            }`);


        // generate the grid buffers here
        this.vertical_grid_anchor   = new NodeDataBuffer();
        this.horizontal_grid_anchor = new NodeDataBuffer();

        let anchor_coords_hor = [];
        let anchor_coords_ver = [];
        // use max 25 lines in each direction
        // the math will be done on 20 lines but 5 are used in case of any inaccuracy
        for(let i = 0; i < 25; i++){
            Array.prototype.push.apply(anchor_coords_ver, [i,-1,i,1]);
            Array.prototype.push.apply(anchor_coords_hor, [-1,i,1,i]);
        }

        this.vertical_grid_anchor  .setValues(anchor_coords_ver);
        this.horizontal_grid_anchor.setValues(anchor_coords_hor);
    }

    getAllUniformLocations() {
        super.getAllUniformLocations();
        this.loc_is_vertical     = super.getUniformLocation("is_vertical");
        this.loc_begin           = super.getUniformLocation("begin");
        this.loc_step            = super.getUniformLocation("step");
        this.loc_screen_start    = super.getUniformLocation("screen_start");
        this.loc_screen_size     = super.getUniformLocation("screen_size");
    }

    getAllAttributeLocations(){
        super.getAllAttributeLocations();
        this.loc_attrib_coords   = super.getAttributeLocation("coordinates");
    }

    connectAllTextureUnits() {
        super.connectAllTextureUnits();
    }

    render(camera){
        let gl = getGLContext();
        if(gl === null) return;

        // start the shader
        this.start();

        // compute the dimension of each axis and decide how big each intervall should be.
        // for this, we first compute the transformation which automatically computes width and height of the camera
        camera.getTransformation();
        // x and y range
        let x_range = camera.width;
        let y_range = camera.height;
        // maximum range of both of them to use same step in both directions
        let range   = Math.max(x_range, y_range);
        // we have 20 grid lines into both directions -> use 10 for half the range
        let half_range = range / 2;
        // compute the nearest power which divides the half range
        let power      = Math.ceil(Math.log10(half_range));
        // the step can be computed from power - 1 since we have 10 grid lines per half_range.
        let step       = Math.pow(10, Math.ceil(Math.log10(half_range)) - 1);
        let begin_x    = step * Math.floor(camera.left / step);
        let begin_y    = step * Math.floor(camera.bottom / step);

        // load the vertical lines
        this.vertical_grid_anchor.bind();
        gl.vertexAttribPointer(this.loc_attrib_coords,2,gl.FLOAT, false,0,0);
        gl.enableVertexAttribArray(0);
        this.loadAxisInformation(true, begin_x, step, camera.left, camera.width);
        gl.drawArrays(gl.LINES, 0, 50);

        this.horizontal_grid_anchor.bind();
        gl.vertexAttribPointer(this.loc_attrib_coords,2,gl.FLOAT, false,0,0);
        gl.enableVertexAttribArray(0);
        this.loadAxisInformation(false, begin_y, step, camera.bottom, camera.height);
        gl.drawArrays(gl.LINES, 0, 50);

        this.stop();
    }

    loadAxisInformation(vertical, begin, step, screen_start, screen_size){
        super.loadBool (this.loc_is_vertical, vertical);
        super.loadFloat(this.loc_begin, begin);
        super.loadFloat(this.loc_step, step);
        super.loadFloat(this.loc_screen_start, screen_start);
        super.loadFloat(this.loc_screen_size, screen_size);
    }

}
