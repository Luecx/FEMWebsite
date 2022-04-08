let toggle_macros   = {};
let off_state_class = {};
let on_state_class  = {};

let tb_on_state_1  = 'btn-secondary'
let tb_on_state_2  = 'btn-primary'
let tb_off_state_1 = 'btn-light'
let tb_off_state_2 = 'btn-outline-secondary'
let tb_off_state_3 = 'btn-danger'

/**
 * Returns the toggle state based on the classes present
 * @param element the html element
 * @returns {boolean} true if the button is toggled on
 */
function get_toggle_state(element){
    if(element.classList.contains(off_state_class[element.id])){
        return false;
    }else{
        return true;
    }
}

/**
 * toggles the element on
 * If call_macro is set to true, the macro passed to enable_toggle will be invoked.
 * @param element
 * @param call_macro
 */
function toggle_on(element, call_macro=false){
    element.classList.remove(off_state_class[element.id]);
    element.classList.add   (on_state_class[element.id]);
    if(call_macro){
        toggle_macros[element.id](true);
    }
}

/**
 * toggles the given element off
 * If call_macro is set to true, the macro passed to enable_toggle will be invoked.
 * @param element
 * @param call_macro
 */
function toggle_off(element, call_macro=false){
    element.classList.remove(on_state_class[element.id]);
    element.classList.add   (off_state_class[element.id]);
    if(call_macro){
        toggle_macros[element.id](false);
    }
}

/**
 * enables the toggle option for a button
 * Furthermore it gives a macro on_toggle which will be invoked once the user
 * clicks on the button.
 *
 * @param element_name
 * @param on_state
 * @param off_state
 * @param default_state
 * @param on_toggle
 */
function enable_toggle(element_name, on_state, off_state, default_state, on_toggle){
    let elem = document.getElementById(element_name);
    if(elem === null) return;

    toggle_macros  [elem.id] = on_toggle;
    off_state_class[elem.id] = off_state;
    on_state_class [elem.id] = on_state;

    if(default_state){
        toggle_on(elem);
    }else{
        toggle_off(elem);
    }

    elem.addEventListener('click',e =>{
        if(!get_toggle_state(elem)){
            // activate
            toggle_on(elem);
            on_toggle(true);
        }else {
            // deactivate
            toggle_off(elem);
            on_toggle(false);
        }});
}