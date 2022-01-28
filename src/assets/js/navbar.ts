document.addEventListener('DOMContentLoaded', () => {
    // Get all "navbar-burger" elements
    let burgers = document.querySelectorAll('.navbar-burger');
    burgers.forEach( burger => {
        burger.addEventListener('click', () => {
            let menus = document.querySelectorAll('.navbar-menu');
            menus.forEach( menu => menu.classList.toggle( 'is-active' ) );
            burger.classList.toggle( 'is-active' );
        })
    });
});