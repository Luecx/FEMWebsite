let to_valid_mesh_label      = document.getElementById("topology-optimization-valid-mesh-label");
let to_material_applied_label= document.getElementById("topology-optimization-material-applied-label");
let to_supports_set_label    = document.getElementById("topology-optimization-supports-set-label");
let to_forces_applied_label  = document.getElementById("topology-optimization-forces-applied-label");

let to_valid_mesh_icon_icon  = document.getElementById("topology-optimization-valid-mesh-icon");
let to_material_applied_icon = document.getElementById("topology-optimization-material-applied-icon");
let to_supports_set_icon     = document.getElementById("topology-optimization-supports-set-icon");
let to_forces_applied_icon   = document.getElementById("topology-optimization-forces-applied-icon");
let to_run_button            = document.getElementById("topology-optimization-run-button");

let to_progress_info         = document.getElementById("topology-optimization-progress-info");
let to_progress_bar_1        = document.getElementById("topology-optimization-progress-bar");

let to_filter_radius         = document.getElementById("topology-optimization-filter-radius");
let to_target_density        = document.getElementById("topology-optimization-target-density");
let to_min_density           = document.getElementById("topology-optimization-min-density");
let to_penalty_factor        = document.getElementById("topology-optimization-penalty-factor");
let to_move_limit            = document.getElementById("topology-optimization-move-limit");
let to_max_iterations        = document.getElementById("topology-optimization-max-iterations");

toggle_icon_off(to_valid_mesh_icon_icon);
toggle_icon_off(to_material_applied_icon);
toggle_icon_off(to_supports_set_icon);
toggle_icon_off(to_forces_applied_icon);

enable_toggle("topology-optimization-run-button", tb_on_state_2, tb_off_state_3, true, ()=>{});

function topo_init(){

    // window.addEventListener('resize', () => {
    //     let max_height = Math.max(
    //         to_valid_mesh_label      .offsetHeight,
    //         to_material_applied_label.offsetHeight,
    //         to_supports_set_label    .offsetHeight,
    //         to_forces_applied_label  .offsetHeight)
    //     to_valid_mesh_label         .setAttribute("style",`height:${max_height}px`);
    //     to_material_applied_label   .setAttribute("style",`height:${max_height}px`);
    //     to_supports_set_label       .setAttribute("style",`height:${max_height}px`);
    //     to_forces_applied_label     .setAttribute("style",`height:${max_height}px`);
    // })
    
    getModel().model_data.addEventListener('materialchanged', function (young, poisson){
        if(young > 0 && poisson >= 0 && poisson <= 0.5){
            toggle_icon_on(to_material_applied_icon);
        }else{
            toggle_icon_off(to_material_applied_icon);
        }
        topo_check_run_button_state();
    })
    getModel().model_data.addEventListener('meshchanged', function (nnodes, nelements){
        if(nnodes > 0 && nelements >= 0){
            toggle_icon_on(to_valid_mesh_icon_icon);
        }else{
            toggle_icon_off(to_valid_mesh_icon_icon);
        }
        topo_check_run_button_state();
    })
    getModel().model_data.addEventListeners(['activeloadcasechanged', 'loadcasedatachanged'], function (){
        // go through the data and count supports and forces
        let load_case = getModel().model_data.getActiveLoadCase();
        // if there is no loadcase for some reason, toggle it off
        if(load_case === null){
            toggle_icon_off(to_forces_applied_icon);
            toggle_icon_off(to_supports_set_icon);
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
            toggle_icon_on(to_forces_applied_icon);
        }else{
            toggle_icon_off(to_forces_applied_icon);
        }

        // check supports
        let supports_x = 0;
        let supports_y = 0;
        for(let i = 0; i < restrict_data.values.length; i+=2){
            if(restrict_data.values[i  ] !== 0) supports_x ++;
            if(restrict_data.values[i+1] !== 0) supports_y ++;
        }
        let is_supported = (supports_x + supports_y) >= 3 && (supports_x * supports_x) > 0;

        if(is_supported){
            toggle_icon_on(to_supports_set_icon);
        }else{
            toggle_icon_off(to_supports_set_icon);
        }
        topo_check_run_button_state();
    })
}

