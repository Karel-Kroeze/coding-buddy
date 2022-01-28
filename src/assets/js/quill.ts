document.addEventListener("DOMContentLoaded", () => {
    const options: Summernote.Options = {
        height: 100,
        toolbar: [
            // [groupName, [list of button]]
            ["style", ["bold", "italic", "underline", "clear"]],
            ["font", ["superscript", "subscript"]],
            ["color", ["color"]],
            ["para", ["ul", "ol"]],
            ["insert", ["link", "picture", "video"]],
        ],
    };
    $<HTMLTextAreaElement>("textarea.editor").summernote(options);
});
