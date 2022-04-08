class Scene{

    constructor() {
        this.model = new Model(this);
        this.camera = new Camera();
        this.control = new Control(this);

        // shaders
        this.mesh_shader  = new MeshShader();
        this.line_shader  = new LineShader();
        this.grid_shader  = new GridShader();
        this.point_shader = new PointShader();
        this.arrow_shader = new ArrowShader();

        // settings
        this.render_points   = true;
        this.render_grid     = true;
        this.render_boundary = true;
        this.render_values   = true;
        this.render_loads    = true;
        this.render_supports = true;

        this.enable_selection = false;
    }

    render(){
        if(this.render_grid)
            this.grid_shader.render(this.camera);
        this.mesh_shader .render(this.model, this.camera, this.render_values);
        if(this.render_boundary)
            this.line_shader .render(this.model, this.camera);
        if(this.render_points)
            this.point_shader.render(this.model, this.camera, this.control, this.enable_selection);
        if(this.render_loads)
            this.arrow_shader.render(this.model, this.camera, true);
        if(this.render_supports)
            this.arrow_shader.render(this.model, this.camera, false);
    }

}