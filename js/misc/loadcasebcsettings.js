let loadcase_support_x_enabled = document.getElementById("loadcase-support-x-enabled");
let loadcase_support_y_enabled = document.getElementById("loadcase-support-y-enabled");
let loadcase_support_x_value   = document.getElementById("loadcase-support-x-value");
let loadcase_support_y_value   = document.getElementById("loadcase-support-y-value");
let loadcase_support_selector  = document.getElementById("loadcase-support-select-nodes");
let loadcase_support_apply     = document.getElementById("loadcase-support-generate");

let loadcase_force_x_value     = document.getElementById("loadcase-force-x-value");
let loadcase_force_y_value     = document.getElementById("loadcase-force-y-value");
let loadcase_force_selector    = document.getElementById("loadcase-force-select-nodes");
let loadcase_force_apply       = document.getElementById("loadcase-force-generate");

enable_toggle("loadcase-force-select-nodes", tb_on_state_1, tb_off_state_2, false,function (state){
    render_scene.enable_selection      = state;
    loadcase_force_apply.disabled      = !state;
    loadcase_support_selector.disabled = state;
});
enable_toggle("loadcase-support-select-nodes", tb_on_state_1, tb_off_state_2, false,function (state){
    render_scene.enable_selection = state;
    loadcase_support_apply.disabled = !state;
    loadcase_force_selector.disabled = state;
});

function loadcase_bc_reset(){
    toggle_off(loadcase_force_selector);
    toggle_off(loadcase_support_selector);
    // disable selection in the graphics window
    render_scene.enable_selection = false;
    // reenable both selectors abd disable the apply buttons
    loadcase_force_selector.disabled = false;
    loadcase_support_selector.disabled = false;
    loadcase_force_apply.disabled = true;
    loadcase_support_apply.disabled = true;
    // unselect all nodes
    render_scene.model.unselectAllNodes();
}

loadcase_support_apply.onclick = function() {
    // extract the model data for simplicity
    let model_data     = render_scene.model.model_data;
    // get the active loadcase
    let active_lc_name = model_data.getActiveLoadCaseName();
    // get the loadcase
    let load_case      = model_data.getLoadCase(active_lc_name);

    // get loadcase data for the restrict and displace fields
    let restrict_data  = load_case.getLoadCaseData(LCData.RESTRICT);
    let displace_data  = load_case.getLoadCaseData(LCData.DISPLACE);
    // generate new arrays which will then overwrite the loadcase data
    let restrict_arr   = Object.values(restrict_data.values);
    let displace_arr   = Object.values(displace_data.values);


    for(let i = 0; i < render_scene.model.fe_nodes.length; i++){
        if(render_scene.model.node_selected_buffer.data[i] > 0){
            restrict_arr[i * 2 + 0] = loadcase_support_x_enabled.checked ? 1:0;
            restrict_arr[i * 2 + 1] = loadcase_support_y_enabled.checked ? 1:0;
            displace_arr[i * 2 + 0] = parseFloat(loadcase_support_x_value.value);
            displace_arr[i * 2 + 1] = parseFloat(loadcase_support_y_value.value);
        }
    }
    // feed that data back into the the data fields
    load_case.setLoadCaseData(LCData.RESTRICT, restrict_arr);
    load_case.setLoadCaseData(LCData.DISPLACE, displace_arr);

    loadcase_bc_reset();

}
loadcase_force_apply.onclick = function (){
    // extract the model data for simplicity
    let model_data     = render_scene.model.model_data;
    // get the active loadcase
    let active_lc_name = model_data.getActiveLoadCaseName();
    // get the loadcase
    let load_case      = model_data.getLoadCase(active_lc_name);

    // get loadcase data for the force fields
    let force_data  = load_case.getLoadCaseData(LCData.FORCE);
    // generate new arrays which will then overwrite the loadcase data
    let force_arr   = Object.values(force_data.values);

    for(let i = 0; i < render_scene.model.fe_nodes.length; i++){
        if(render_scene.model.node_selected_buffer.data[i] > 0){
            force_arr[i * 2 + 0] = parseFloat(loadcase_force_x_value.value);
            force_arr[i * 2 + 1] = parseFloat(loadcase_force_y_value.value);
        }
    }

    // feed that data back into the the data fields
    load_case.setLoadCaseData(LCData.FORCE, force_arr);

    console.log()

    loadcase_bc_reset();
}