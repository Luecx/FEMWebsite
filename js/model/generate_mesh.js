
function generate_rectangle(width, height, n_elem_x, n_elem_y, order, wrap_y=false){

    let n_nodes_x = n_elem_x * order + 1;
    let n_nodes_y = n_elem_y * order + 1;

    if(order !== 1 && order !== 2) {
        return [];
    }

    let nodes_indices = new Array(n_nodes_x);
    let nodes_list    = []
    let element_list  = []

    let node_counter = 0;

    // generate the nodes
    for(let x = 0; x < n_nodes_x; x ++){
        nodes_indices[x] = new Array(n_nodes_y);
        for(let y = 0; y < n_nodes_y; y ++){
            // skip any interior nodes
            if(x % order !== 0 && y % order !== 0) continue;
            // create new node
            if(wrap_y && y === n_nodes_y - 1){
                nodes_indices[x][y] = nodes_indices[x][0];
            }else{
                let new_node = new Node(x / (n_nodes_x - 1) * width, y / (n_nodes_y - 1) * height);
                // put into the array and the list
                nodes_indices[x][y] = node_counter ++;
                nodes_list.push(new_node);
            }
        }
    }

    // generate the elements
    for(let x = 0; x < n_elem_x; x ++){
        for(let y = 0; y < n_elem_y; y ++){
            let n1_id_x = x * order;
            let n1_id_y = y * order;

            if(order === 1){
                element_list.push(new Quad4(
                    nodes_indices[n1_id_x  ][n1_id_y  ],
                    nodes_indices[n1_id_x+1][n1_id_y  ],
                    nodes_indices[n1_id_x+1][n1_id_y+1],
                    nodes_indices[n1_id_x  ][n1_id_y+1]))
            }else if(order === 2){
                element_list.push(new Quad8(
                    nodes_indices[n1_id_x  ][n1_id_y  ],
                    nodes_indices[n1_id_x+2][n1_id_y  ],
                    nodes_indices[n1_id_x+2][n1_id_y+2],
                    nodes_indices[n1_id_x  ][n1_id_y+2],

                    nodes_indices[n1_id_x+1][n1_id_y  ],
                    nodes_indices[n1_id_x+2][n1_id_y+1],
                    nodes_indices[n1_id_x+1][n1_id_y+2],
                    nodes_indices[n1_id_x  ][n1_id_y+1]))
            }

        }
    }
    return [nodes_list, element_list];
}

function generate_defect(width, height, elem_size, defect_x, defect_y, defect_length, order){

    let n_elem_x = Math.round(width / elem_size);
    let n_elem_y = Math.round(height / elem_size);

    // adjust elements x and y
    n_elem_x       = Math.max(2, n_elem_x);
    n_elem_y       = Math.max(3, n_elem_y);

    let n_elem_x_1 = Math.round(defect_x / width * n_elem_x)
        n_elem_x_1 = Math.max(1, Math.min(n_elem_x - 1, n_elem_x_1));
    let n_elem_x_2 = n_elem_x - n_elem_x_1

    let n_elem_y_1 = Math.round(defect_y / height * n_elem_y);
    let n_elem_y_2 = Math.round(defect_length / height * n_elem_y);

    n_elem_y_1     = Math.max(1, Math.min(n_elem_y - 2, n_elem_y_1));
    n_elem_y_2     = Math.max(1, Math.min(n_elem_y - n_elem_y_1 - 1, n_elem_y_2));
    let n_elem_y_3 = Math.max(1, Math.min(n_elem_y - n_elem_y_1 - n_elem_y_2, n_elem_y - 2));

    let non_transformed_geom = generate_rectangle(width, height, n_elem_x, n_elem_y, order, false);
    let nodes = non_transformed_geom[0];
    let elems = non_transformed_geom[1];

    let nodes_x = n_elem_x * order + 1;
    let nodes_y = n_elem_y * order + 1;

    let new_defect_node_ids = {};
    
    let node_idx = 0;

    for(let nx = 0; nx < nodes_x; nx++){
        for(let ny = 0; ny < nodes_y; ny++){
            // ignore center nodes
            if(nx % order !== 0 && ny % order !== 0) continue;

            let node = nodes[node_idx];

            let is_defect_x = false;
            let is_defect_y = false;

            // adjust x
            if(nx < (n_elem_x_1 * order)){
                node.x = defect_x * nx / (n_elem_x_1  * order);
            }else if(nx > (n_elem_x_1 * order)){
                node.x = defect_x + (width - defect_x) * (nx - (n_elem_x_1 * order)) / (n_elem_x_2  * order);
            }else{
                is_defect_x = true;
                node.x = defect_x
            }

            // adjust y
            if(ny < (n_elem_y_1 * order)){
                node.y = defect_y * ny / (n_elem_y_1  * order);
            }else if(ny === (n_elem_y_1 * order)) {
                node.y = defect_y;
            }else if (ny > (n_elem_y_1 + n_elem_y_2) * order){
                node.y = defect_y + defect_length + (height - defect_y - defect_length)
                    * (ny - ((n_elem_y_1 + n_elem_y_2) * order)) / (n_elem_y_3 * order);
            }else if (ny === (n_elem_y_1 + n_elem_y_2) * order){
                node.y = defect_y + defect_length;
            }else{
                node.y = defect_y + defect_length * (ny - (n_elem_y_1 * order)) / (n_elem_y_2 * order);
                is_defect_y = true;
            }

            if(is_defect_x && is_defect_y){
                // create a new node and add to the list
                let new_node = new Node(node.x - elem_size / 10, node.y);
                // put into the array and the list
                new_defect_node_ids[node_idx] = nodes.length;
                nodes.push(new_node);
                node.x += elem_size / 10;
            }
            node_idx += 1;
        }
    }

    // adjust any element on the left side of the
    for(let ne = (n_elem_y ) * (n_elem_x_1 - 1); ne < n_elem_y * n_elem_x_1; ne ++){
        for(let i = 0; i < elems[ne].node_ids.length; i++){
            if(elems[ne].node_ids[i] in new_defect_node_ids){
                elems[ne].node_ids[i] = new_defect_node_ids[elems[ne].node_ids[i]];
            }
        }
    }

    return [nodes, elems];
}

