let toggle_macros = {};

/**
 * Returns the toggle state based on the classes present
 * @param element the html element
 * @returns {boolean} true if the button is toggled on
 */
function get_toggle_state(element){
    if(element.classList.contains("btn-outline-secondary")){
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
    element.classList.remove("btn-outline-secondary");
    element.classList.add("btn-secondary");
    if(call_macro){
        toggle_macros[element](true);
    }
}

/**
 * toggles the given element off
 * If call_macro is set to true, the macro passed to enable_toggle will be invoked.
 * @param element
 * @param call_macro
 */
function toggle_off(element, call_macro=false){
    element.classList.remove("btn-secondary");
    element.classList.add("btn-outline-secondary");
    if(call_macro){
        toggle_macros[element](false);
    }
}

/**
 * enables the toggle option for a button
 * Furthermore it gives a macro on_toggle which will be invoked once the user
 * clicks on the button.
 *
 * @param element_name
 * @param on_toggle
 */
function enable_toggle(element_name, on_toggle){
    let elem = document.getElementById(element_name);
    if(elem === null) return;

    toggle_macros[elem] = on_toggle;

    elem.addEventListener('click',e =>{
        if(!get_toggle_state(elem)){
            // activate
            toggle_on(elem);
            on_toggle(true);
        }else {
            // deactivate
            toggle_off(elem);
            on_toggle(false);
        }}
    );
}