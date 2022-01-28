document.addEventListener('DOMContentLoaded', () => {
    // Get all "message" elements, and add a delete binding and time-out
    let messages = document.querySelectorAll('.flash-message');
    let delay = 5000;
    let delayStep = 250;
    messages.forEach( message => {
        let deleteButton = message.querySelector(".delete");
        deleteButton!.addEventListener('click', () => fade( message ) );
        fade( message, delay );

        // make multiple messages at the same time fade out in a waterfall effect.
        delay += delayStep;
    });
});

function fade( element: Element, timeout: number = 0 ): void {
    window.setTimeout(() => {
        element.classList.add("fade");
        window.setTimeout(() => {
            element.classList.add("hidden");
        }, 1000 );
    }, timeout );
}