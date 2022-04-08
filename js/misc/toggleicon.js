
let icon_toggle_on_class = "fa-check";
let icon_toggle_off_class = "fa-xmark"

/**
 * Returns the toggle state based on the classes present
 * @param element the html element
 * @returns {boolean} true if the icon is toggled on
 */
function get_icon_state(element){
    if(element.classList.contains(icon_toggle_off_class)){
        return false;
    }else{
        return true;
    }
}

/**
 * toggles the element on (sets a valid symbol)
 * @param element
 * @param call_macro
 */
function toggle_icon_on(element){
    element.classList.add(icon_toggle_on_class);
    element.classList.remove(icon_toggle_off_class);

    element.classList.add("text-success");
    element.classList.remove("text-danger");
}

/**
 * toggles the given element off (sets an invalid symbol)
 * @param element
 */
function toggle_icon_off(element){
    element.classList.remove(icon_toggle_on_class);
    element.classList.add(icon_toggle_off_class);

    element.classList.remove("text-success");
    element.classList.add("text-danger");
}

