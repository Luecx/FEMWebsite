let material_select  = document.getElementById("material-select-preset");
let material_young   = document.getElementById("material-young");
let material_poisson = document.getElementById("material-poisson");
let material_apply   = document.getElementById("material-apply");

let material_presets = {
    "Steel"           : [210000,0.3 ],
    "Cast Iron"       : [120000,0.28],
    "Aluminium"       : [70000 ,0.35],
    "Aluminium Alloy" : [75000 ,0.33],
    "Bronze"          : [120000,0.34],
    "Copper"          : [120000,0.34],
    "Titanium"        : [110000,0.35],
}

// set the values inside the selector
Object.entries(material_presets).forEach(([k,v]) => {
    material_select.add(new Option(k))
})

material_select.onchange = function (){
    let name = material_select.value;
    let preset_material = material_presets[name];
    material_young  .value = preset_material[0];
    material_poisson.value = preset_material[1];
}

material_apply.onclick = function (){
    // TODO apply material
}