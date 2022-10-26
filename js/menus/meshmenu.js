let mesh_select                     = document.getElementById("mesh-select-preset");
let mesh_generate                   = document.getElementById("mesh-generate-button");
let mesh_rectangle_settings         = document.getElementById("mesh-rectangle-settings");
let mesh_defect_rectangle_settings  = document.getElementById("mesh-defect-rectangle-settings");
let mesh_arc_settings               = document.getElementById("mesh-arc-settings");
let mesh_i_profile_settings         = document.getElementById("mesh-i-profile-settings");
let mesh_hook_settings              = document.getElementById("mesh-hook-settings");
let mesh_order                      = document.getElementById("mesh-order-select")

// rectangle fields
let mesh_rectangle_width            = document.getElementById("mesh-rectangle-width");
let mesh_rectangle_height           = document.getElementById("mesh-rectangle-height");
let mesh_rectangle_elems_x          = document.getElementById("mesh-rectangle-elements-x")
let mesh_rectangle_elems_y          = document.getElementById("mesh-rectangle-elements-y");

// defect rectangle
let mesh_defect_rectangle_width     = document.getElementById("mesh-defect-rectangle-width");
let mesh_defect_rectangle_height    = document.getElementById("mesh-defect-rectangle-height");
let mesh_defect_rectangle_elem_size = document.getElementById("mesh-defect-rectangle-element-size")
let mesh_defect_rectangle_def_x     = document.getElementById("mesh-defect-rectangle-defect-x");
let mesh_defect_rectangle_def_y     = document.getElementById("mesh-defect-rectangle-defect-y");
let mesh_defect_rectangle_def_size  = document.getElementById("mesh-defect-rectangle-defect-size");

// arc fields
let mesh_arc_width          = document.getElementById("mesh-arc-width");
let mesh_arc_length         = document.getElementById("mesh-arc-length");
let mesh_arc_radius         = document.getElementById("mesh-arc-radius");
let mesh_arc_angle          = document.getElementById("mesh-arc-angle");
let mesh_arc_elems_a        = document.getElementById("mesh-arc-elements-arc");
let mesh_arc_elems_w        = document.getElementById("mesh-arc-elements-width");

// i-profile
let mesh_i_profile_width    = document.getElementById("mesh-i-profile-width");
let mesh_i_profile_width_1  = document.getElementById("mesh-i-profile-width-1");
let mesh_i_profile_width_2  = document.getElementById("mesh-i-profile-width-2");
let mesh_i_profile_height   = document.getElementById("mesh-i-profile-height");
let mesh_i_profile_height_1 = document.getElementById("mesh-i-profile-height-1");
let mesh_i_profile_height_2 = document.getElementById("mesh-i-profile-height-2");
let mesh_i_profile_elems_x  = document.getElementById("mesh-i-profile-elements-x");
let mesh_i_profile_elems_y  = document.getElementById("mesh-i-profile-elements-y");

// hook
let mesh_hook_width_1       = document.getElementById("mesh-hook-width-1");
let mesh_hook_width_2       = document.getElementById("mesh-hook-width-2");
let mesh_hook_width_3       = document.getElementById("mesh-hook-width-3");
let mesh_hook_width_4       = document.getElementById("mesh-hook-width-4");
let mesh_hook_length_1      = document.getElementById("mesh-hook-length-1");
let mesh_hook_length_2      = document.getElementById("mesh-hook-length-2");
let mesh_hook_length_3      = document.getElementById("mesh-hook-length-3");
let mesh_hook_angle_1       = document.getElementById("mesh-hook-angle-1");
let mesh_hook_angle_2       = document.getElementById("mesh-hook-angle-2")
let mesh_hook_radius        = document.getElementById("mesh-hook-radius")
let mesh_hook_element_size  = document.getElementById("mesh-hook-element-size");


