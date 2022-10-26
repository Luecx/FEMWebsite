let visual_colorbar_min_input        = document.getElementById("menu-visual-colorbar-range-min-input");
let visual_colorbar_min_reset_button = document.getElementById("menu-visual-colorbar-range-min-auto-button");
let visual_colorbar_max_input        = document.getElementById("menu-visual-colorbar-range-max-input");
let visual_colorbar_max_reset_button = document.getElementById("menu-visual-colorbar-range-max-auto-button");

let visual_colorbar_underflow_show   = document.getElementById("menu-visual-colorbar-underflow-show")
let visual_colorbar_overflow_show    = document.getElementById("menu-visual-colorbar-overflow-show");
let visual_colorbar_underflow_color  = document.getElementById("menu-visual-colorbar-underflow-color");
let visual_colorbar_overflow_color   = document.getElementById("menu-visual-colorbar-overflow-color");

let visual_displacement_range        = document.getElementById("menu-visual-displacement-scaling-range");
let visual_displacement_label        = document.getElementById("menu-visual-displacement-scaling-label");

function visualmenu_init(){
    // reset values
    visual_colorbar_min_input.value = getModel().node_min_value;
    visual_colorbar_max_input.value = getModel().node_max_value;

    // add listeners if the data changes
    getModel().model_data.addEventListeners([
        "activeloadcasechanged",
        "addedvalues",
        "clearedvalues",
        "materialchanged",
        "meshchanged",
        "displayedvalueschanged"
    ], () => {
        visual_colorbar_max_reset_button.onclick();
        visual_colorbar_min_reset_button.onclick();
    });

    // // listener for displacement fields
    // getModel().model_data.addEventListener('displayedvalueschanged', (data) => {
    //     let id_data = data.loadcase_result_id;
    //     let disp_data = id_data.getField('Displacement');
    //     // no displacement data found
    //     if(disp_data === null){
    //         // visual_displacement_range.disabled = true;
    //         // getModel().
    //     }else{
    //         // visual_displacement_range.disabled = false;
    //
    //     }
    // })
}


function visual_hex_to_rgb(hex){
    let res = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
        ,(m, r, g, b) => '#' + r + r + g + g + b + b)
        .substring(1).match(/.{2}/g)
        .map(x => parseInt(x, 16))
    res[0] /= 255.0;
    res[1] /= 255.0;
    res[2] /= 255.0;
    return res;
}

function visual_get_underflow_color() {
    return [...visual_hex_to_rgb(visual_colorbar_underflow_color.value), visual_colorbar_underflow_show.checked ? 1:0];
}

function visual_get_overflow_color() {
    return [...visual_hex_to_rgb(visual_colorbar_overflow_color.value), visual_colorbar_overflow_show.checked ? 1:0];
}

function visual_get_displacement_scaling() {
    let raw_value = parseInt(visual_displacement_range.value);
    if(raw_value === 0) return 0;
    let power = Math.ceil(raw_value / 9);
    let base = Math.pow(10, power-2);
    let scaling = raw_value % 9;
    if(scaling === 0) scaling = 9;
    let result = base * scaling;
    return parseFloat(result.toPrecision(12));
}

visual_colorbar_max_reset_button.onclick = () => {
    getModel().resetMaxNodeValue();
    visual_colorbar_max_input.value = getModel().node_max_value.toPrecision(4);
}

visual_colorbar_min_reset_button.onclick = () => {
    getModel().resetMinNodeValue();
    visual_colorbar_min_input.value = getModel().node_min_value.toPrecision(4);
}

visual_colorbar_max_input.addEventListener('change', () => {
   let value = parseFloat(visual_colorbar_max_input.value);
    // check max value isnt below min value
    if(value <= getModel().node_min_value){
        value = getModel().node_min_value + 1e-3;
        visual_colorbar_max_input.value = value;
    }
   if(value !== null && value !== undefined){
       getModel().node_max_value = value;
       visual_colorbar_max_input.value = value.toPrecision(4)
   }
});

visual_colorbar_min_input.addEventListener('change', () => {
    let value = parseFloat(visual_colorbar_min_input.value);
    // check min value isnt above max value
    if(value >= getModel().node_max_value){
        value = getModel().node_max_value - 1e-3;
        visual_colorbar_min_input.value = value;
    }

    // assign to model
    if(value !== null && value !== undefined){
        getModel().node_min_value = value;
        visual_colorbar_min_input.value = value.toPrecision(4)
    }
});

visual_colorbar_overflow_color.oninput= () => {
    console.log(visual_colorbar_overflow_color.value)
}

visual_displacement_range.oninput = () => {
    visual_displacement_label.innerText = visual_get_displacement_scaling();
}