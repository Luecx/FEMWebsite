
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
            uniform vec2 other_range;    // range of other axis in world space 
            
            varying float other_coord;
            varying float is_bold;

            void main(){
                
                float idx = 0.0;
                float idy = 0.0;
                
                if(is_vertical > 0.0){
                    idx = coordinates.x;
                    idy = coordinates.y;
                }else{
                    idx = coordinates.y;
                    idy = coordinates.x;
                }
                
                if(idy < 0.0){
                    other_coord = other_range.x;
                }else{
                    other_coord = other_range.y;
                }
                 
                float corrected_coord = begin + step * idx;
                float screen_coord    = ((corrected_coord - screen_start) / screen_size) * 2.0 - 1.0;
                
                float md = mod(corrected_coord, step * 10.0);
                
                if(md < 0.1 * step || md > 9.9 * step){
                    is_bold = 1.0;
                }
                
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
            
            
            varying float other_coord;
            varying float is_bold;
            
            uniform float step;
            uniform float is_vertical;
            
            void main(){
                if(is_bold > 0.5){
                    gl_FragColor  = vec4(0.1,0.1,0.1,1.0);
                }else{
                    float md = mod(other_coord, step / 4.0);
                    if(md > step / 16.0 && md < step * 3.0 / 16.0) discard;  
                    gl_FragColor  = vec4(0.5,0.5,0.5,1.0);
                }
                
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
        this.loc_other_range     = super.getUniformLocation("other_range");
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
        let step       = Math.pow(10, power - 1);
        let begin_x    = step * Math.floor(camera.left / step);
        let begin_y    = step * Math.floor(camera.bottom / step);

        // load the vertical lines
        this.vertical_grid_anchor.bind();
        gl.vertexAttribPointer(this.loc_attrib_coords,2,gl.FLOAT, false,0,0);
        gl.enableVertexAttribArray(0);
        this.loadAxisInformation(true, begin_x, step, camera.left, camera.width, camera.bottom, camera.top);
        gl.drawArrays(gl.LINES, 0, 50);

        // load the horizontal lines
        this.horizontal_grid_anchor.bind();
        gl.vertexAttribPointer(this.loc_attrib_coords,2,gl.FLOAT, false,0,0);
        gl.enableVertexAttribArray(0);
        this.loadAxisInformation(false, begin_y, step, camera.bottom, camera.height, camera.left, camera.right);
        gl.drawArrays(gl.LINES, 0, 50);

        // render axis labels
        this.writeText(model, camera, begin_x, begin_y, step);


        this.stop();
    }

    writeText(model, camera, begin_x, begin_y, step){
        let tex = getGLTextContext();
        if(tex === null) return;

        // write some text
        tex.font = "12px Helvetica";
        tex.fillStyle  = '#4c4c4c'

        let x_screen_size = camera.getScreenSize()[0]
        let y_screen_size = camera.getScreenSize()[1]

        let remove_trailing_zeros = (x) => {
            return (parseFloat(x)).toString();
        };

        let write_some_text = (world, x, y, step) => {
            let text = ""
            if (step > 1e3 || step < 1e-3){
                text = world.toExponential(2)
            }else{
                text = remove_trailing_zeros(world.toPrecision(4));
            }


            let md = world - (step * 10.0) * Math.floor(world/(step * 10.0))
            if(md < 0.1 * step || md > 9.9 * step){
                tex.font = "bold 14px Arial";
                tex.fillStyle  = '#333333';
            }else{
                tex.font = "12px Arial";
                tex.fillStyle  = '#4c4c4c';
            }


            tex.fillText(text, x, y);
        }

        for(let i = 0; i < 25; i++){
            let x_world       = begin_x + i * step;
            let x_camera      = x_world - camera.left;
            let x_pixel       = x_screen_size * x_camera / camera.width;

            let y_world       = begin_y + i * step;
            let y_camera      = y_world - camera.bottom;
            let y_pixel       = y_screen_size * (1 - y_camera / camera.height);

            if(step > 1e3 || step < 1e-3){
                write_some_text(x_world, Math.round(x_pixel)+3, y_screen_size - 10, step);
                write_some_text(y_world, x_screen_size - 50, Math.round(y_pixel) - 3, step);
            }else{
                write_some_text(x_world, Math.round(x_pixel)+3, y_screen_size - 10, step);
                write_some_text(y_world, x_screen_size - 50, Math.round(y_pixel) - 3, step);
            }
        }

    }

    loadAxisInformation(vertical, begin, step, screen_start, screen_size, begin_other, begin_end){
        super.loadBool (this.loc_is_vertical, vertical);
        super.loadFloat(this.loc_begin, begin);
        super.loadFloat(this.loc_step, step);
        super.loadFloat(this.loc_screen_start, screen_start);
        super.loadFloat(this.loc_screen_size, screen_size);
        super.loadVector2(this.loc_other_range, [begin_other, begin_end]);
    }

}
