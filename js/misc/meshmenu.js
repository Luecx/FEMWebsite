let mesh_select             = document.getElementById("mesh-select-preset");
let mesh_generate           = document.getElementById("mesh-generate-button");
let mesh_rectangle_settings = document.getElementById("mesh-rectangle-settings");
let mesh_arc_settings       = document.getElementById("mesh-arc-settings");
let mesh_order              = document.getElementById("mesh-order-select")

// rectangle fields
let mesh_rectangle_width    = document.getElementById("mesh-rectangle-width");
let mesh_rectangle_height   = document.getElementById("mesh-rectangle-height");
let mesh_rectangle_elems_x  = document.getElementById("mesh-rectangle-elements-x")
let mesh_rectangle_elems_y  = document.getElementById("mesh-rectangle-elements-y");

// arc fields
let mesh_arc_width          = document.getElementById("mesh-arc-width");
let mesh_arc_length         = document.getElementById("mesh-arc-length");
let mesh_arc_radius         = document.getElementById("mesh-arc-radius");
let mesh_arc_angle          = document.getElementById("mesh-arc-angle");
let mesh_arc_elems_a        = document.getElementById("mesh-arc-elements-arc");
let mesh_arc_elems_w        = document.getElementById("mesh-arc-elements-width");

mesh_select.onchange = function (){
    let name = mesh_select.value;
    // first disable all
    document.querySelectorAll('.mesh-preset-option').forEach(e => {
        e.classList.add("d-none");
    })
    // enable the correct one
    if(name === "Rectangle"){
        mesh_rectangle_settings.classList.remove("d-none");
    }
    if(name === "Arc"){
        mesh_arc_settings.classList.remove("d-none");
    }
}

mesh_generate.onclick = function (){
    // parse what type of preset has been chosen and generate the geometry based on that information
    // technically we would have to reset the loadcases since we have a new geometry.
    // this is done my the setGeometry function itself which will in return update the listeners
    let name = mesh_select.value;
    let order = mesh_order.value === '1st' ? 1:2;
    // rectangle preset
    if(name === "Rectangle"){
        let geometry = generate_rectangle(
            parseFloat(mesh_rectangle_width.value),
            parseFloat(mesh_rectangle_height.value),
            parseFloat(mesh_rectangle_elems_x.value),
            parseFloat(mesh_rectangle_elems_y.value),
            order);
        render_scene.model.setGeometry(geometry[0], geometry[1]);
        render_scene.camera.fitToModel(render_scene.model);
    }

    // arc preset
    if(name === "Arc"){
        let geometry = generate_arc(
            parseFloat(mesh_arc_length.value),
            parseFloat(mesh_arc_width.value),
            parseFloat(mesh_arc_radius.value),
            parseFloat(mesh_arc_angle.value),
            parseFloat(mesh_arc_elems_a.value),
            parseFloat(mesh_arc_elems_w.value),
            order);
        render_scene.model.setGeometry(geometry[0], geometry[1]);
        render_scene.camera.fitToModel(render_scene.model);
    }
}
