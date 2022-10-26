

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
        this.node_location_buffer     = new NodeDataBuffer();
        this.node_value_buffer        = new NodeDataBuffer();
        this.node_displacement_buffer = new NodeDataBuffer();
        this.node_selected_buffer     = new NodeDataBuffer();
        this.node_index_buffer        = new IndexBuffer();
        this.surround_index_buffer    = new IndexBuffer();

        // to display the values, we need the range of them
        this.node_min_value           = 0;
        this.node_max_value           = 1;

        // to display boundary conditions (2x for supports, 1 for forces)
        this.node_restrict_buffer     = new NodeDataBuffer();
        this.node_force_buffer        = new NodeDataBuffer();

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
        this.setNodeValues(null);
        this.node_selected_buffer .setValues(new Float32Array(this.fe_nodes.length));
        this.node_force_buffer    .setValues(new Float32Array(this.fe_nodes.length * 2));
        this.node_restrict_buffer .setValues(new Float32Array(this.fe_nodes.length * 2));

        // finally notify
        this.model_data.notify("meshchanged", [this.fe_nodes.length, this.fe_elements.length]);
    }

    // setting the node values from an entry (LoadCaseValues) (see model_data.js)
    // also detects displacement fields
    setNodeValues(load_case_values){
        if(load_case_values === null){
            this.node_value_buffer       .setValues(new Float32Array(this.fe_nodes.length));
            this.node_displacement_buffer.setValues(new Float32Array(this.fe_nodes.length * 2));
            this.node_min_value = 0;
            this.node_max_value = 1;
        }else{
            // check if there is a displacement field assigned too
            let id_data = load_case_values.loadcase_result_id;
            let dx_data = id_data.getField('Displacement X')
            let dy_data = id_data.getField('Displacement Y');
            // no displacement data found
            if(!(dx_data === null || dy_data === null)){
                let disp_vector = new Float32Array(this.fe_nodes.length * 2);
                for(let i = 0; i < this.fe_nodes.length; i++){
                    disp_vector[i * 2    ] = dx_data.values[i]
                    disp_vector[i * 2 + 1] = dy_data.values[i];
                }
                this.node_displacement_buffer.setValues(disp_vector);
            }else{
                this.node_displacement_buffer.setValues(new Float32Array(this.fe_nodes.length * 2));
            }
            // set the values to the node buffer
            this.node_value_buffer.setValues(load_case_values.values);
            // update min / max
            this.resetMinMaxNodeValue();
        }
        this.model_data.notify("displayedvalueschanged", [load_case_values]);
    }

    resetMinNodeValue(){
        if(this.node_value_buffer.data !== null)
            this.node_min_value = Math.min(...this.node_value_buffer.data);
        else
            this.node_min_value = 0;
    }

    resetMaxNodeValue(){
        if(this.node_value_buffer.data !== null)
            // if min == max == 0, set max to 1
            if(Math.min(...this.node_value_buffer.data) ===
               Math.max(...this.node_value_buffer.data))
                this.node_max_value = Math.max(...this.node_value_buffer.data) + 1;
            else{
                this.node_max_value = Math.max(...this.node_value_buffer.data);
            }
        else
            this.node_max_value = 1;
    }

    resetMinMaxNodeValue(){
        this.resetMinNodeValue();
        this.resetMaxNodeValue();
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