function generate_arc(length, width, radius, alpha, n_elem_arc, n_elem_width, order){

    // transform alpha to radiant
    alpha = alpha / 180 * Math.PI;

    let radius1 = radius - width;
    let radius2 = radius;

    let outer_curved_length = alpha * radius2;
    let outer_length        = outer_curved_length + 2 * length;

    // check if it should wrap. this is the case if length = 0 and alpha = 360
    let should_wrap          = length === 0 && Math.abs(alpha - 2 * Math.PI) < 0.0001;
    let non_transformed_geom = generate_rectangle(width, outer_length, n_elem_width, n_elem_arc, order, should_wrap);

    let nodes = non_transformed_geom[0];

    let rotation_center_x = width + radius1;
    let rotation_center_y = length;

    nodes.forEach(n => {
        // check what part we are in
        if (n.y <= length){
            // dont do anything here
        } else if(n.y <= length + outer_curved_length){
            // do the arc thing
            // first compute the distance to the rotation point
            let rotation_distance = radius1 + (width - n.x);
            // compute the angle between the connection of the rotation center and the pointer to the horizontal axis
            let rotation_angle    = (n.y - length) / outer_curved_length * alpha;
            // correct the x and y values based on the values above
            n.x = rotation_center_x - (Math.cos(rotation_angle)) * rotation_distance;
            n.y = rotation_center_y + (Math.sin(rotation_angle)) * rotation_distance;
        } else {
            // handle the upper remaining part
            // we also need the rotation distance here as well as the end point of the rotating part
            let rotation_distance = radius1 + (width - n.x);
            let rotation_angle    = alpha;
            // compute the root
            let root_x            = rotation_center_x - (Math.cos(rotation_angle)) * rotation_distance;
            let root_y            = rotation_center_y + (Math.sin(rotation_angle)) * rotation_distance;
            // compute the direction
            let dir_x             = Math.sin(alpha);
            let dir_y             = Math.cos(alpha);
            // compute the distance from the root
            let dist              = n.y - (outer_curved_length + length);
            // adjust
            n.x                   = root_x + dir_x * dist;
            n.y                   = root_y + dir_y * dist;
        }
    });

    // fix midpoints if its order of two
    if(order === 2){
        let fix_midpoint = function (nodes, n1, n2, nm){
            nodes[nm].x = (nodes[n1].x + nodes[n2].x) / 2;
            nodes[nm].y = (nodes[n1].y + nodes[n2].y) / 2;
        }

        non_transformed_geom[1].forEach(elem => {
            fix_midpoint(nodes, elem.node_ids[0], elem.node_ids[1], elem.node_ids[4]);
            fix_midpoint(nodes, elem.node_ids[1], elem.node_ids[2], elem.node_ids[5]);
            fix_midpoint(nodes, elem.node_ids[2], elem.node_ids[3], elem.node_ids[6]);
            fix_midpoint(nodes, elem.node_ids[3], elem.node_ids[0], elem.node_ids[7]);
        })
    }

    return [nodes,non_transformed_geom[1]];
}

