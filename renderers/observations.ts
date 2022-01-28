declare const artifact: {
    content: {
        observations: string[],
        conclusion: string,
        hypotheses: string[]
    }
};

function renderArtifact(){
    let target: HTMLElement = document.querySelector( "#artifact" );
    if (!target) throw new Error( "#artifact element not found!" )
    if (!artifact) throw new Error( "no artifact data found!" )
    let template = '';
    
    if ( artifact.content.hypotheses.length > 0 ){
        template += `
        <div class="card">
            <header class="card-header">
                <p class="card-header-title">
                    Hypotheses
                </p>
            </header>
            <div class="card-content">`;
        for ( let i = 0; i < artifact.content.hypotheses.length; i++ ){
            template += `<div class="content" style="white-space: pre-line;">${artifact.content.hypotheses[i]}</div>`
        }
        template += "</div></div>";
    }

    if ( artifact.content.observations.length > 0 ){
        template += `
        <div class="card" style="margin-top: 1em;">
            <header class="card-header">
                <p class="card-header-title">
                    Observations
                </p>
            </header>
            <div class="card-content">`;
        for ( let i = 0; i < artifact.content.observations.length; i++ ){
            template += `<div class="content" style="white-space: pre">${artifact.content.observations[i]}</div>`
        }
        template += "</div></div>";
    }

    if( artifact.content.conclusion ) {
        template += `
        <div class="card" style="margin-top: 1em;">
            <header class="card-header">
                <p class="card-header-title">
                    Conclusion
                </p>
            </header>
            <div class="card-content">
                <div class="content" style="white-space: pre-line;">
                    ${artifact.content.conclusion}
                </div>
            </div>
        </div>`
    }

    
    target.insertAdjacentHTML('beforeend', template );
}

document.addEventListener('DOMContentLoaded', () => {
    renderArtifact();
});
