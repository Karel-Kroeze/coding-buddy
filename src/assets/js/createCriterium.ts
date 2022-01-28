document.addEventListener('DOMContentLoaded', () => {
    // hide and show elements based on type selection
    // todo: make it easy to exand for new types of criteria
    let typeSelector: HTMLSelectElement = <any>document.querySelector( "#type" );
    let conditionals = document.querySelectorAll( ".conditional" );

    let hideConditionals = () => {
        conditionals.forEach( c => c.classList.add( "hidden" ) );
        document.querySelectorAll( `.if-${typeSelector.value}` ).forEach( c => c.classList.remove( "hidden" ) );
    }

    typeSelector.addEventListener("change", hideConditionals );
    hideConditionals();
});