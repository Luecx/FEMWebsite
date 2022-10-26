
const LCResults = {
    ANALYSIS: "Analysis",
    TOPOLOGY_OPTIMIZATION: "Topology Optimization"
}

const LCData  = {
    RESTRICT : 0,
    DISPLACE : 1,   // only valid if its restricted
    FORCE : 2
}

const LCValueType = {
    NODE_DATA : 0,
    ELEMENT_DATA : 1
}


class LoadCaseValues{
    constructor(name, type, loadcase_result_id, values_per_entity= 1){
        this.name               = name;
        this.loadcase_result_id = loadcase_result_id;
        this.data_type          = type;
        this.values_per_entity  = values_per_entity;
        this.values             = this.allocate();
    }
    allocate(){
        let data_size = this.data_type === LCValueType.NODE_DATA  ?
                        this.getModelData().model.fe_nodes.length :
                        this.getModelData().model.fe_elements.length
        return new Float32Array(data_size * this.values_per_entity);
    }
    getModelData(){
        return this.loadcase_result_id.getModelData();
    }
}

class LoadCaseResultID{
    constructor(id, loadcase_result) {
        this.id              = id;
        this.loadcase_result = loadcase_result;
        this.fields          = [];
    }
    getModelData(){
        return this.loadcase_result.getModelData();
    }
    addField(name, data, type){
        let entry = new LoadCaseValues(name, type, this);
        entry.values = data;
        this.fields.push(entry);
        this.getModelData().notify('addedvalues', [entry]);
    }
    getField(name){
        for(let i = 0; i < this.fields.length; i++){
            if(this.fields[i].name === name){
                return this.fields[i];
            }
        }
        return null;
    }
    clear(){
        this.fields = [];
        this.getModelData().notify('clearedvalues', [this]);
    }
}

class LoadCaseResult{
    constructor(name, loadcase) {
        this.name     = name;
        this.loadcase = loadcase;
        this.ids      = [];
    }
    getModelData(){
        return this.loadcase.getModelData();
    }
    getLoadCaseSourceID(id){
        for(let i = 0; i < this.ids.length; i++){
            if(this.ids[i].id === id){
                return this.ids[i];
            }
        }
        return null;
    }
    addLoadCaseSourceID(){
        let new_id = new LoadCaseResultID(this.ids.length+1, this);
        this.ids.push(new_id);
        this.getModelData().notify('addedsourceid', [new_id]);
    }
    removeLoadCaseSourceID(id){
        for(let i = 0; i < this.ids.length; i++){
            if(this.ids[i].id === id){
                let source_id = this.ids[i];
                this.ids.splice(i, 1);
                this.getModelData().notify('addedsourceid', [source_id]);
            }
        }
    }
    clearLoadCaseSourceIDs(){
        this.ids = [];
        this.getModelData().notify('clearedsourceids', [this]);
    }
}

class LoadCase{
    constructor(name, model_data) {
        this.name             = name;
        this.model_data       = model_data;
        this.loadcase_results = [new LoadCaseResult(LCResults.ANALYSIS, this),
                                 new LoadCaseResult(LCResults.TOPOLOGY_OPTIMIZATION, this)];
        // data for boundary conditions
        this.loadcase_data    = [new LoadCaseValues(LCData.FORCE   , LCValueType.NODE_DATA, this, 2),
                                 new LoadCaseValues(LCData.RESTRICT, LCValueType.NODE_DATA, this, 2),
                                 new LoadCaseValues(LCData.DISPLACE, LCValueType.NODE_DATA, this, 2)];
    }
    getModelData(){
        return this.model_data;
    }
    getLoadCaseResult(result){
        for(let i = 0; i < this.loadcase_results.length; i++){
            if(this.loadcase_results[i].name === result){
                return this.loadcase_results[i];
            }
        }
    }
    getLoadCaseData(type){
        for(let i = 0; i < this.loadcase_data.length; i++){
            if(this.loadcase_data[i].name === type){
                return this.loadcase_data[i];
            }
        }
    }
    setLoadCaseData(type, data){
        for(let i = 0; i < this.loadcase_data.length; i++){
            if(this.loadcase_data[i].name === type){
                this.loadcase_data[i].values = data;
                this.getModelData().notify('loadcasedatachanged', [this, this.loadcase_data[i]]);
            }
        }
    }
}

