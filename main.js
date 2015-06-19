/**
 * Created by Yann on 19/06/2015.
 */
function output(message){
    console.log(message);
}

function Edge(from, to) {
    this.from = from;
    this.to = to;
    this.toString = function () {
        return '(' + from + ' -> ' + to + ')';
    };
}

function arrayContains(element, array) {
    return (array.indexOf(element) > -1);
}

function Graph() {
    this.edges = [];
    this.addEdge = function (from, to) {
        var newEdge = new Edge(from, to);
        this.edges.push(newEdge);
    };
    this.toString = function () { return 'edges : [' + this.edges + ' ]'; };
    this.findReachableNeighbors = function(v){
        return this.edges.filter(function(e){
            return e.from == v;
        }).map(function(e){
            return e.to;
        });
    };
    this.findPath = function (from, to) {
        var isNotMarked = function(v){
            return !arrayContains(v,marked);
        };

        var minDist = function(a, b){
            return distances[a] <= distances[b] ? a : b;
        };

        function findSmallestUnmarked() {
            var allNotMarked = allVertices.filter(isNotMarked);
            if(allNotMarked.length <= 0) return null;
            return allNotMarked.reduce(minDist);
        }

        function reconstructPath() {
            if (previous[to] == null) return null;

            var path = [];
            var currentVertex = to;
            do {
                path.push(currentVertex);
                currentVertex = previous[currentVertex];
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
        for(var v in allVertices){
            if(allVertices.hasOwnProperty(v)){
                var vertex = allVertices[v];
                distances[vertex] = Number.POSITIVE_INFINITY;
            }
        }

        distances[from]=0;
        output('initial :');

        prettyPrintDistances();

        var smallestUnmarked;
        while((smallestUnmarked = findSmallestUnmarked()) != null){
            var current = smallestUnmarked;
            output('visiting : ' + current);
            marked.push(current);
            this.findReachableNeighbors(current).forEach(function(n){
                var oldDistance = distances[n];
                var distanceWithCurrent = distances[current] + 1;

                if(distanceWithCurrent  < oldDistance){
                    distances[n] = distanceWithCurrent;
                    previous[n] = current;
                }
            });
            prettyPrintDistances();
        }

        return reconstructPath();
    };

    this.toGrahViz = function(){
        function edgeWithArrow(e) {
            return e.from + ' -> ' + e.to;
        }
        return 'digraph g{' + this.edges.map(edgeWithArrow) + '}';
    };

    this.findAllVertices = function () {
        var allVertices = [];
        for (var e in this.edges) {
            if(this.edges.hasOwnProperty(e)) {
                var curE = this.edges[e];
                if (!arrayContains(curE.from, allVertices)) {
                    allVertices.push(curE.from);
                }
                if (!arrayContains(curE.to, allVertices)) {
                    allVertices.push(curE.to);
                }
            }
        }
        return allVertices;
    };

}

Graph.generateCircle = function(nbVertices) {
    var graph = new Graph();
    for (var numVertex = 0; numVertex < nbVertices; numVertex++) {
        graph.addEdge(numVertex, (numVertex + 1) % nbVertices);
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
    function createVertices() {
        for (var i = 0; i < nbVertices; i++) {
            vertices.push(i);
        }
    }

    function createEdges() {
        for (var i = 0; i < nbEdges; i++) {
            var v1 = randomInArray(vertices);
            var v2 = randomInArray(vertices);
            graph.addEdge(v1, v2);
        }
    }
    var vertices = [];
    var graph = new Graph();

    createVertices();
    createEdges();
    return graph;
};

function prettyPath(path) {
    return path==null ? 'no path found! ' : path.join(" -> ");
}

var graph1 = Graph.generateCircle(20);
output(graph1.toString());
output(graph1.toGrahViz());

var path = graph1.findPath('0', '19');
output(prettyPath(path));

var graph2 = Graph.generateRandom(10,30);
output(graph2.toString());
output(graph2.toGrahViz());

var path2 = graph2.findPath('0', '9');
output(prettyPath(path2));
