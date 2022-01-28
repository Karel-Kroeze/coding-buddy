document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll( ".is-boolean" ).forEach( element => {
        let el = element as HTMLInputElement;
        el.onclick = toggleHandler( el );
    });

    /**
     * Add event listener for boolean switch keyboard interactions on label (enter, space).
     */
    let labels: NodeListOf<HTMLLabelElement> = document.querySelectorAll( "input.is-checkradio + label" );
    labels.forEach( label => {
        let input = label.parentElement!.querySelector( "input.is-checkradio" ) as HTMLInputElement;
        label.onkeydown = ( event ) => {
            console.log( `Keydown: "${event.key}"` );
            if (event.key == "Enter" || event.key == " "){
                event.preventDefault();
                event.stopPropagation();
                label.click();
            }
            if ( event.key == "y" ){
                setState( input, true );
                event.preventDefault();
                event.stopPropagation();
                focusNext();
            }
            if ( event.key == "n" ){
                setState( input, false );
                event.preventDefault();
                event.stopPropagation();
                focusNext();
            }
        }
    });
});

function toggleHandler( element: HTMLInputElement ): () => any {
    return () => {
        // current state
        let state = element.value;
        switch (state) {
            // if true, switch to false.
            case "true":
                setState( element, false );
                break;
        
            // if false or undefined, switch to true.
            default:
                setState( element, true );
                break;
        }
    }
}

function setState( element: HTMLInputElement, state: boolean ){
    if (state){
        element.value = "true";
        element.checked = true;
        element.classList.add( "is-success" );
        element.classList.remove( "is-danger" );
    } else {
        element.value = "false";
        element.checked = true;
        element.classList.add( "is-danger" );
        element.classList.remove( "is-success" );
    }
}

// https://stackoverflow.com/a/35173443
function focusNext() {
    //add all elements we want to include in our selection
    var focussableElements = 'a:not([disabled]), button:not([disabled]), input:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';
    let active = document.activeElement as HTMLInputElement | HTMLLabelElement;
    if (active && active.form) {
        var focussable = Array.prototype.filter.call(active.form.querySelectorAll(focussableElements),
        function (element: HTMLElement) {
            //check for visibility while always include the current activeElement 
            return element.offsetWidth > 0 || element.offsetHeight > 0 || element === active
        });
        var index = focussable.indexOf(active);
        if(index > -1) {
           var nextElement = focussable[index + 1] || focussable[0];
           nextElement.focus();
        }                    
    }
}