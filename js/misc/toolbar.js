// enables the toggle option for the given buttons in the toolbar

enable_toggle('toolbar-btn-nodes'      ,tb_on_state_1, tb_off_state_1, true,function(state){render_scene.render_points   = state;});
enable_toggle('toolbar-btn-grid'       ,tb_on_state_1, tb_off_state_1, true,function(state){render_scene.render_grid     = state;});
enable_toggle('toolbar-btn-outline'    ,tb_on_state_1, tb_off_state_1, true,function(state){render_scene.render_boundary = state;});
enable_toggle('toolbar-btn-show-colors',tb_on_state_1, tb_off_state_1, true,function(state){render_scene.render_values   = state;});
enable_toggle('toolbar-btn-loads'      ,tb_on_state_1, tb_off_state_1, true,function(state){render_scene.render_loads    = state;});
enable_toggle('toolbar-btn-supports'   ,tb_on_state_1, tb_off_state_1, true,function(state){render_scene.render_supports = state;});