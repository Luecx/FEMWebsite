/**
 * returns an array of nodes and elements
 */
function generate_rectangle(width, height, n_elem_x, n_elem_y, order){
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
            let new_node = new Node(x / (n_nodes_x - 1) * width, y / (n_nodes_y - 1) * height);
            // put into the array and the list
            nodes_indices[x][y] = node_counter ++;
            // console.log(x,y,nodes_indices[x][y]);
            // console.log(nodes_indices);
            nodes_list.push(new_node);
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

function generate_arc(length, width, radius, alpha, n_elem_arc, n_elem_width, order){

    // transform alpha to radiant
    alpha = alpha / 180 * Math.PI;

    let radius1 = radius - width;
    let radius2 = radius;

    let outer_curved_length = alpha * radius2;
    let outer_length        = outer_curved_length + 2 * length;

    let non_transformed_geom = generate_rectangle(width, outer_length, n_elem_width, n_elem_arc, order);

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