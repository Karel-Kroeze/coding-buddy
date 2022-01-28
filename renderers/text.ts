import { render } from "mustache";

declare global {
    const template: string;
    const artifact: any;
}

document.addEventListener("DOMContentLoaded", () => {
    const target = document.querySelector<HTMLDivElement>("#artifact");
    const rendered = render(template, artifact.content);
    console.log({
        target,
        template,
        artifact,
        content: artifact.content,
        rendered,
    });
    target.innerHTML = rendered;
});
