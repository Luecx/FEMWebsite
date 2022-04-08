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

enable_toggle("loadcase-force-select-nodes", function (state){
    render_scene.enable_selection      = state;
    loadcase_force_apply.disabled      = !state;
    loadcase_support_selector.disabled = state;
});
enable_toggle("loadcase-support-select-nodes", function (state){
    render_scene.enable_selection = state;
    loadcase_support_apply.disabled = !state;
    loadcase_force_selector.disabled = state;
});
loadcase_support_apply.onclick = function() {
    // if the toggle selector is still toggled on, disable it
    let load_case_data = render_scene.model.model_data.getLoadCaseData(loadcase_select.value);
    for(let i = 0; i < render_scene.model.fe_nodes.length; i++){
        if(render_scene.model.node_selected_buffer.data[i] > 0){
            load_case_data[LoadCaseOtherData.RESTRICT][i * 2 + 0] = loadcase_support_x_enabled.checked;
            load_case_data[LoadCaseOtherData.RESTRICT][i * 2 + 1] = loadcase_support_y_enabled.checked;
            load_case_data[LoadCaseOtherData.DISPLACE][i * 2 + 0] = parseFloat(loadcase_support_x_value.value);
            load_case_data[LoadCaseOtherData.DISPLACE][i * 2 + 1] = parseFloat(loadcase_support_y_value.value);
        }
    }
    toggle_off(loadcase_support_selector);
    render_scene.model.updateBoundaryData(loadcase_select.value);
    render_scene.enable_selection = false;
    // reenable both selectors
    loadcase_force_selector.disabled = false;
    loadcase_support_selector.disabled = false;
    loadcase_support_apply.disabled = true;
    // unselect all nodes
    render_scene.model.unselectAllNodes();
}
loadcase_force_apply.onclick = function (){
    // if the toggle selector is still toggled on, disable it
    let load_case_data = render_scene.model.model_data.getLoadCaseData(loadcase_select.value);
    for(let i = 0; i < render_scene.model.fe_nodes.length; i++){
        if(render_scene.model.node_selected_buffer.data[i] > 0){
            load_case_data[LoadCaseOtherData.FORCE][i * 2 + 0] = parseFloat(loadcase_force_x_value.value);
            load_case_data[LoadCaseOtherData.FORCE][i * 2 + 1] = parseFloat(loadcase_force_y_value.value);
        }
    }
    toggle_off(loadcase_force_selector);
    render_scene.model.updateBoundaryData(loadcase_select.value);
    render_scene.enable_selection = false;
    // reenable both selectors
    loadcase_force_selector.disabled = false;
    loadcase_support_selector.disabled = false;
    loadcase_force_apply.disabled = true;
    // unselect all nodes
    render_scene.model.unselectAllNodes();
}