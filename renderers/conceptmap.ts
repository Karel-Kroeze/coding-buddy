import { Network, DataSet } from 'vis';
import { visOptions } from './visOptions';
declare const artifact: any;

function createNetwork( map: any ){
    console.log({map});
    let nodes = new DataSet( map.nodes );
    let edges = new DataSet( map.edges );
    let network = new Network( document.getElementById("artifact")!, { nodes, edges }, visOptions );
    console.log( { map, nodes, edges, network, visOptions } );
}

document.addEventListener('DOMContentLoaded', () => {
    console.log( createNetwork( artifact.content.map || artifact.content.content || artifact.content.cmap.map ) );
});

