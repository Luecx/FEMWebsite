
class Control {

    constructor(scene) {

        this.scene = scene;
        this.lmb_pressed = false;
        this.has_dragged = false;

        // select mode: 0 = deselect, 1 = select
        this.select_mode = 1;

        // pixel space
        this.drag_root        = [0,0];
        this.drag_camera_root = [0,0];

        this.cursor_location_pixel_space  = [0,0];
        this.cursor_location_screen_space = [0,0];
        this.cursor_location_world_space  = [0,0];

        // check for ctrl key
        $(document).keydown(function(event) {
            if (event.which == "17")
                render_scene.control.select_mode = 0;
        });
        $(document).keyup(function(event) {
            if (event.which == "17"){
                render_scene.control.select_mode = 1;
            }
        });

        // setup zooming
        let zoom_function = e =>{
            e.preventDefault();
            if(e.deltaY > 0){
                this.scene.camera.width *= 1.1;
            }else{
                this.scene.camera.width *= 1.0 / 1.1;
            }
        };

        // mouse down event
        let mouse_down_function = e => {
            e.preventDefault();

            // document.getElementById('page-title-label').innerText = e.offsetX + ":" + e.offsetY;

            // if(e.buttons !== 1) return;
            this.lmb_pressed = true;
            // if the mouse is dragged, get the world root space
            // we also keep track of the camera root. The difference of the two should be kept constant
            let pixel_space       = [e.offsetX, getGLCanvas().height - e.offsetY];
            let screen_space      = this.scene.camera.getScreenSpace(pixel_space);
            this.drag_root        = this.scene.camera.getWorldSpace(screen_space);
            this.drag_camera_root = [this.scene.camera.center_x, this.scene.camera.center_y];
            this.has_dragged      = false;

            this.updateCursorLocation(e);
        }

        // touch down event
        let touch_down_event = e => {
            e.preventDefault();

            const {x, y, width, height} = e.target.getBoundingClientRect();

            // document.getElementById('page-title-label').innerText = e.changedTouches[0].screenX+ ":" + e.changedTouches[0].screenY;
            // document.getElementById('page-title-label').innerText = y;

            // if(e.buttons !== 1) return;
            this.lmb_pressed = true;
            // if the mouse is dragged, get the world root space
            // we also keep track of the camera root. The difference of the two should be kept constant
            let pixel_space       = [(e.changedTouches[0].screenX - x), getGLCanvas().height - (e.changedTouches[0].screenY - y)];
            let screen_space      = this.scene.camera.getScreenSpace(pixel_space);
            this.drag_root        = this.scene.camera.getWorldSpace(screen_space);
            this.drag_camera_root = [this.scene.camera.center_x, this.scene.camera.center_y];
            this.has_dragged      = false;

            this.updateCursorLocation(e);
        }

        // mouse up event
        let mouse_up_function = e => {
            e.preventDefault();
            // if(e.buttons !== 1) return;

            this.lmb_pressed = false;

            // go over all the nodes and select the correct nodes
            if(!this.has_dragged && this.scene.model !== null && this.scene.enable_selection){
                this.scene.model.selectNodes(this.select_mode);
            }
        }

        // mouse move function
        let mouse_move_function = e => {
            this.updateCursorLocation(e);

            if(this.lmb_pressed){
                this.has_dragged = true;
                let cursor_location_world_space  = this.scene.camera.getWorldSpace(this.cursor_location_screen_space, this.drag_camera_root);

                this.scene.camera.center_x = this.drag_camera_root[0] - (cursor_location_world_space[0] - this.drag_root[0]);
                this.scene.camera.center_y = this.drag_camera_root[1] - (cursor_location_world_space[1] - this.drag_root[1]);
            }
        }

        // touch move event
        let touch_move_function = e => {
            this.updateCursorLocation(e);

            if(this.lmb_pressed){
                this.has_dragged = true;
                let cursor_location_world_space  = this.scene.camera.getWorldSpace(this.cursor_location_screen_space, this.drag_camera_root);

                this.scene.camera.center_x = this.drag_camera_root[0] - (cursor_location_world_space[0] - this.drag_root[0]);
                this.scene.camera.center_y = this.drag_camera_root[1] - (cursor_location_world_space[1] - this.drag_root[1]);
            }
        }

        // setup zooming
        glCanvas.addEventListener('wheel', zoom_function);
        glCanvas.addEventListener('mousewheel', zoom_function);

        glCanvas.addEventListener('mousedown', mouse_down_function);
        glCanvas.addEventListener('mousemove', mouse_move_function);
        glCanvas.addEventListener('mouseup', mouse_up_function);

        glCanvas.addEventListener("touchstart", touch_down_event, false);
        glCanvas.addEventListener("touchmove", mouse_move_function, false);
        glCanvas.addEventListener("touchend", mouse_up_function, false);

    }

    updateCursorLocation(event){
        if(event.type === 'mousemove' || event.type === 'mousedown'){
            this.cursor_location_pixel_space  = [event.offsetX, getGLCanvas().height - event.offsetY];
            this.cursor_location_screen_space = this.scene.camera.getScreenSpace(this.cursor_location_pixel_space);
            this.cursor_location_world_space  = this.scene.camera.getWorldSpace(this.cursor_location_screen_space);
        }

        // document.getElementById('page-title-label').innerText = e.changedTouches[0].screenX+ ":" + e.changedTouches[0].screenY;


        if(event.type === 'touchmove'){
            const {x, y, width, height} = event.target.getBoundingClientRect();

            this.cursor_location_pixel_space  = [event.changedTouches[0].screenX - x, getGLCanvas().height - (event.changedTouches[0].screenY - y)];
            this.cursor_location_screen_space = this.scene.camera.getScreenSpace(this.cursor_location_pixel_space);
            this.cursor_location_world_space  = this.scene.camera.getWorldSpace(this.cursor_location_screen_space);
        }
    }
}