function generate_i_profile(width, width_1, width_2, height, height_1, height_2, elems_x, elems_y, order){

    let full_width  = width  + width_1  + width_2
    let full_height = height + height_1 + height_2

    let non_transformed_geom = generate_rectangle(full_width, full_height, elems_x, elems_y, order);
    let nodes = non_transformed_geom[0]
    let elems = non_transformed_geom[1]
    let nodes_corrected = []
    let elems_corrected = []

    let elems_w1 = Math.ceil(width_1 / full_width * elems_x)
    let elems_w2 = Math.ceil(width_2 / full_width * elems_x)
    let elems_wm = elems_x - (elems_w1 + elems_w2)

    let elems_h1 = Math.ceil(height_1 / full_height * elems_y)
    let elems_h2 = Math.ceil(height_2 / full_height * elems_y)
    let elems_hm = elems_y - (elems_h1 + elems_h2)

    let nodes_x  = elems_x * order + 1;
    let nodes_y  = elems_y * order + 1;

    // compute new node indices
    let new_node_idx = new Int32Array(nodes.length);

    // correct node location
    let node_idx = 0
    let node_idx_corrected = 0
    for (let nx = 0; nx < nodes_x; nx++){
        for (let ny = 0; ny < nodes_y; ny++){
            // ignore center nodes
            if(nx % order !== 0 && ny % order !== 0) continue;

            // correct x coordinate
            let node = nodes[node_idx];

            let is_left_right = false;
            let is_top_bot    = false;

            if(nx < elems_w1 * order){
                // left side
                node.x = nx / (elems_w1 * order) * width_1
                is_left_right = true;
            }else if(nx <= (elems_w1 + elems_wm) * order){
                // middle side
                node.x = width_1 + (nx - elems_w1 * order) / (elems_wm * order) * width
            }else{
                // right side
                node.x = width_1 + width + (nx - (elems_w1 + elems_wm) * order) / (elems_w2 * order) * width_2
                is_left_right = true;
            }

            if(ny <= elems_h1 * order){
                // bot side
                node.y = ny / (elems_h1 * order) * height_1
                is_top_bot = true;
            }else if(ny < (elems_h1 + elems_hm) * order){
                // middle side
                node.y = height_1 + (ny - elems_h1 * order) / (elems_hm * order) * height
            }else{
                // top side
                node.y = height_1 + height + (ny - (elems_h1 + elems_hm) * order) / (elems_h2 * order) * height_2
                is_top_bot = true;
            }

            if(!is_left_right || is_top_bot){
                // dont erase the node
                new_node_idx[node_idx] = node_idx_corrected;
                node_idx_corrected ++;
                nodes_corrected.push(node);
            }else{
                new_node_idx[node_idx] = -1;
            }

            node_idx += 1
        }
    }

    // erase wrong elements
    for(let ex = 0; ex < elems_x; ex++){
        for(let ey = 0; ey < elems_y; ey++){
            let elem_idx = ex * elems_y + ey;
            let element  = elems[elem_idx]

            for(let n = 0; n < element.node_ids.length; n++){
                element.node_ids[n] = new_node_idx[element.node_ids[n]];
            }


            if(ey <  elems_h1
            || ey >= elems_hm + elems_h1
            || (ex >= elems_w1) && (ex < elems_wm + elems_w1)){
                elems_corrected.push(element)
            }

        }
    }

    return [nodes_corrected, elems_corrected]

}