/**
 * events:
 *
 * activeloadcasechanged  - returns [loadcase-name]
 * newloadcase            - returns [loadcase-name]
 * removedloadcase        - returns [loadcase-name]
 * clearedloadcases       - return  [-]
 *
 * loadcasedatachanged    - return  [loadcase, data]
 *
 * addedsourceid          - return  [loadcasesourceid]
 * removedsourceid        - return  [loadcasesourceid]
 * clearedsourceids       - return  [loadcaseresult]
 *
 * addedvalues            - return  [loadcasevalues]
 * clearedvalues          - return  [loadcasesourceid]
 *
 * materialchanged        - returns [young, poisson]
 *
 * meshchanged            - returns [n_nodes, n_elements] // note that this is an event of the model
 *                                                        // but to keep all events at the same place, it will be invoked
 *                                                        // and stored within the model_data.
 * displayedvalueschanged - return  [loadcasevalues]      // note that this is an event of the model
 *                                                        // it returns the loadcase values entry (can be null)
 *                                                        // can be traced to retrieve displacement fields
 *
 */
class ModelData{
    constructor(model) {
        this.model = model;

        // listener
        this.listeners = {};

        // loadcases
        this.loadcases = [];
        this.active_load_case = null;

        // material
        this.material = null;
    }

    // events
    notify(event_name, info){
        if(event_name in this.listeners){
            this.listeners[event_name].forEach(e => e(...info));
        }
    }
    addEventListener(event_name, listener){
        if(!(event_name in this.listeners)){
            this.listeners[event_name] = [];
        }
        this.listeners[event_name].push(listener);
    }
    addEventListeners(event_names, listener) {

        ((self, names, func) => {
            names.forEach(n => {
                self.addEventListener(n, func);
            })
        })(this, event_names, listener);
    }

    // loadcase management
    getLoadCase(name){
        for(let i = 0; i < this.loadcases.length; i++) {
            if (this.loadcases[i].name === name) {
                return this.loadcases[i];
            }
        }
        return null;
    }
    getActiveLoadCase(){
        return this.getLoadCase(this.getActiveLoadCaseName());
    }
    setActiveLoadCase(name){
        this.active_load_case = name;
        this.notify("activeloadcasechanged", [name]);
    }
    getActiveLoadCaseName(){
        return this.active_load_case;
    }
    addLoadCase(name){
        this.loadcases.push(new LoadCase(name, this));
        this.notify("newloadcase", [name]);
        this.setActiveLoadCase(name);
    }
    removeLoadCase(){
        for(let i = 0; i < this.loadcases.length; i++){
            if(this.loadcases[i].name === this.active_load_case){
                this.loadcases.splice(i, 1);
                this.notify("removedloadcase", [this.active_load_case]);

                if(i > 0){
                    this.setActiveLoadCase(this.loadcases[i-1].name);
                }else if(i < this.loadcases.length){
                    this.setActiveLoadCase(this.loadcases[i].name);
                }else{
                    this.setActiveLoadCase(null);
                }

                return;
            }
        }

    }
    clearLoadCases(){
        this.loadcases = [];
        this.setActiveLoadCase(null);
        this.notify("clearedloadcases", [null]);
    }

    // material management (global across all loadcases)
    setMaterial(young, poisson){
        this.material = [young, poisson];
        this.notify('materialchanged', this.material);
    }

    // deep to string
    toString(){
        let res = "Model Data:\n";
        this.loadcases.forEach(lc => {
            res += "\t" + lc.name + ":\n";
            lc.loadcase_results.forEach(lcr => {
                res += "\t\t" + lcr.name + ":\n";
                lcr.ids.forEach(id => {
                    res += "\t\t\t" + id.id + ":\n";
                    id.fields.forEach(f => {
                        res += "\t\t\t\t" + f.name + ": [" + f.values[0] + "," + f.values[1] + ", ... ," +
                            f.values[f.values.length-1] + "]\n";
                    })
                })
            })
        })
        return res;
    }
}
