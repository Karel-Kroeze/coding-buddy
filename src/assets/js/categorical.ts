document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".categorical").forEach((categorical) => {
        let addButton = categorical.querySelector(".add-option");
        let template = categorical.querySelector(".option.template");
        let options = categorical.querySelector(".options");

        let removeHandler = (event: Event) => {
            let option = (<Element>event.target).closest(".option");
            if (option) option.remove();
        };

        // remove button for existing options
        categorical.querySelectorAll(".option").forEach((o) => {
            o.querySelectorAll(".remove-option").forEach((b) => {
                b.addEventListener("click", removeHandler);
            });
        });

        // add button
        if (addButton && template && options) {
            addButton.addEventListener("click", () => {
                let option = <Element>template!.cloneNode(true);
                option.classList.remove("hidden", "template");

                // set correct array indexes
                let index = options!.children.length; // 0 is always the template, will be filtered out server side.
                let labelField = option.querySelector(
                    '[name*="label"]'
                ) as HTMLInputElement;
                let descField = option.querySelector(
                    '[name*="desc"]'
                ) as HTMLInputElement;
                labelField.name = `options[${index}][label]`;
                descField.name = `options[${index}][desc]`;

                // add editor
                let textarea = option.querySelector("textarea");
                if (textarea) {
                    try {
                        $<HTMLTextAreaElement>(textarea).summernote({
                            height: 100,
                            toolbar: [
                                // [groupName, [list of button]]
                                [
                                    "style",
                                    ["bold", "italic", "underline", "clear"],
                                ],
                                ["font", ["superscript", "subscript"]],
                                ["color", ["color"]],
                                ["para", ["ul", "ol"]],
                                ["insert", ["link", "picture", "video"]],
                            ],
                        });
                    } catch (err) {
                        console.error(`Attaching editor failed: ${err}`);
                    }
                }

                // add remove button
                option
                    .querySelectorAll(".remove-option")
                    .forEach((b) => b.addEventListener("click", removeHandler));
                options!.appendChild(option);
            });
        }
    });
});
