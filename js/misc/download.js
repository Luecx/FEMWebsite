function download_txt(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function build_input(){
    let model = getModel();
    let input_string = "";
    // write nodes
    input_string += "*NODE,NSET=NALL\n";
    for(let i = 0; i < model.fe_nodes.length; i++){
        input_string += (i+1) + "," + model.fe_nodes[i].x + "," + model.fe_nodes[i].y + "\n";
    }
    // write elements
    let nodes_per_element = model.fe_elements[0].node_ids.length;
    input_string += "*ELEMENT,ELSET=EALL,TYPE=C2D" + nodes_per_element +"\n";
    for(let i = 0; i < model.fe_elements.length; i++){
        input_string += (i+1);
        for(let n = 0; n < nodes_per_element; n++){
            input_string += "," + (model.fe_elements[i].node_ids[n] + 1);
        }
        input_string += "\n";
    }
    // write materials
    input_string += "*MATERIAL, NAME=MAT_1\n*ELASTIC, TYPE=ISOTROPIC\n"
        + model.model_data.material[0] + ","
        + model.model_data.material[1] + "\n";
    input_string += "*DENSITY\n7000.0\n";
    input_string += "*SOLID SECTION\nEALL, MAT_1\n"

    // supports
    input_string += "*BOUNDARY\n";

    // get loadcase data for the restrict and displace fields
    let load_case     = model.model_data.getActiveLoadCase();
    let restrict_data = load_case.getLoadCaseData(LCData.RESTRICT);
    let displace_data = load_case.getLoadCaseData(LCData.DISPLACE);
    let force_data    = load_case.getLoadCaseData(LCData.FORCE);

    for(let i = 0; i < getModel().fe_nodes.length * 2; i++){
        if(restrict_data.values[i] !== 0){
            let node_id = Math.floor(i / 2) + 1;
            let dim     = (i % 2) + 1;
            input_string += node_id + "," + dim + "," + displace_data.values[i] + "\n";
        }
    }

    // loads
    input_string += "*CLOAD\n";
    for(let i = 0; i < getModel().fe_nodes.length * 2; i++){
        if(force_data.values[i] !== 0){
            let node_id = Math.floor(i / 2) + 1;
            let dim     = i % 2;
            input_string += node_id + "," + dim + "," + force_data.values[i] + "\n";
        }
    }
    return input_string;
}

function download_mesh(){
    download_txt("mesh.txt", build_input())
}