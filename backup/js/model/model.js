

class Node{
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
}

class Triangle{

    constructor(id_1,id_2,id_3) {
        this.node_1_id = id_1;
        this.node_2_id = id_2;
        this.node_3_id = id_3;
    }
}

class Line{
    constructor(id_1, id_2) {
        this.node_1_id = id_1;
        this.node_2_id = id_2;
    }
}


class Model{

    constructor(scene) {
        // store the scene
        this.scene = scene;

        // generate some buffers for rendering
        this.node_location_buffer  = new NodeDataBuffer();
        this.node_value_buffer     = new NodeDataBuffer();
        this.node_selected_buffer  = new NodeDataBuffer();
        this.node_index_buffer     = new IndexBuffer();
        this.surround_index_buffer = new IndexBuffer();

        // to display boundary conditions (2x for supports, 1 for forces)
        this.node_restrict_buffer  = new NodeDataBuffer();
        this.node_force_buffer     = new NodeDataBuffer();

        // append all the fe data like boundary conditions, loadcases and their results
        this.model_data  = new ModelData(this);

        // fem elements
        this.fe_nodes    = [];
        this.fe_elements = [];
    }

    // set the geometry
    setGeometry(nodes, elements){

        this.fe_nodes    = nodes;
        this.fe_elements = elements;
        this.model_data.clear();

        // collect coords, indices and surrounding lines from each element
        let coords    = [];
        let lines     = [];
        let triangles = [];

        this.fe_nodes   .forEach(node    => Array.prototype.push.apply(coords, [node.x, node.y]));
        this.fe_elements.forEach(element => Array.prototype.push.apply(triangles, element.triangulate()));
        this.fe_elements.forEach(element => Array.prototype.push.apply(lines, element.surround()));

        // extract the indices from the triangles
        let indices   = [];
        let surround  = [];
        triangles.forEach(tri  => Array.prototype.push.apply(indices , [tri.node_1_id, tri.node_2_id, tri.node_3_id]));
        lines    .forEach(line => Array.prototype.push.apply(surround, [line.node_1_id, line.node_2_id]));

        this.node_index_buffer    .setValues(indices);
        this.node_location_buffer .setValues(coords);
        this.surround_index_buffer.setValues(surround);

        // set the content of the node value buffer to zeros initially
        this.node_value_buffer    .setValues(new Float32Array(this.fe_nodes.length));
        this.node_selected_buffer .setValues(new Float32Array(this.fe_nodes.length));
        this.node_force_buffer    .setValues(new Float32Array(this.fe_nodes.length * 2));
        this.node_restrict_buffer .setValues(new Float32Array(this.fe_nodes.length * 2));

        let random_values = new Float32Array(this.fe_nodes.length);
        for(let i = 0; i < this.fe_nodes.length; i++){
            random_values[i] = Math.random();
        }
        this.node_value_buffer.setValues(random_values)
    }

    unselectAllNodes(){
        this.node_selected_buffer.setValues(new Float32Array(this.fe_nodes.length));
    }

    // select nodes
    selectNodes(mode){

        let location     = this.scene.control.cursor_location_world_space;
        let camera_width = this.scene.camera.width;

        for(let i = 0; i < this.fe_nodes.length; i++){
            let n = this.fe_nodes[i];
            if(Math.sqrt((n.x - location[0])**2 + (n.y - location[1])**2) < (camera_width / 75)){
                this.node_selected_buffer.setValue(i,mode);
            }
        }
    }

    // set the support and force vectors from the model data object
    updateBoundaryData(load_case){
        let load_case_data = this.model_data.getLoadCaseData(load_case);
        this.node_restrict_buffer.setValues(load_case_data[LoadCaseOtherData.RESTRICT]);
        this.node_force_buffer   .setValues(load_case_data[LoadCaseOtherData.FORCE]);
    }
}