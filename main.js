/**
 * Created by Yann on 19/06/2015.
 */
function output(message){
    console.log(message);
}

function Edge(from, to, cost) {
    this.from = from;
    this.to = to;
    this.cost = cost;
    this.toString = function () {
        return this.from + ' --'+this.cost+'-> ' + this.to;
    };
}

Edge.withConstantCost = function(from, to){
    return new Edge(from, to, 1);
};

function Vertex(label, id){
    this.label = label;
    this.id = id;
    this.toString = function(){
        return '(' + this.label  + ')';
    };
}

Vertex.fromId = function(id){
    return new Vertex(id,id);
};

function arrayContains(element, array) {
    return (array.indexOf(element) > -1);
}

function Graph() {
    this.edges = [];
    this.addEdge = function (from, to) {
        var newEdge = Edge.withConstantCost(from, to);
        this.edges.push(newEdge);
    };
    this.toString = function () { return 'edges : [' + this.edges.join(', ') + ']'; };
    this.findReachableNeighbors = function(v){
        return this.edges.filter(function(e){
            return e.from.id == v.id;
        }).map(function(e){
            return e.to;
        });
    };

    this.findCost = function (from, to) {
        var filtered = this.edges.filter(function(e){
            return (e.from.id == from.id) && (e.to.id == to.id);
        });
        if(filtered.length <= 0) return Number.POSITIVE_INFINITY;
        return filtered[0].cost;
    };

    this.findPath = function (from, to) {
        var isNotMarked = function(v){
            return !arrayContains(v.id,marked);
        };

        var minDist = function(a, b){
            return distances[a.id] <= distances[b.id] ? a : b;
        };

        function findSmallestUnmarked() {
            var allNotMarked = allVertices.filter(isNotMarked);
            if(allNotMarked.length <= 0) return null;
            return allNotMarked.reduce(minDist);
        }

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

        function prettyPrintDistances() {
            output(JSON.stringify(distances));
        }

        output('initialisation des données');
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

    this.toGraphViz = function(){
        function formatGraphVizEdge(e) {
            return e.from.label + ' -> ' + e.to.label + ' [ label="' + e.cost + '" ];';
        }
        return 'digraph g{' + this.edges.map(formatGraphVizEdge).join('\n') + '}';
    };

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

}

Graph.generateCircle = function(nbVertices) {
    var graph = new Graph();
    for (var numVertex = 0; numVertex < nbVertices; numVertex++) {
        var v1 = Vertex.fromId(numVertex);
        var v2 = Vertex.fromId((numVertex + 1) % nbVertices);

        graph.addEdge(v1, v2);
    }
    return graph;
};

function random(max) {
    return Math.floor(Math.random() * (max+1));
}

function randomInArray(array) {
    return array[random(array.length - 1)];
}

Graph.generateRandom = function(nbVertices, nbEdges){

    if(nbEdges > Math.pow(nbVertices,2)){
        throw 'too many edges ! ('+ nbEdges + '>' + Math.pow(nbVertices,2);
    }

    var allEdges = [];

    function createEdges() {
        for (var i = 0; i < nbVertices; i++) {
            for (var j = 0; j < nbVertices; j++) {
                var v1 = Vertex.fromId(i);
                var v2 = Vertex.fromId(j);
                allEdges.push(Edge.withConstantCost(v1,v2));
            }
        }
    }

    function pickEdges() {
        for(var i=0;i<nbEdges;i++){
            var id = random(allEdges.length-1);
            graph.addEdge(allEdges[id].from, allEdges[id].to);
            allEdges.splice(id,1);
        }
    }

    var graph = new Graph();

    createEdges();
    pickEdges();

    return graph;
};

function prettyPath(path) {
    return path==null ? 'no path found! ' : path.join(" -> ");
}

function showGraphViz(gr) {
    var element = document.getElementById("mydiv");
    element.innerHTML += Viz(gr.toGraphViz(), "svg");
}

window.onload = function() {
    //var graph1 = Graph.generateCircle(20);
    //output(graph1.toString());
    //
    //output(graph1.toGraphViz());
    //showGraphViz(graph1);
    //var svg = Viz("digraph { a -> b; }", "svg");
    //output(svg);
    //var path = graph1.findPath(Vertex.fromId(0), Vertex.fromId(19));
    //output(prettyPath(path));

    var graph2 = Graph.generateRandom(10, 50);
    output(graph2.toString());
    output(graph2.toGraphViz());
    showGraphViz(graph2);

    var path2 = graph2.findPath(Vertex.fromId(0), Vertex.fromId(9));
    output(prettyPath(path2));
};