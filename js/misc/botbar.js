let toolbar_select_loadcase = document.getElementById("toolbar-select-loadcase");
let toolbar_select_source   = document.getElementById("toolbar-select-mode");
let toolbar_select_id       = document.getElementById("toolbar-select-mode-idx");
let toolbar_select_values   = document.getElementById("toolbar-select-mode-values");

toolbar_select_source.add(new Option(LCResults.ANALYSIS));
toolbar_select_source.add(new Option(LCResults.TOPOLOGY_OPTIMIZATION));

function toolbar_init() {


    // listeners for the loadcase selector
    // ->
    // newloadcase
    // removedloadcase
    // clearedloadcases
    render_scene.model.model_data.addEventListeners(['newloadcase'], function (name){
        toolbar_select_loadcase.add(new Option(name));
    });
    render_scene.model.model_data.addEventListeners(['removedloadcase'], function (name){
        for(let i = 0; i < toolbar_select_loadcase.options.length; i++){
            if(toolbar_select_loadcase.options[i].value === name){
                toolbar_select_loadcase.options[i].remove();
            }
        }
    });
    render_scene.model.model_data.addEventListeners(['clearedloadcases'], function (){
        // the problem is that add is being called before clear since the loadcase manager will invoke
        // the addition of a new loadcase before this event is executed. Solution is to copy the values from
        // the loadcase selector
        while(toolbar_select_loadcase.options.length > 0)
            toolbar_select_loadcase.options[0].remove();

        toolbar_select_loadcase.add(new Option(loadcase_select.options[0].value));
    });


    // TODO
    // if we remove an id we are currently looking at, clear the results
    // if we clear all, also clear the results and display nothing
    //
    // listeners for the id selector
    // ->
    // addedsourceid         - return  [loadcasesourceid]
    // removedsourceid       - return  [loadcasesourceid]
    // clearedsourceids      - return  [loadcase_result]
    render_scene.model.model_data.addEventListeners(['addedsourceid'], function (sourceid){
        console.log("calling add source id");
        // this is only relevant if the selected source and load case match the parents
        if(sourceid.loadcase_result.name          !== toolbar_select_source  .value) return;
        if(sourceid.loadcase_result.loadcase.name !== toolbar_select_loadcase.value) return;

        // add the id to selector
        toolbar_select_id.add(new Option(sourceid.id));
    });
    render_scene.model.model_data.addEventListeners(['removedsourceid'], function (sourceid){
        console.log("calling remove source id");
        // this is only relevant if the selected source and load case match the parents
        if(sourceid.loadcase_result.name          !== toolbar_select_source  .value) return;
        if(sourceid.loadcase_result.loadcase.name !== toolbar_select_loadcase.value) return;

        // add the id to selector
        for(let i = 0; i < toolbar_select_id.options.length; i++){
            if(toolbar_select_id.options[i].value === sourceid.id){
                toolbar_select_id.options[i].remove();
            }
        }

        // clear the results
        while(toolbar_select_values.options.length > 0){
            toolbar_select_values.options[0].remove();
        }

    });
    render_scene.model.model_data.addEventListeners(['clearedsourceids'], function (loadcase_result){
        console.log("calling clear source ids");
        // this is only relevant if the selected source and load case match the parents
        if(loadcase_result.name          !== toolbar_select_source  .value) return;
        if(loadcase_result.loadcase.name !== toolbar_select_loadcase.value) return;

        // add the id to selector
        while(toolbar_select_id.options.length > 0){
            toolbar_select_id.options[0].remove();
        }

        // clear the values
        while(toolbar_select_values.options.length > 0){
            toolbar_select_values.options[0].remove();
        }
    });

    // listeners for the value field
    render_scene.model.model_data.addEventListeners(['addedvalues'], function (data){
        // this is only relevant if the selected source and load case match the parents
        if(data.loadcase_result_id.id                            !=  toolbar_select_id      .value) return;
        if(data.loadcase_result_id.loadcase_result.name          !== toolbar_select_source  .value) return;
        if(data.loadcase_result_id.loadcase_result.loadcase.name !== toolbar_select_loadcase.value) return;

        // add the id to selector
        toolbar_select_values.add(new Option(data.name));
    });
    render_scene.model.model_data.addEventListeners(['clearedvalues'], function (loadcase_source_id){
        // // this is only relevant if the selected source and load case match the parents
        // if(loadcase_result.name          !== toolbar_select_source  .value) return;
        // if(loadcase_result.loadcase.name !== toolbar_select_loadcase.value) return;
        //
        // // add the id to selector
        // while(toolbar_select_id.options.length > 0){
        //     toolbar_select_id.options[0].remove();
        // }
    });
}

toolbar_select_values.onchange = function (ev){

    console.log(render_scene.model.model_data.toString());

    let loadcase = render_scene.model.model_data.getLoadCase(toolbar_select_loadcase.value);
    if(loadcase === null){
        render_scene.model.setNodeValues(null);
    }

    let loadcase_source = loadcase.getLoadCaseResult(toolbar_select_source.value);
    if(loadcase_source === null){
        render_scene.model.setNodeValues(null);
    }

    let loadcase_source_id = loadcase_source.getLoadCaseSourceID(parseInt(toolbar_select_id.value));
    if(loadcase_source_id === null){
        render_scene.model.setNodeValues(null);
    }

    let result = loadcase_source_id.getField(toolbar_select_values.value);
    if(result === null){
        render_scene.model.setNodeValues(null);
    }else{
        render_scene.model.setNodeValues(result.values);
    }
}