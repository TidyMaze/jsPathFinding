/**
 * Created by Yann on 19/06/2015.
 */

/**
 * Output policy
 * @param message message to output
 */
function output(message){
    console.log(message);
}

/**
 * Constructs an edge with 2 Vertex and the cost of transition
 * @param from starting vertex
 * @param to destination vertex
 * @param cost cost of transition (number)
 */
function Edge(from, to, cost) {
    this.from = from;
    this.to = to;
    this.cost = cost;
    this.toString = function () {
        return this.from + ' --'+this.cost+'-> ' + this.to;
    };
}

/**
 * Constructs an edge using a constant cost (1)
 * @param from starting vertex
 * @param to destination vertex
 */
Edge.withConstantCost = function(from, to){
    return new Edge(from, to, 1);
};

/**
 * Constructs a vertex using a label and an id
 * @param label label shown (String)
 * @param id unique ID of the vertex (Number/String)
 */
function Vertex(label, id){
    this.label = label;
    this.id = id;
    this.toString = function(){
        return '(' + this.label  + ')';
    };
}

/**
 * Constructs a vertex with the same label as id
 * @param id unique ID of the vertex (Number/String)
 */
Vertex.fromId = function(id){
    return new Vertex(id,id);
};

/**
 * Utility function to look for an element in an array
 * @param element element to look for
 * @param array array in which we look for the element
 */
function arrayContains(element, array) {
    return (array.indexOf(element) > -1);
}

/**
 * Represents an oriented graph made of edges.
 */
function Graph() {
    this.edges = [];

    /**
     * Adds an edge to the graph from to vertices
     * @param from starting vertex
     * @param to destination vertex
     */
    this.addEdge = function (from, to) {
        var newEdge = Edge.withConstantCost(from, to);
        this.edges.push(newEdge);
    };

    /**
     * Return a string representing the graph.
     * Format : "edges : [<edge>, <edge>, ...]"
     */
    this.toString = function () { return 'edges : [' + this.edges.join(', ') + ']'; };

    /**
     * Finds all reachable neighbors of a vertex in the graph
     * @param v vertex from which we look for neighbors
     */
    this.findReachableNeighbors = function(v){
        return this.edges.filter(function(e){
            return e.from.id == v.id;
        }).map(function(e){
            return e.to;
        });
    };

    /**
     * Finds the cost of transition between two vertices (if exists)
     * @param from starting vertex
     * @param to destination vertex
     * @return the cost {Number} or Number.POSITIVE_INFINITY
     */
    this.findCost = function (from, to) {
        var filtered = this.edges.filter(function(e){
            return (e.from.id == from.id) && (e.to.id == to.id);
        });
        if(filtered.length <= 0) return Number.POSITIVE_INFINITY;
        return filtered[0].cost;
    };

    /**
     * Returns a GraphViz description of the graph
     */
    this.toGraphViz = function(){
        function formatGraphVizEdge(e) {
            return e.from.label + ' -> ' + e.to.label + ' [ label="' + e.cost + '" ];';
        }
        return 'digraph g{' + this.edges.map(formatGraphVizEdge).join('\n') + '}';
    };

    /**
     * Find all vertices included in edges of this graph
     */
    this.findAllVertices = function () {
        var allVerticesId = [];
        var allVertices = [];

        this.edges.forEach(function(curE, idCur, array){
            if (!arrayContains(curE.from.id, allVerticesId)) {
                allVerticesId.push(curE.from.id);
                allVertices.push(curE.from);
            }
            if (!arrayContains(curE.to.id, allVerticesId)) {
                allVerticesId.push(curE.to.id);
                allVertices.push(curE.to);
            }
        });
        return allVertices;
    };

    /**
     * Fin a path between 2 vertices in the graph
     * @param from starting vertex
     * @param to destination vertex
     * @returns the path (array) of vertices in order to reach "to" from "from"
     */
    this.findPath = function (from, to) {
        /**
         * Check if a vertex is already marked
         * @param v vertex to check
         * @returns {boolean}
         */
        var isNotMarked = function(v){
            return !arrayContains(v.id,marked);
        };

        /**
         * Gets the vertex with the miminal distance to the starting vertex
         * @param a
         * @param b
         * @returns {*}
         */
        var minDist = function(a, b){
            return distances[a.id] <= distances[b.id] ? a : b;
        };

        /**
         * Finds the nearest vertex to starting vertex, who isn't marked
         * @returns {*}
         */
        function findSmallestUnmarked() {
            var allNotMarked = allVertices.filter(isNotMarked);
            if(allNotMarked.length <= 0) return null;
            return allNotMarked.reduce(minDist);
        }

        /**
         * After a pathfinding, reconstructs the path and return the corresponding array
         * @returns {*}
         */
        function reconstructPath() {
            if (previous[to.id] == null) return null;

            var path = [];
            var currentVertex = to;
            do {
                path.push(currentVertex);
                currentVertex = previous[currentVertex.id];
            } while (currentVertex != null);
            return path.reverse();
        }

        /**
         * Prints distances in a fancy way
         */
        function prettyPrintDistances() {
            output(JSON.stringify(distances));
        }

        output('Data initialisations');
        var marked = [];
        var distances = {};
        var previous = {};

        var allVertices = this.findAllVertices();

        allVertices.forEach(function(vertex, curID, array){
            distances[vertex.id] = Number.POSITIVE_INFINITY;
        });

        distances[from.id]=0;
        output('initial :');

        prettyPrintDistances();

        var graph = this;

        var smallestUnmarked;
        while((smallestUnmarked = findSmallestUnmarked()) != null){
            var current = smallestUnmarked;
            output('visiting : ' + current);
            marked.push(current.id);
            this.findReachableNeighbors(current).forEach(function(n){
                var oldDistance = distances[n.id];
                var distanceWithCurrent = distances[current.id] + graph.findCost(current, n);

                if(distanceWithCurrent  < oldDistance){
                    distances[n.id] = distanceWithCurrent;
                    previous[n.id] = current;
                }
            });
            prettyPrintDistances();
        }

        return reconstructPath();
    };

}

