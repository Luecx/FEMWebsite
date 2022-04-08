class Camera{

    constructor() {

        this.center_x = 0;
        this.center_y = 0;
        this.width    = 2;

    }

    getTransformation(){
        this.height = getGLCanvas().height * this.width / getGLCanvas().width;

        this.left   = this.center_x - this.width  / 2;
        this.right  = this.center_x + this.width  / 2;
        this.bottom = this.center_y - this.height / 2;
        this.top    = this.center_y + this.height / 2;

        // return new Float32Array([
        //     2 / (this.right - this.left)   , 0, -(this.right + this.left  )/(this.right - this.left  ),
        //     0, 2 / (this.top - this.bottom)   , -(this.top   + this.bottom)/(this.top   - this.bottom),
        //     0, 0                              , 1]);

        return new Float32Array([
            2 / (this.width)   , 0              , 0,
            0                  , 2/(this.height), 0,
            -(this.center_x * 2) / (this.width),
            -(this.center_y * 2) / (this.height),
            1]);
    }

    /**
     * compute the world space based on the pixel space. especially useful for any mouse input which takes pixels
     * The pixels need to be converted to screen space first.
     */
    getWorldSpace(screen_space, center = null){
        if (center === null){

            return [this.center_x + this.width  / 2 * screen_space[0],
                    this.center_y + this.height / 2 * screen_space[1]]
        }else{

            return [center[0] + this.width  / 2 * screen_space[0],
                    center[1] + this.height / 2 * screen_space[1]]
        }
    }

    getScreenSpace(pixel_space){
        return [pixel_space[0] / getGLCanvas().width  * 2 - 1,
                pixel_space[1] / getGLCanvas().height * 2 - 1]
    }

    fitToModel(model){
        if(model.fe_nodes === null) return;
        let min_x = model.fe_nodes[0].x;
        let min_y = model.fe_nodes[0].y;
        let max_x = model.fe_nodes[0].x;
        let max_y = model.fe_nodes[0].y;
        model.fe_nodes.forEach(n => {
            min_x = Math.min(n.x, min_x);
            max_x = Math.max(n.x, max_x)
            min_y = Math.min(n.y, min_y);
            max_y = Math.max(n.y, max_y);
        });

        this.width = Math.max(max_x - min_x, (max_y - min_y) * this.width / this.height) * 1.1;
        this.center_x = (max_x + min_x) / 2;
        this.center_y = (max_y + min_y) / 2;
    }
}
