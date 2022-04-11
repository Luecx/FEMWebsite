let sa_valid_mesh_icon_icon  = document.getElementById("static-analysis-valid-mesh-icon");
let sa_material_applied_icon = document.getElementById("static-analysis-material-applied-icon");
let sa_supports_set_icon     = document.getElementById("static-analysis-supports-set-icon");
let sa_forces_applied_icon   = document.getElementById("static-analysis-forces-applied-icon");
let sa_run_button            = document.getElementById("static-analysis-run-button");

let sa_progress_info         = document.getElementById("static-analysis-progress-info");

let sa_progress_bar_1        = document.getElementById("static-analysis-progress-1");
let sa_progress_bar_2        = document.getElementById("static-analysis-progress-2");
let sa_progress_bar_3        = document.getElementById("static-analysis-progress-3");
let sa_progress_bar_4        = document.getElementById("static-analysis-progress-4");

toggle_icon_off(sa_valid_mesh_icon_icon);
toggle_icon_off(sa_material_applied_icon);
toggle_icon_off(sa_supports_set_icon);
toggle_icon_off(sa_forces_applied_icon);

enable_toggle("static-analysis-run-button", tb_on_state_2, tb_off_state_3, true, ()=>{});

function staticanalysis_init(){
    render_scene.model.model_data.addEventListener('materialchanged', function (young, poisson){
        if(young > 0 && poisson >= 0 && poisson <= 0.5){
            toggle_icon_on(sa_material_applied_icon);
        }else{
            toggle_icon_off(sa_material_applied_icon);
        }
        check_run_button_state();
    })
    render_scene.model.model_data.addEventListener('meshchanged', function (nnodes, nelements){
        if(nnodes > 0 && nelements >= 0){
            toggle_icon_on(sa_valid_mesh_icon_icon);
        }else{
            toggle_icon_off(sa_valid_mesh_icon_icon);
        }
        check_run_button_state();
    })
    render_scene.model.model_data.addEventListeners(['activeloadcasechanged', 'loadcasedatachanged'], function (){
        // go through the data and count supports and forces
        let load_case = render_scene.model.model_data.getActiveLoadCase();
        // if there is no loadcase for some reason, toggle it off
        if(load_case === null){
            toggle_icon_off(sa_forces_applied_icon);
            toggle_icon_off(sa_supports_set_icon);
            return;
        }

        // get loadcase data for the force fields
        let force_data    = load_case.getLoadCaseData(LCData.FORCE);
        let restrict_data = load_case.getLoadCaseData(LCData.RESTRICT);

        // check forces first. The condition is that there is atleast one non-zero value.
        let forces_applied = false;
        for(let i = 0; i < force_data.values.length; i++){
            if(force_data.values[i] !== 0){
                forces_applied = true;
                break;
            }
        }

        if(forces_applied){
            toggle_icon_on(sa_forces_applied_icon);
        }else{
            toggle_icon_off(sa_forces_applied_icon);
        }

        // check supports
        let supports_x = 0;
        let supports_y = 0;
        for(let i = 0; i < restrict_data.values.length; i+=2){
            if(restrict_data.values[i  ] !== 0) supports_x ++;
            if(restrict_data.values[i+1] !== 0) supports_y ++;
        }
        let is_supported = (supports_x + supports_y) > 3 && (supports_x * supports_x) > 0;

        if(is_supported){
            toggle_icon_on(sa_supports_set_icon);
        }else{
            toggle_icon_off(sa_supports_set_icon);
        }
        check_run_button_state();
    })
}

function check_run_button_state(){
    sa_run_button.disabled = !(
        get_icon_state(sa_valid_mesh_icon_icon)  &&
        get_icon_state(sa_material_applied_icon) &&
        get_icon_state(sa_supports_set_icon)     &&
        get_icon_state(sa_forces_applied_icon)   &&
        ffes_loadcase_name === null);
    if(sa_run_button.disabled){
        toggle_off(sa_run_button);
    }else{
        toggle_on(sa_run_button);
    }
}

let ffes_solver        = null;
let ffes_loadcase_name = null;

(async () => {
    const k = await FFES()
    k.addMessageListener('analysis', msg => {
        let info = msg[0];
        if (info.startsWith("Attempting to solve matrix:")) {
            sa_progress_bar_1.setAttribute('style', 'width:10%');
            sa_progress_info.innerText = "Preprocessing finished. Trying to decompose matrix"
        }
        if (info.startsWith("Decomposition finished;")) {
            sa_progress_bar_2.setAttribute('style', 'width:60%');
            sa_progress_info.innerText = "Decomposition finished. Trying to solve equations"
        }
        if (info.startsWith("Solving finished;")) {
            sa_progress_bar_3.setAttribute('style', 'width:25%');
            sa_progress_info.innerText = "Solving finished. Postprocessing results"
        }
        if (info.startsWith("Finished computation")) {
            sa_progress_bar_4.setAttribute('style', 'width:5%');
            sa_progress_info.innerText = "Finished computation";

            let loadcase = render_scene.model.model_data.getLoadCase(ffes_loadcase_name);
            if(loadcase !== null){

                // make sure an empty id entry exists
                let analysis = loadcase.getLoadCaseResult(LCResults.ANALYSIS);
                analysis.clearLoadCaseSourceIDs();
                analysis.addLoadCaseSourceID();
                let entry = analysis.getLoadCaseSourceID(1);


                // get the result data
                let result_data = msg[1];
                console.log(result_data);
                for (const [key, value] of Object.entries(result_data)) {
                    entry.addField(key, value);
                }
            }

            ffes_loadcase_name = null;
            check_run_button_state();
        }
    });
    ffes_solver = k;
})();

sa_run_button.onclick = function (){

    let node_coords = [];
    let element_ids = [];

    render_scene.model.fe_nodes   .forEach(n => node_coords.push(n.x, n.y));
    render_scene.model.fe_elements.forEach(n => element_ids.push(...n.node_ids));

    let model_data = render_scene.model.model_data;
    let loadcase   = model_data.getActiveLoadCase();
    sa_run_button.disabled = true;

    // save loadcase name so we know where to store the results later
    ffes_loadcase_name = render_scene.model.model_data.getActiveLoadCaseName();

    // reset the loading bar
    sa_progress_bar_1.setAttribute('style', 'width:0%');
    sa_progress_bar_2.setAttribute('style', 'width:0%');
    sa_progress_bar_3.setAttribute('style', 'width:0%');
    sa_progress_bar_4.setAttribute('style', 'width:0%');

    // set the info text
    sa_progress_info.innerText = "Preprocessing and assembling equations"

    ffes_solver.startAnalysis({
        'node_coords'  : node_coords,
        'element_ids'  : element_ids,
        'element_count': render_scene.model.fe_elements.length,
        'material'     : model_data.material,
        'restricted'   : loadcase.getLoadCaseData(LCData.RESTRICT).values,
        'displaced'    : loadcase.getLoadCaseData(LCData.DISPLACE).values,
        'forces'       : loadcase.getLoadCaseData(LCData.FORCE).values});
}