mesh_select.onchange = function (){
    let name = mesh_select.value;
    // first disable all
    document.querySelectorAll('.mesh-preset-option').forEach(e => {
        e.classList.add("d-none");
    })
    // enable the correct one
    if(name === "rec"){
        mesh_rectangle_settings.classList.remove("d-none");
    }
    if(name === "arc"){
        mesh_arc_settings.classList.remove("d-none");
    }
    if(name === "i-profile"){
        mesh_i_profile_settings.classList.remove("d-none");
    }
    if(name === "hook"){
        mesh_hook_settings.classList.remove("d-none");
    }
    if(name === "defect-rectangle"){
        mesh_defect_rectangle_settings.classList.remove("d-none");
    }
}

mesh_generate.onclick = function (){
    // parse what type of preset has been chosen and generate the geometry based on that information
    // technically we would have to reset the loadcases since we have a new geometry.
    // this is done my the setGeometry function itself which will in return update the listeners
    let name = mesh_select.value;
    let order = mesh_order.value === '1st' ? 1:2;


    // rectangle preset
    if(name === "rec"){
        let geometry = generate_rectangle(
            parseFloat(mesh_rectangle_width.value),
            parseFloat(mesh_rectangle_height.value),
            parseFloat(mesh_rectangle_elems_x.value),
            parseFloat(mesh_rectangle_elems_y.value),
            order);
        getModel().setGeometry(geometry[0], geometry[1]);
        render_scene.camera.fitToModel(getModel());
    }

    // defected rectangle
    if(name === "defect-rectangle"){
        let geometry = generate_defect(
            parseFloat(mesh_defect_rectangle_width.value),
            parseFloat(mesh_defect_rectangle_height.value),
            parseFloat(mesh_defect_rectangle_elem_size.value),
            parseFloat(mesh_defect_rectangle_def_x.value),
            parseFloat(mesh_defect_rectangle_def_y.value),
            parseFloat(mesh_defect_rectangle_def_size.value),
            order);
        getModel().setGeometry(geometry[0], geometry[1]);
        render_scene.camera.fitToModel(getModel());
    }

    // arc preset
    if(name === "arc"){
        let geometry = generate_arc(
            parseFloat(mesh_arc_length.value),
            parseFloat(mesh_arc_width.value),
            parseFloat(mesh_arc_radius.value),
            parseFloat(mesh_arc_angle.value),
            parseFloat(mesh_arc_elems_a.value),
            parseFloat(mesh_arc_elems_w.value),
            order);
        getModel().setGeometry(geometry[0], geometry[1]);
        render_scene.camera.fitToModel(getModel());
    }

    // i-profile
    if(name === 'i-profile'){
        let geometry = generate_i_profile(
            parseFloat(mesh_i_profile_width   .value),
            parseFloat(mesh_i_profile_width_1 .value),
            parseFloat(mesh_i_profile_width_2 .value),
            parseFloat(mesh_i_profile_height  .value),
            parseFloat(mesh_i_profile_height_1.value),
            parseFloat(mesh_i_profile_height_2.value),
            parseFloat(mesh_i_profile_elems_x .value),
            parseFloat(mesh_i_profile_elems_y .value),
            order)
        getModel().setGeometry(geometry[0], geometry[1]);
        render_scene.camera.fitToModel(getModel());
    }

    // hook
    if(name === 'hook') {
        let geometry = generate_hook(
            parseFloat(mesh_hook_width_1     .value),
            parseFloat(mesh_hook_width_2     .value),
            parseFloat(mesh_hook_width_3     .value),
            parseFloat(mesh_hook_width_4     .value),
            parseFloat(mesh_hook_length_1    .value),
            parseFloat(mesh_hook_length_2    .value),
            parseFloat(mesh_hook_length_3    .value),
            parseFloat(mesh_hook_angle_1     .value),
            parseFloat(mesh_hook_angle_2     .value),
            parseFloat(mesh_hook_radius      .value),
            parseFloat(mesh_hook_element_size.value),
            order);
        getModel().setGeometry(geometry[0], geometry[1]);
        render_scene.camera.fitToModel(getModel());
    }
}

select_enable_mousewheel(mesh_select, mesh_select.onchange);
select_enable_mousewheel(mesh_order, function(){});
