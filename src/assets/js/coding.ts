document.addEventListener('DOMContentLoaded', () => {
    /**
     * Focus first criterion
     */
    // input field, or if checkradio, label.
    let element: HTMLElement | null = document.querySelector( "form input:not(.is-checkradio), form input.is-checkradio + label" );
    if ( !!element ) element.focus();

    // add help field toggle button
    let helpToggle: HTMLButtonElement | null = document.querySelector( "#help-toggle" );
    if ( !!helpToggle ){
        helpToggle.onclick = () => {
            toggleSetting();
            toggleHelp( helpToggle );
        };
    }

    // if we toggled this before, persist that setting
    if (hideHelp()) {
        toggleHelp( helpToggle );
    }
});

function toggleHelp( helpToggle: HTMLButtonElement | null ) {
    document.querySelectorAll( "#criteria .help" ).forEach( el => {
        el.classList.toggle( "hidden" );
    });
}

function hideHelp(){
    return localStorage.getItem( "hide-criteria-help" ) == "true";
}

function toggleSetting() {
    localStorage.setItem( "hide-criteria-help", hideHelp() ? "false" : "true" );
}

function mark( artifactId: string, event: Event ){
    event.preventDefault();

    const el: HTMLButtonElement | null = document.querySelector( "#mark-button" );
    if (!el)
        return false;
    el.disabled = true;    
    fetch( "/coding/mark", { 
        method: "post", 
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }, 
        body: JSON.stringify({ artifact: artifactId })})
        .then( async res => {
            console.log( "ready!" );
            const response = await res.text();
            console.log( response );
            el.classList.remove( "is-info" );
            el.title = response;
            el.classList.add( res.status == 200 ? "is-success" : "is-danger" );
        })
        .catch( console.error )
}