function generate_hook(width_1, width_2, width_3, width_4, length_1, length_2, length_3, angle_1, angle_2, radius, element_size, order){

    // widths
    let handle_width  = width_1;
    let inner_width_1 = width_2;
    let inner_width_2 = width_3;
    let tip_width     = width_4;

    // lengths
    let handle_length   = length_1;
    let straight_length = length_2;
    let tip_length      = length_3;

    // angle
    let straight_angle = angle_1 / 360 * 2 * Math.PI;
    let inner_angle    = angle_2 / 360 * 2 * Math.PI;
    let inner_radius   = radius;

    let outer_curve_length =inner_angle * (inner_radius + (inner_width_1 + inner_width_2) / 2)
    let outer_curve_tip_length = Math.sqrt(tip_length ** 2 + (tip_width - inner_width_2) ** 2)

    // total body length to generate
    let body_length = handle_length + straight_length + outer_curve_length + outer_curve_tip_length;

    let inner_rotation_center_y = - handle_length / 2
                                  - Math.cos(straight_angle) * straight_length
                                  - Math.sin(straight_angle) * inner_radius;

    let inner_rotation_center_x =   handle_width / 2
                                  - Math.sin(straight_angle) * straight_length
                                  + Math.cos(straight_angle) * inner_radius;


    let non_transformed_geom = generate_rectangle(handle_width, body_length,
                                Math.round(width_1 / element_size),
                                Math.round(body_length / element_size), order);

    let nodes = non_transformed_geom[0];

    let interpolate = (p1,p2,x) => {
        return [p1[0] + (p2[0] - p1[0]) * x,
                p1[1] + (p2[1] - p1[1]) * x]
    }

    let inner_func = y => {
        if(y > (body_length - handle_length)){
            return [handle_width / 2, y - (body_length - handle_length * 0.5)]
            // pass
        } else if(y > outer_curve_tip_length + outer_curve_length){
            let p1 = [handle_width  / 2, - handle_length / 2]
            let p2 = [handle_width  / 2 - Math.sin(straight_angle) * straight_length,
                    - handle_length / 2 - Math.cos(straight_angle) * straight_length]
            let p  = 1- (y - (outer_curve_tip_length + outer_curve_length)) / straight_length
            return interpolate(p1,p2,p);
        } else if(y > outer_curve_tip_length){
            let p = 1 - (y - outer_curve_tip_length) / outer_curve_length
            let a = Math.PI - straight_angle + p * inner_angle;
            return [
                Math.cos(a) * inner_radius + inner_rotation_center_x,
                Math.sin(a) * inner_radius + inner_rotation_center_y,
            ];
        } else{
            let a = Math.PI - straight_angle + inner_angle;
            let p = 1 - y / outer_curve_tip_length;

            let p1 =  [Math.cos(a) * inner_radius + inner_rotation_center_x,
                       Math.sin(a) * inner_radius + inner_rotation_center_y]
            let p2 =  [Math.cos(a) * inner_radius + inner_rotation_center_x + tip_length * Math.cos(a + Math.PI / 2),
                       Math.sin(a) * inner_radius + inner_rotation_center_y + tip_length * Math.sin(a + Math.PI / 2)]
            return interpolate(p1,p2, p);
        }
    };

    let outer_func = y => {
        if(y > (body_length - handle_length)){
            return [-handle_width / 2, y - (body_length - handle_length * 0.5)]
            // pass
        } else if(y > outer_curve_tip_length + outer_curve_length){

            let p1 = [-handle_width  / 2, - handle_length / 2]
            let p2 = [ handle_width  / 2 - Math.sin(straight_angle) * straight_length - Math.cos(straight_angle) * inner_width_1,
                     - handle_length / 2 - Math.cos(straight_angle) * straight_length + Math.sin(straight_angle) * inner_width_1]

            return interpolate(
                    p1,p2,
                1- (y - (outer_curve_tip_length + outer_curve_length)) / straight_length);
        } else if(y > outer_curve_tip_length){
            let p = 1 - (y - outer_curve_tip_length) / outer_curve_length
            let a = Math.PI - straight_angle + p * inner_angle;
            let r = inner_radius + inner_width_1 + (inner_width_2 - inner_width_1) * p
            return [
                Math.cos(a) * r + inner_rotation_center_x,
                Math.sin(a) * r + inner_rotation_center_y,
            ];
        } else{
            let a = Math.PI - straight_angle + inner_angle;
            let r = inner_radius + inner_width_2
            let p = 1 - y / outer_curve_tip_length;

            let p1 =  [Math.cos(a) * r + inner_rotation_center_x,
                       Math.sin(a) * r + inner_rotation_center_y]
            let p2 =  [Math.cos(a) * inner_radius + inner_rotation_center_x + tip_length * Math.cos(a + Math.PI / 2) + Math.sin(a + Math.PI / 2) * tip_width,
                       Math.sin(a) * inner_radius + inner_rotation_center_y + tip_length * Math.sin(a + Math.PI / 2) - Math.cos(a + Math.PI / 2) * tip_width]
            return interpolate(p1,p2, p);
        }
    };

    nodes.forEach(n => {
        let c1 = inner_func(n.y);
        let c2 = outer_func(n.y);
        let cp = interpolate(c2, c1, n.x / handle_width)
        n.x = cp[0];
        n.y = cp[1];
    });

    // fix midpoints if its order of two
    if(order === 2){
        let fix_midpoint = function (nodes, n1, n2, nm){
            nodes[nm].x = (nodes[n1].x + nodes[n2].x) / 2;
            nodes[nm].y = (nodes[n1].y + nodes[n2].y) / 2;
        }

        non_transformed_geom[1].forEach(elem => {
            fix_midpoint(nodes, elem.node_ids[0], elem.node_ids[1], elem.node_ids[4]);
            fix_midpoint(nodes, elem.node_ids[1], elem.node_ids[2], elem.node_ids[5]);
            fix_midpoint(nodes, elem.node_ids[2], elem.node_ids[3], elem.node_ids[6]);
            fix_midpoint(nodes, elem.node_ids[3], elem.node_ids[0], elem.node_ids[7]);
        })
    }

    return [nodes,non_transformed_geom[1]];
}