import {
    Network,
    DataSet,
    IdType,
    Node,
    Edge,
    NodeOptions,
    EdgeOptions,
    Position,
} from "vis";
import { visOptions } from "./visOptions";
declare const artifact: any;
const shadow = {
    enabled: true,
    color: "rgb(99, 234, 255)",
    size: 5,
    x: 0,
    y: 0,
};
const highlightNode: NodeOptions = {
    shadow,
    color: {
        border: "rgb(99, 234, 255)",
    },
    borderWidth: 2,
};
const highlightEdge: EdgeOptions = {
    shadow,
    color: {
        color: "rgb(99, 234, 255)",
        highlight: "rgb(99, 234, 255)",
    },
    width: 2,
};

async function createNetwork(
    map: any,
    target: HTMLElement
): Promise<{ network: Network; nodes: DataSet<Node>; edges: DataSet<Edge> }> {
    let nodes = await new DataSet<Node>(map.nodes);
    let edges = await new DataSet<Edge>(map.edges);
    return {
        nodes,
        edges,
        network: await new Network(target, { nodes, edges }, visOptions),
    };
}

function createFeedback(hint: any, parent: HTMLElement, network: Network) {
    let feedback = document
        .createRange()
        .createContextualFragment(feedbackTemplate);
    parent.appendChild(feedback);

    let hintTarget: HTMLElement = parent.querySelector("#hint-target");

    SetFeedbackContent(hintTarget, hint);

    // update position after (re)drawing (read; dragging).
    network.on("afterDrawing", () => {
        SetFeedbackPosition(
            hint,
            hintTarget,
            parent,
            GetFeedbackPosition(hint, network, parent, hintTarget),
            GetOffset(hint),
            true
        );
    });

    // cheat, and let the position update every .5s
    setInterval(
        () =>
            SetFeedbackPosition(
                hint,
                hintTarget,
                parent,
                GetFeedbackPosition(hint, network, parent, hintTarget),
                GetOffset(hint),
                true
            ),
        500
    );

    // init (doesn't always work, hence the cheat)
    SetFeedbackPosition(
        hint,
        hintTarget,
        parent,
        GetFeedbackPosition(hint, network, parent, hintTarget),
        GetOffset(hint),
        true
    );
    console.log({
        hint,
        pos: GetFeedbackPosition(hint, network, parent, hintTarget),
        offset: GetOffset(hint),
    });

    GetNodes(hint, network).forEach((nodeId: IdType) => {
        let node = network.body.nodes[nodeId];
        node.setOptions(highlightNode);
    });
    let edge = GetEdge(hint, network);
    if (edge) edge.setOptions(highlightEdge);

    // add fader
    document.addEventListener("keydown", (event) => {
        if (event.key == "Shift") {
            hintTarget.style.opacity = "0.2";
        }
    });
    document.addEventListener("keyup", (event) => {
        if (event.key == "Shift") {
            hintTarget.style.opacity = "1.0";
        }
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    let target = document.getElementById("artifact");
    console.log("Feedback.ts version 1.1");

    if (target) {
        let beforeContainer = document.createElement("div");
        beforeContainer.classList.add("before");
        target.append(beforeContainer);
        let before = await createNetwork(
            artifact.content.before.content,
            beforeContainer
        );
        await createFeedback(
            artifact.content.hint,
            beforeContainer,
            before.network
        );

        if (artifact.content.after) {
            let afterContainer = document.createElement("div");
            afterContainer.classList.add("after", "hidden");

            let selector = document
                .createRange()
                .createContextualFragment(selectorTemplate);
            let buttonAfter = selector.querySelector(
                "#buttonAfter"
            ) as HTMLButtonElement;
            let buttonBefore = selector.querySelector(
                "#buttonBefore"
            ) as HTMLButtonElement;
            target.append(afterContainer, selector);

            let after = await createNetwork(
                artifact.content.after.content,
                afterContainer
            );

            const toggleAfter = () => {
                beforeContainer.classList.add("hidden");
                afterContainer.classList.remove("hidden");
                buttonBefore.disabled = false;
                buttonAfter.disabled = true;
                after.network.fit();
                console.log("switch:after");
            };
            buttonAfter.onclick = toggleAfter;

            const toggleBefore = () => {
                beforeContainer.classList.remove("hidden");
                afterContainer.classList.add("hidden");
                buttonBefore.disabled = true;
                buttonAfter.disabled = false;
                before.network.fit();
                console.log("switch:before");
            };
            buttonBefore.onclick = toggleBefore;

            document.addEventListener("keydown", (event) => {
                console.log(`Keydown: "${event.key}"`);
                if (event.key == "ArrowLeft" || event.key == "b") {
                    event.preventDefault();
                    toggleBefore();
                }
                if (event.key == "ArrowRight" || event.key == "a") {
                    event.preventDefault();
                    toggleAfter();
                }

                if (event.key == "Control") {
                    toggleAfter();
                }
            });
            document.addEventListener("keyup", (event) => {
                if (event.key == "Control") {
                    toggleBefore();
                }
            });
        }
    } else throw new Error("artifact element not found");
});

function GetRelativePosition(element: Element, parent: Element) {
    let parentRect = parent.getBoundingClientRect();
    let elementRect = element.getBoundingClientRect();
    return {
        x: elementRect.left - parentRect.left,
        y: elementRect.top - parentRect.top,
    };
}

function GetSize(element: Element) {
    let elementRect = element.getBoundingClientRect();
    return {
        x: elementRect.width,
        y: elementRect.height,
    };
}

const AVATAR = {
    target: {
        src: "/assets/img/avatars/FemaleCTarget.png",
        offset: { x: -115, y: -65 },
    },
    explain: {
        src: "/assets/img/avatars/FemaleCExplain.png",
        offset: { x: 0, y: 0 },
    },
    good: {
        src: "/assets/img/avatars/FemaleCGood.png",
        offset: { x: 0, y: 0 },
    },
};

function GetEdge(hint: any, network: Network): Edge {
    if (hint.element_type === "edge")
        return network.body.edges[hint.element_id];
}

function GetNodes(hint: any, network: Network): IdType[] {
    if (hint.element_type === "node") {
        return [hint.element_id];
    }
    if (hint.element_type === "edge") {
        return network.getConnectedNodes(hint.element_id) as IdType[];
    }
    if (hint.element_type == "missing_edge") {
        return [hint.source, hint.target];
    }
    return [];
}

function GetFeedbackPosition(
    hint: any,
    network: Network,
    networkElement: HTMLElement,
    feedbackElement: HTMLElement
): { x: number; y: number } {
    let nodes = GetNodes(hint, network);
    if (nodes.length > 0) {
        let positions = network.getPositions(nodes);
        let position = { x: 0, y: 0 };
        let nodeCount = 0;
        for (let node in positions) {
            position.x += positions[node].x;
            position.y += positions[node].y;
            nodeCount++;
        }
        position.x /= nodeCount;
        position.y /= nodeCount;
        return network.canvasToDOM(position);
    } else {
        let nwPos = networkElement.getBoundingClientRect();
        let fbPos = feedbackElement.getBoundingClientRect();
        console.log({ nwPos, fbPos });
        return {
            x: nwPos.right - fbPos.width,
            y: nwPos.bottom - fbPos.height,
        };
    }
}

const MARGIN = 5;
function SetFeedbackPosition(
    hint,
    element: HTMLElement,
    parent: HTMLElement,
    position: Position,
    offset: Position,
    inbounds = true
) {
    // relative position of vis canvas vs. window
    switch (hint.element_type) {
        case "edge":
        case "node":
        case "missing_edge":
            let message = GetSize(element.querySelector(".hint-message"));
            let relative = GetRelativePosition(parent, document.body);
            let scroll = window.pageYOffset;

            let target = {
                x: position.x + offset.x + relative.x,
                y: position.y + offset.y + relative.y - message.y - scroll,
            };
            element.style.left = target.x + "px";
            element.style.top = target.y + "px";
            break;
        default:
            // let dot = ( document.querySelector( "#dot" ) as HTMLElement);
            // dot.style.left = position + "px";
            // dot.style.top = position + "px";
            // dot.style.zIndex = "500";
            element.style.left = position.x + "px";
            element.style.top = position.y + "px";
            break;
    }
}

function SetFeedbackContent(target: HTMLElement, hint: any) {
    // update message
    target.querySelector(".hint-message-text").innerHTML = hint.message;
    target.querySelector("#hint-id").innerHTML = hint.id;

    // update image
    let _avatar: any;
    switch (hint.element_type) {
        case "edge":
        case "node":
        case "missing_edge":
            _avatar = AVATAR.target;
            break;
        default:
            _avatar = AVATAR.explain;
            break;
    }
    (<HTMLImageElement>target.querySelector(".hint-image")).src = _avatar.src;

    updateHintButtons(target, hint);
}

function updateHintButtons(target: HTMLElement, hint: any) {
    // remove current buttons
    const responsesElement = target.querySelector("#hint-buttons");
    responsesElement.innerHTML = "";

    // add new set of buttons
    for (const response of hint.responses) {
        responsesElement.append(
            createResponseActionButton(
                response,
                hint.response.message == response.message
            )
        );
    }
}

function createResponseActionButton(response: any, chosen: boolean) {
    if (!response) {
        return;
    }

    const button = document.createElement("template");
    button.innerHTML = `<a href="#" class="btn btn-success btn-block">${response.message}</a>`;

    return button;
}

function GetOffset(hint: any) {
    switch (hint.element_type) {
        case "edge":
        case "node":
        case "missing_edge":
            return AVATAR.target.offset;
        default:
            return AVATAR.explain.offset;
    }
}

let feedbackTemplate = `<link rel="stylesheet" href="/assets/style/feedback.css">
    <!-- <div id="dot" style="position: absolute; background: red; width: 10px; height: 10px; border-radius: 5px"></div> -->
    <div id="hint-target" class="overlay">
        <div class="hint-message">
            <div id="dismiss-button"></div>
            <div class="hint-message-text">This is a hint. Do you think it's any good?</div>
            <span id="hint-id" class="hint-id tag"></span>
            <div id="hint-buttons"></div>
        </div>
        <img class="hint-image" src=""/>
    </div>`;

let selectorTemplate = `<div class="selector columns is-centered">
    <div class="column is-narrow">
        <button class="button is-info" id="buttonBefore" disabled>Before</button>
        <button class="button is-info" id="buttonAfter">After</button>
    </div></div>`;
