
const LoadCaseDataSource = {
    ANALYSIS: "Analysis",
    TOPOLOGY_OPTIMIZATION: "Topology Optimization"
}

const LoadCaseOtherData = {
    RESTRICT : 0,
    DISPLACE : 1,   // only valid if its restricted
    FORCE : 2
}

const LoadCaseDataType = {
    NODE_DATA : 0,
    ELEMENT_DATA : 1
}

class ModelData{

    constructor(model) {
        this.model = model;
        this.loadcases = {};
        this.listeners = {};
    }
    clear(){
        this.loadcases = {};
        this.notify('clear')
    }
    notify(event_name, info){
        if(event_name in this.listeners){
            this.listeners[event_name].forEach(e => e(info));
        }
    }
    addListener(event_name, listener){
        if(!(event_name in this.listeners)){
            this.listeners[event_name] = [];
        }
        this.listeners[event_name].push(listener);
    }

    getLoadCase(loadcase){
        return this.loadcases[loadcase];
    }
    getLoadCaseData(loadcase){
        return this.getLoadCase(loadcase)[0];
    }
    getLoadCaseSource(loadcase){
        return this.getLoadCase(loadcase)[1];
    }
    getSource(loadcase, source){
        return this.getLoadCase(loadcase)[source];
    }
    getIDContent(loadcase, source, id){
        return this.getSource(loadcase, source)[id];
    }
    getValues(loadcase, source, id, value_name){
        return this.getIDContent(loadcase, source, id)[value_name];
    }

    addLoadCase(loadcase){
        let loadcase_source_data = {}
        for (let data_source in LoadCaseDataSource) {
            loadcase_source_data[data_source] = [{}];
        }
        let loadcase_other_data = {}
        loadcase_other_data[LoadCaseOtherData.FORCE   ] = this.newData(LoadCaseDataType.NODE_DATA, 2);
        loadcase_other_data[LoadCaseOtherData.DISPLACE] = this.newData(LoadCaseDataType.NODE_DATA, 2);
        loadcase_other_data[LoadCaseOtherData.RESTRICT] = this.newData(LoadCaseDataType.NODE_DATA, 2);
        this.loadcases[loadcase] = [loadcase_other_data, loadcase_source_data];
        this.notify('newloadcase', loadcase);
    }
    removeLoadCase(loadcase){
        delete this.loadcases[loadcase];
        this.notify('removedloadcase', loadcase);
    }

    addID(loadcase, source){
        this.loadcases[loadcase][source].push({});
        this.notify('addedid');
    }
    getIDCount(loadcase, source){
        return this.loadcases[loadcase][source].length;
    }
    addValues(loadcase, source, id, name, type){
        this.getIDCount(loadcase, source, id)[name] = this.newData(type);
        this.notify('addedvalues');
    }
    newData(type, values_per_element=1){
        let data_size = type === LoadCaseDataType.NODE_DATA ? this.model.fe_nodes.length : this.model.fe_elements.length
        return new Float32Array(data_size * values_per_element);
    }

    toString(){
        let string = "ModelData\n";
        for(const [k1,v1] of Object.entries(this.loadcases)){
            string += "\tLoadCase: " + k1 + "\n";
            string += "\t\tStatic Fields:\n";
            for(const [k2,v2] of Object.entries(v1[0])){
                string += "\t\t\t" + k2 + ": " + v2.toString() + "\n";
            }
            string += "\t\tFields:\n";
            for(const [k2,v2] of Object.entries(v1[1])){
                string += "\t\t\t" + k2 + ":\n";
                for(let i = 1; i <= v2.length; i++){
                    string += "\t\t\t\t" + i + ":\n";
                    for(const [k3,v3] of Object.entries(v2[i-1])){
                        string += "\t\t\t\t\t" + k3 + ": " + v3.toString() + "\n";
                    }
                }
            }
        }
        return string;
    }
}