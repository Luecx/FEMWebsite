function select_enable_mousewheel(select, func){
    select.addEventListener('wheel', function(e){
        if(this.hasFocus){
            return;
        }
        if(e.deltaY < 0){
            this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
            func()
        }
        if(e.deltaY > 0){
            this.selectedIndex = Math.min(this.selectedIndex + 1, this.length-1);
            func()
        }
    })
}