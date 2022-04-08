// enables the toggle option for the given buttons in the toolbar

enable_toggle('toolbar-btn-nodes'      ,function(state){render_scene.render_points   = state;});
enable_toggle('toolbar-btn-grid'       ,function(state){render_scene.render_grid     = state;});
enable_toggle('toolbar-btn-outline'    ,function(state){render_scene.render_boundary = state;});
enable_toggle('toolbar-btn-show-colors',function(state){render_scene.render_values   = state;});
enable_toggle('toolbar-btn-loads'      ,function(state){render_scene.render_loads    = state;});
enable_toggle('toolbar-btn-supports'   ,function(state){render_scene.render_supports = state;});