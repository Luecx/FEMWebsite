let loadcase_select = document.getElementById("select-loadcase");
let loadcase_add    = document.getElementById("btn-add-loadcase");
let loadcase_remove = document.getElementById("btn-remove-loadcase");

// LOADCASE SELECTOR
let next_loadcase_id = 1

// called once the model is ready and setup so we can bind
// functions to the listener, especially the model data.
function loadcasemenu_init(){
    // listener when the model data gets a new load case -> update the ui
    render_scene.model.model_data.addListener('newloadcase', function (loadcase_name){
        loadcase_select.add(new Option(loadcase_name))
        loadcase_select.value = loadcase_name;
        render_scene.model.updateBoundaryData(loadcase_name);
    });

    // listener when the model data removes a load case -> update the ui
    render_scene.model.model_data.addListener('removedloadcase', function (loadcase_name){
        for (let i = 0; i < loadcase_select.length; i++){
            let option = loadcase_select.options[i];
            if(option.value === loadcase_name){
                option.remove();
                if(i > 0){
                    loadcase_select.value = loadcase_select.options[i-1].value;
                }
                break;
            }
        }
        if(loadcase_select.length === 0){
            next_loadcase_id = 1;
            loadcase_add.click();
        }
        render_scene.model.updateBoundaryData(loadcase_select.value);
    });

    // listener when the model data removes all load cases -> generate a new one
    render_scene.model.model_data.addListener('clear', function (){
        while(loadcase_select.length > 0){
            loadcase_select.options[0].remove();
        }
        next_loadcase_id = 1;
        loadcase_add.click();
    });
}

// button bindings
loadcase_add.onclick = function (){
    // if we click on the button, generate a new name
    let loadcase_name = "LoadCase " + next_loadcase_id;
    // add a new loadcase to the model data. The listener above will be called
    // and ensure that the select will point to the new loadcase
    render_scene.model.model_data.addLoadCase(loadcase_name);
    // for the next name we generate, increase the loadcase id for naming purposes.
    next_loadcase_id += 1;
}
loadcase_remove.onclick = function (){
    // remove the current highlighted loadcase inside the model data.
    // It will in return invoke the listeners above. The listener above
    // will take care of edge cases where e.g. the last remaining loadcase has been deleted.
    // In that case it will invoke the onclick function of the loadcase_add button.
    render_scene.model.model_data.removeLoadCase(loadcase_select.value);
}
loadcase_select.onchange = function (){
    // if the user selects a different loadcase via the select, we need to make sure
    // that the model receives gets the updated boundary conditions from the
    // loadcase.
    render_scene.model.updateBoundaryData(loadcase_select.value);
}