/**
 * Constructs a graph in circle (n -> n+1 and final->first)
 * @param nbVertices number of vertices to use
 * @returns {Graph}
 */
Graph.generateCircle = function(nbVertices) {
    var graph = new Graph();
    for (var numVertex = 0; numVertex < nbVertices; numVertex++) {
        var v1 = Vertex.fromId(numVertex);
        var v2 = Vertex.fromId((numVertex + 1) % nbVertices);

        graph.addEdge(v1, v2);
    }
    return graph;
};

/**
 * Returns a random integer number in range [0;max]
 * @param max maximum number (included)
 * @returns {number}
 */
function random(max) {
    return Math.floor(Math.random() * (max+1));
}

/**
 * Picks a random value in an array
 * @param array array to pick value
 * @returns {*}
 */
function randomInArray(array) {
    return array[random(array.length - 1)];
}

/**
 * Generates a random graph using vertices and edges
 * @param nbVertices number of vertices of the generated graph
 * @param nbEdges number of edges of the generated graph
 * @returns {Graph}
 */
Graph.generateRandom = function(nbVertices, nbEdges){

    if(nbEdges > Math.pow(nbVertices,2)){
        throw 'too many edges ! ('+ nbEdges + '>' + Math.pow(nbVertices,2);
    }

    var allEdges = [];

    var graph = new Graph();
    for (var i = 0; i < nbVertices; i++) {
        for (var j = 0; j < nbVertices; j++) {
            var v1 = Vertex.fromId(i);
            var v2 = Vertex.fromId(j);
            allEdges.push(Edge.withConstantCost(v1, v2));
        }
    }

    for (var i = 0; i < nbEdges; i++) {
        var id = random(allEdges.length - 1);
        graph.addEdge(allEdges[id].from, allEdges[id].to);
        allEdges.splice(id, 1);
    }
    return graph;
};

/**
 * Generates a fancy representation of a path.
 * @param path the path to represent
 * @returns {*}
 */
function prettyPath(path) {
    return path==null ? 'no path found! ' : path.join(" -> ");
}

/**
 * Show a graph in <mydiv> of the webpage
 * @param gr graph to show
 */
function showGraphViz(gr) {
    var element = document.getElementById("shownGraphDiv");
    element.innerHTML = Viz(gr.toGraphViz(), "svg");
}