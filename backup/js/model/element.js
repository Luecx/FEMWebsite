class FE_Element{
    constructor(node_ids) {
        this.node_ids = node_ids;
    }
    triangulate(){};
    surround(){};
}

/**
 * a quad with 4 nodes.
 * N1 -- N4
 * |      |
 * N2 -- N3
 */
class Quad4 extends FE_Element{
    constructor(n1,n2,n3,n4) {
        super([n1,n2,n3,n4]);
    }
    triangulate(){
        return [new Triangle(this.node_ids[0],this.node_ids[1],this.node_ids[2]),
                new Triangle(this.node_ids[0],this.node_ids[2],this.node_ids[3])];
    }
    surround() {
        return [new Line(this.node_ids[0], this.node_ids[1]),
                new Line(this.node_ids[1], this.node_ids[2]),
                new Line(this.node_ids[2], this.node_ids[3]),
                new Line(this.node_ids[3], this.node_ids[0])];
    }
}

/**
 * a triangle with 3 nodes
 * N1_
 * |  \__
 * |     \__
 * N2 ------ N3
 */
class Tri3 extends FE_Element{
    constructor(n1,n2,n3) {
        super([n1,n2,n3]);
    }
    triangulate(){
        return [new Triangle(this.node_ids[0],this.node_ids[1],this.node_ids[2])];
    }
    surround() {
        return [new Line(this.node_ids[0], this.node_ids[1]),
                new Line(this.node_ids[1], this.node_ids[2]),
                new Line(this.node_ids[2], this.node_ids[0])];
    }
}

/**
 * a quad with 8 nodes. the first 4 nodes are the vertices of the quad. the second 4 vertices
 * lay on the edge.
 * N1 -- N8 -- N4
 * |            |
 * N5          N7
 * |            |
 * N2 -- N6 -- N3
 */
class Quad8 extends FE_Element{
    constructor(n1,n2,n3,n4,n5,n6,n7,n8) {
        super([n1,n2,n3,n4,n5,n6,n7,n8]);
    }
    triangulate(){
        return [new Triangle(this.node_ids[0],this.node_ids[4],this.node_ids[7]), // top left
                new Triangle(this.node_ids[4],this.node_ids[1],this.node_ids[5]), // bot left
                new Triangle(this.node_ids[5],this.node_ids[2],this.node_ids[6]), // bot right
                new Triangle(this.node_ids[6],this.node_ids[3],this.node_ids[7]), // top right
                new Triangle(this.node_ids[4],this.node_ids[6],this.node_ids[7]), // top half
                new Triangle(this.node_ids[4],this.node_ids[5],this.node_ids[6])] // bot half;
    }
    surround() {
        return [new Line(this.node_ids[0], this.node_ids[4]),
                new Line(this.node_ids[4], this.node_ids[1]),
                new Line(this.node_ids[1], this.node_ids[5]),
                new Line(this.node_ids[5], this.node_ids[2]),
                new Line(this.node_ids[2], this.node_ids[6]),
                new Line(this.node_ids[6], this.node_ids[3]),
                new Line(this.node_ids[3], this.node_ids[7]),
                new Line(this.node_ids[7], this.node_ids[0])];
    }
}
