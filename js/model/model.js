

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

        // to display the values, we need the range of them
        this.node_min_value        = 0;
        this.node_max_value        = 1;

        // to display boundary conditions (2x for supports, 1 for forces)
        this.node_restrict_buffer  = new NodeDataBuffer();
        this.node_force_buffer     = new NodeDataBuffer();

        // append all the fe data like boundary conditions, loadcases and their results
        this.model_data  = new ModelData(this);

        // fem elements
        this.fe_nodes    = [];
        this.fe_elements = [];

        // setup listeners
        (model => {
            model.model_data.addEventListener('loadcasedatachanged', function (lc, lcd){
                if(model.model_data.getActiveLoadCaseName() === lc.name){
                    if(lcd.name === LCData.RESTRICT){
                        model.node_restrict_buffer.setValues(lcd.values);
                    }else if(lcd.name === LCData.FORCE){
                        model.node_force_buffer   .setValues(lcd.values);
                    }
                }
            })
        })(this);

        (model => {
            model.model_data.addEventListener('activeloadcasechanged', function (lcname){
                let active_loadcase = model.model_data.getActiveLoadCase();
                if (active_loadcase === null) {
                    model.node_restrict_buffer.setValues(new Float32Array(model.fe_nodes.length * 2));
                    model.node_force_buffer   .setValues(new Float32Array(model.fe_nodes.length * 2));
                } else {
                    model.node_restrict_buffer.setValues(active_loadcase.getLoadCaseData(LCData.RESTRICT).values);
                    model.node_force_buffer   .setValues(active_loadcase.getLoadCaseData(LCData.FORCE).values);
                }

            })
        })(this);
    }

    // set the geometry
    setGeometry(nodes, elements){

        this.fe_nodes    = nodes;
        this.fe_elements = elements;
        this.model_data.clearLoadCases();

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

        // finally notify
        this.model_data.notify("meshchanged", [this.fe_nodes.length, this.fe_elements.length]);
    }

    setNodeValues(values){
        if(values === null){
            this.node_value_buffer.setValues(new Float32Array(this.fe_nodes.length));
        }else{
            this.node_value_buffer.setValues(values);
            this.node_min_value = Math.min(...values);
            this.node_max_value = Math.max(...values);
        }
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
}