let toolbar_select_loadcase = document.getElementById("toolbar-select-loadcase");
let toolbar_select_source   = document.getElementById("toolbar-select-mode");
let toolbar_select_id       = document.getElementById("toolbar-select-mode-idx");
let toolbar_select_values   = document.getElementById("toolbar-select-mode-values");

toolbar_select_source.add(new Option(LCResults.ANALYSIS, LCResults.ANALYSIS));
toolbar_select_source.add(new Option(LCResults.TOPOLOGY_OPTIMIZATION,LCResults.TOPOLOGY_OPTIMIZATION));

select_enable_mousewheel(toolbar_select_loadcase, update_id_selections);
select_enable_mousewheel(toolbar_select_source  , update_id_selections);
select_enable_mousewheel(toolbar_select_id      , update_value_selections);
select_enable_mousewheel(toolbar_select_values  , update_displayed_entries);

function toolbar_init() {
    // listeners for the loadcase selector
    // ->
    // newloadcase
    // removedloadcase
    // clearedloadcases
    getModel().model_data.addEventListeners(['newloadcase'], function (name){
        toolbar_select_loadcase.add(new Option(name));
    });
    getModel().model_data.addEventListeners(['removedloadcase'], function (name){
        for(let i = 0; i < toolbar_select_loadcase.options.length; i++){
            if(toolbar_select_loadcase.options[i].value === name){
                toolbar_select_loadcase.options[i].remove();
            }
        }
    });
    getModel().model_data.addEventListeners(['clearedloadcases'], function (){
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
    getModel().model_data.addEventListeners(['addedsourceid'], function (sourceid){
        // this is only relevant if the selected source and load case match the parents
        if(sourceid.loadcase_result.name          !== toolbar_select_source  .value) return;
        if(sourceid.loadcase_result.loadcase.name !== toolbar_select_loadcase.value) return;

        // add the id to selector
        toolbar_select_id.add(new Option(sourceid.id));
    });
    getModel().model_data.addEventListeners(['removedsourceid'], function (sourceid){
        // this is only relevant if the selected source and load case match the parents
        if(sourceid.loadcase_result.name          !== toolbar_select_source  .value) return;
        if(sourceid.loadcase_result.loadcase.name !== toolbar_select_loadcase.value) return;

        // add the id to selector
        for(let i = 0; i < toolbar_select_id.options.length; i++){
            if(toolbar_select_id.options[i].value === sourceid.id){
                toolbar_select_id.options[i].remove();
            }
        }

        // clear the values if the id to be removed is the current id
        if(sourceid.loadcase_result.id == toolbar_select_id.value){
            while(toolbar_select_values.options.length > 0){
                toolbar_select_values.options[0].remove();
            }
        }
    });
    getModel().model_data.addEventListeners(['clearedsourceids'], function (loadcase_result){
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
    getModel().model_data.addEventListeners(['addedvalues'], function (data){
        // this is only relevant if the selected source and load case match the parents
        if(data.loadcase_result_id.id                            !=  toolbar_select_id      .value) return;
        if(data.loadcase_result_id.loadcase_result.name          !== toolbar_select_source  .value) return;
        if(data.loadcase_result_id.loadcase_result.loadcase.name !== toolbar_select_loadcase.value) return;

        // add the id to selector
        toolbar_select_values.add(new Option(data.name));

        update_value_selections();
    });
    getModel().model_data.addEventListeners(['clearedvalues'], function (loadcase_source_id){
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

function update_id_selections(){
    let loadcase = getModel().model_data.getLoadCase(toolbar_select_loadcase.value);
    // clear all
    while(toolbar_select_id.options.length > 0){
        toolbar_select_id[0].remove();
    }
    if(loadcase !== null){
        let source = loadcase.getLoadCaseResult(toolbar_select_source.value);
        source.ids.forEach(id_entry => {
            toolbar_select_id.options.add(new Option(id_entry.id));
        })
    }
    update_value_selections();
}

function update_value_selections(){
    let loadcase = getModel().model_data.getLoadCase(toolbar_select_loadcase.value);
    // clear all
    while(toolbar_select_values.options.length > 0){
        toolbar_select_values[0].remove();
    }
    if(loadcase !== null){
        let source = loadcase.getLoadCaseResult(toolbar_select_source.value);
        let id     = source.getLoadCaseSourceID(parseInt(toolbar_select_id.value));
        if(id !== null){
            id.fields.forEach(entry => {
                toolbar_select_values.options.add(new Option(entry.name));
            });
        }
    }
    update_displayed_entries();
}

function update_displayed_entries(){
    let loadcase = getModel().model_data.getLoadCase(toolbar_select_loadcase.value);
    if(loadcase === null){
        getModel().setNodeValues(null);
        return;
    }

    let loadcase_source = loadcase.getLoadCaseResult(toolbar_select_source.value);
    if(loadcase_source === null){
        getModel().setNodeValues(null);
        return;
    }

    let loadcase_source_id = loadcase_source.getLoadCaseSourceID(parseInt(toolbar_select_id.value));
    if(loadcase_source_id === null){
        getModel().setNodeValues(null);
        return;
    }

    let result = loadcase_source_id.getField(toolbar_select_values.value);
    if(result === null){
        getModel().setNodeValues(null);
    }else{
        getModel().setNodeValues(result);
    }
}

function toolbar_select_highest_topo_id(loadcase_name){
    if(loadcase_name !== toolbar_select_loadcase.value) return;
    let loadcase = getModel().model_data.getLoadCase(toolbar_select_loadcase.value);
    if(loadcase !== null && toolbar_select_source.value == LCResults.TOPOLOGY_OPTIMIZATION){
        let source = loadcase.getLoadCaseResult(toolbar_select_source.value);
        if(source.ids.length > 0){
            toolbar_select_id.value = source.ids[source.ids.length-1].id+"";
            update_value_selections();
        }

    }
}

function toolbar_select_topology_optimization(loadcase_name){
    if(loadcase_name !== toolbar_select_loadcase.value) return;
    toolbar_select_source.value = LCResults.TOPOLOGY_OPTIMIZATION;
    update_id_selections();
}

toolbar_select_values.onchange = function (ev){
    update_displayed_entries();
}

toolbar_select_id.onchange = function (ev){
    update_value_selections();
}

toolbar_select_source.onchange = function (ev){
    update_id_selections();
}

toolbar_select_loadcase.onchange = function (ev){
    update_id_selections();
}