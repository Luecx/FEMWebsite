
class ArrowShader extends Shader{

    constructor() {
        super(
            `
            precision highp float;
            
            attribute vec2 arrow_coords;
            attribute vec2 arrow_base;
            attribute vec2 arrow_direction;
            
            uniform mat3 viewMatrix;
            uniform vec2 arrowDirectionMask;
            uniform float cameraWidth;
            
            varying float invalid;
            
            float atan2(float y, float x){
                return x == 0.0 ? sign(y) * 3.141592 / 2.0 : atan(y, x);
            }
            
            vec2 rotate(vec2 point, float angle, vec2 pivot){
                float x = point.x;
                float y = point.y;
            
                float rX = pivot.x + (x - pivot.x) * cos(angle) - (y - pivot.y) * sin(angle);
                float rY = pivot.y + (x - pivot.x) * sin(angle) + (y - pivot.y) * cos(angle);
            
                return vec2(rX, rY);
            }
            
            void main(){
                
                // mask using element wise multiplication
                vec2 arrow_dir = arrow_direction * arrowDirectionMask;
                
                // discard any disabled / no direction arrows
                if(length(arrow_dir) == 0.0){
                    invalid = 1.0;
                }else{
                    invalid = 0.0;
                }
                
                vec2 world_space = arrow_coords;
                
                // scale the arrow by the screen width 
                world_space = world_space * (cameraWidth / 20.0);

                // rotate the arrow
                float angle = atan2(arrow_dir.y, arrow_dir.x);
                world_space = rotate(world_space, angle - 3.141592 / 2.0, vec2(0,0));
                
                // add the base
                world_space = world_space + arrow_base;
                
                gl_Position = vec4((viewMatrix * vec3(world_space, 1.0)).xy,0.0,1.0);
            }`,
            `
            precision highp float;
            
            uniform vec3 arrowColor;
            
            varying float invalid;
            
            void main(){
                if(invalid > 0.5){
                    discard;
                }
                gl_FragColor  = vec4(arrowColor,1.0);
            }`);


        let width_base  = 0.2;
        let width_head  = 0.5;
        let length_base = 0.7;
        let length_head = 0.3;

        let n1 = [width_base / 2, 0];
        let n2 = [width_base / 2, length_base];
        let n3 = [width_head / 2, length_base];
        let n4 = [0, length_base + length_head];
        let n5 = [-n3[0], n3[1]];
        let n6 = [-n2[0], n2[1]];
        let n7 = [-n1[0], n1[1]];

        let arrow_vertices = [];
        // first triangle base (bottom right)
        arrow_vertices.push(...n1);
        arrow_vertices.push(...n2);
        arrow_vertices.push(...n7);
        // second triangle base (top left)
        arrow_vertices.push(...n2);
        arrow_vertices.push(...n6);
        arrow_vertices.push(...n7);
        // triangle head left
        arrow_vertices.push(...n4);
        arrow_vertices.push(...n5);
        arrow_vertices.push(...n6);
        // triangle head center
        arrow_vertices.push(...n2);
        arrow_vertices.push(...n4);
        arrow_vertices.push(...n6);
        // triangle head right
        arrow_vertices.push(...n2);
        arrow_vertices.push(...n3);
        arrow_vertices.push(...n4);
        this.arrow_vertex_buffer = new NodeDataBuffer();
        this.arrow_vertex_buffer.setValues(arrow_vertices);
    }

    getAllUniformLocations() {
        super.getAllUniformLocations();
        this.loc_view_matrix = super.getUniformLocation("viewMatrix");
        this.loc_camera_width = super.getUniformLocation("cameraWidth");
        this.loc_arrow_direction_mask = super.getUniformLocation("arrowDirectionMask");
        this.loc_arrow_color = super.getUniformLocation("arrowColor");
    }

    getAllAttributeLocations(){
        super.getAllAttributeLocations();
        this.loc_attrib_arrow_coords    = super.getAttributeLocation("arrow_coords");
        this.loc_attrib_arrow_base      = super.getAttributeLocation("arrow_base");
        this.loc_attrib_arrow_direction = super.getAttributeLocation("arrow_direction");
    }

    connectAllTextureUnits() {
        super.connectAllTextureUnits();
    }

    render(model, camera, is_force){
        let gl = getGLContext();
        let glext = getGLContextExtension();
        if (gl === null) return;
        if (glext === null) return;

        // check if the model is actually not complete
        if(model                           === null) return;
        if(model.node_location_buffer.data === null) return;

        // start the shader
        this.start();

        // load uniforms
        this.loadViewMatrix(camera);
        this.loadCameraWidth(camera);
        this.loadColor(is_force);

        // bind arrow vertices
        this.bindVertexAttributes(model, is_force);

        // draw
        if(is_force){
            this.loadDirectionMask([1,1]);
            glext.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 15, model.node_location_buffer.data.length / 2);
        } else{
            this.loadDirectionMask([1,0]);
            glext.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 15, model.node_location_buffer.data.length / 2);
            this.loadDirectionMask([0,1]);
            glext.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 15, model.node_location_buffer.data.length / 2);
        }

        // reset and unbind
        this.unbindVertexAttributes();
        this.stop();
    }
    bindVertexAttributes(model, is_force){

        let gl = getGLContext();
        let glext = getGLContextExtension();

        // bind arrow vertices
        this.arrow_vertex_buffer.bind();
        gl.vertexAttribPointer(this.loc_attrib_arrow_coords,2,gl.FLOAT, false,0,0);

        // bind arrow base instanced --> node coordinates
        model.node_location_buffer.bind();
        gl.vertexAttribPointer(this.loc_attrib_arrow_base,2,gl.FLOAT, false,0,0);
        gl.enableVertexAttribArray(this.loc_attrib_arrow_base);
        glext.vertexAttribDivisorANGLE(this.loc_attrib_arrow_base, 1);

        // bind the direction
        if(is_force){
            model.node_force_buffer.bind();
        }else{
            model.node_restrict_buffer.bind();
        }
        gl.vertexAttribPointer(this.loc_attrib_arrow_direction,2,gl.FLOAT, false,0,0);
        gl.enableVertexAttribArray(this.loc_attrib_arrow_direction);
        glext.vertexAttribDivisorANGLE(this.loc_attrib_arrow_direction, 1);
    }
    unbindVertexAttributes(){
        let glext = getGLContextExtension();

        glext.vertexAttribDivisorANGLE(this.loc_attrib_arrow_base, 0);
        glext.vertexAttribDivisorANGLE(this.loc_attrib_arrow_direction, 0);
    }
    loadViewMatrix(view){
        super.loadMatrix3(this.loc_view_matrix, view.getTransformation());
    }
    loadCameraWidth(camera){
        super.loadFloat(this.loc_camera_width, camera.width);
    }
    loadDirectionMask(mask){
        super.loadVector2(this.loc_arrow_direction_mask, mask);
    }
    loadColor(is_force){
        if(is_force){
            // if its a force, upload some olive color
            super.loadVector3(this.loc_arrow_color, [154.0/255.0,185.0/255.0,115.0/255.0]);
        } else{
            // if its a support, use some black-grey color
            super.loadVector3(this.loc_arrow_color, [0.3,0.3,0.3]);
        }

    }
}
