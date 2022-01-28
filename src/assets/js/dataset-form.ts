document.addEventListener("DOMContentLoaded", () => {
    // hide and show template based on type selection
    const type = document.querySelector<HTMLSelectElement>("#type");
    const template = document.querySelector<HTMLTextAreaElement>("#template");
    if (!type || !template) {
        return;
    }

    const showTemplate = () => {
        if (type.value.match(/text/i)) {
            template.classList.remove("hidden");
        } else {
            template.classList.add("hidden");
        }
    };

    type.addEventListener("change", showTemplate);
    showTemplate();
});
