import { Network } from 'vis';
import { visOptions } from './visOptions';
declare const artifact: any;


function createNetwork( prop: any ){
    let target: HTMLElement = document.querySelector( "#artifact" );
    if (!target) throw new Error( "#artifact element not found!" )
    if (!artifact) throw new Error( "no artifact data found!" )

    visOptions.physics = { enabled: true };
    let network = new Network( target, { nodes: [{ label: prop.from, id: "from" }, { label: prop.to, id: "to" }], edges: [{ label: prop.label, from: "from", to: "to" }] }, visOptions );
    network.stabilize( 2000 );
}

document.addEventListener('DOMContentLoaded', () => {
    createNetwork( artifact.content );
});