function topo_check_run_button_state(){
    to_run_button.disabled = !(
        get_icon_state(to_valid_mesh_icon_icon)  &&
        get_icon_state(to_material_applied_icon) &&
        get_icon_state(to_supports_set_icon)     &&
        get_icon_state(to_forces_applied_icon)   &&
        topo_loadcase_name === null);
    if(to_run_button.disabled){
        toggle_off(to_run_button);
    }else{
        toggle_on(to_run_button);
    }
}

let topo_solver         = null;
let topo_loadcase_name  = null;
let topo_max_iterations = 100;

(async () => {
    const k = await FFES()
    k.addMessageListener('topo', msg => {
        let info = msg[0];
        console.log(msg);
        if (info.match("^Iteration [0-9]+ finished")) {
            let it = parseInt(info.split(" ")[1]);

            // update the data and add a new field
            let loadcase = getModel().model_data.getLoadCase(topo_loadcase_name);
            if(loadcase !== null){
                // make sure an empty id entry exists
                let topo = loadcase.getLoadCaseResult(LCResults.TOPOLOGY_OPTIMIZATION);
                if(it === 1){
                    topo.clearLoadCaseSourceIDs();
                }
                topo.addLoadCaseSourceID();
                let entry = topo.getLoadCaseSourceID(it);

                // get the result data
                let result_data = msg[1];
                for (const [key, value] of Object.entries(result_data)) {
                    entry.addField(key, value);
                }

                // manually make sure that the newest entries are displayed
                toolbar_select_highest_topo_id(topo_loadcase_name);
            }

            // update the loading bar
            to_progress_info.innerText = "Finished iteration " + it;
            to_progress_bar_1.setAttribute('style', 'width:' + Math.round(100 * it / topo_max_iterations)+'%');
            // topo_loadcase_name = null;
            // topo_check_run_button_state();

        }

        if (info.startsWith("Finished computation")){
            to_progress_info.innerText = "Finished computation";
            to_progress_bar_1.setAttribute('style', 'width:100%');
            topo_loadcase_name = null;
            topo_check_run_button_state();
        }
    });
    topo_solver = k;

    setTimeout(function(){
        loading_notify();
    }, 1000);
})();

to_run_button.onclick = function (){

    // offer_download(build_input(), "txt", "inputdeck.txt");

    let node_coords = [];
    let element_ids = [];

    getModel().fe_nodes   .forEach(n => node_coords.push(n.x, n.y));
    getModel().fe_elements.forEach(n => element_ids.push(...n.node_ids));

    let model_data = getModel().model_data;
    let loadcase   = model_data.getActiveLoadCase();
    to_run_button.disabled = true;

    // save loadcase name so we know where to store the results later
    topo_loadcase_name = getModel().model_data.getActiveLoadCaseName();

    toolbar_select_topology_optimization(topo_loadcase_name);

    // reset the loading bar
    to_progress_bar_1.setAttribute('style', 'width:0%');

    // set the info text
    to_progress_info.innerText = "Preprocessing and assembling equations"

    topo_max_iterations = parseInt  (to_max_iterations.value)

    topo_solver.startTopo({
        'target_density' : parseFloat(to_target_density.value) / 100,
        'penalty_factor' : parseFloat(to_penalty_factor.value),
        'filter_radius'  : parseFloat(to_filter_radius.value),
        'min_density'    : parseFloat(to_min_density.value) / 100,
        'move_limit'     : parseFloat(to_move_limit.value),
        'max_iterations' : topo_max_iterations,
        'node_coords'    : node_coords,
        'element_ids'    : element_ids,
        'element_count'  : getModel().fe_elements.length,
        'material'       : model_data.material,
        'restricted'     : loadcase.getLoadCaseData(LCData.RESTRICT).values,
        'displaced'      : loadcase.getLoadCaseData(LCData.DISPLACE).values,
        'forces'         : loadcase.getLoadCaseData(LCData.FORCE).values});
}






