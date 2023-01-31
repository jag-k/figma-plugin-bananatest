type SelectedNode = FrameNode | InstanceNode;
type AllSelectedNode = TextNode | SelectedNode;

figma.showUI(__html__, {
    title: "Banana test 🍌",
    width: 380,
    height: 342,
    themeColors: true,
});

const post = (type: string, data: any) => {
    figma.ui.postMessage({type, data})
}

const selection = (nodes?: SceneNode[]): AllSelectedNode[] => {
    const findNodes = nodes || figma.currentPage.selection;
    const filterList = ["FRAME", "TEXT", "INSTANCE"];
    const result = findNodes.filter(a => filterList.indexOf(a.type) !== -1);
    return result as AllSelectedNode[];
}

const findTextNodes = (nodes?: AllSelectedNode[]): TextNode[] => {
    const result: TextNode[] = [];

    const findNodes = nodes || selection();

    for (const node of findNodes) {
        if (node.type === "TEXT") {
            result.push(node);
        } else {
            result.push(...node.findAll(c => c.type === "TEXT") as TextNode[]);
        }
    }
    return result
}

const selectionStatus = () => {
    const count = selection().length;
    const textNodesCount = findTextNodes().length;
    post('change-selection', {count, textNodesCount});
}

selectionStatus();
figma.on("selectionchange", selectionStatus);

figma.ui.onmessage = async ({type: msgType, data}) => {
    switch (msgType) {
        case 'submit-form': {
            const {text, "copy-nodes": copyNodes, "safe-numbers": safeNumbers} = data;
            const copy = copyNodes === "on";
            const previousSelection = [...figma.currentPage.selection];

            const nodes: AllSelectedNode[] = copy
                ? selection().map(n => n.clone())
                : selection();

            figma.currentPage.selection = nodes;

            let textNodes: TextNode[] = findTextNodes(nodes);
            if (safeNumbers === "on") {
                textNodes = textNodes.filter(node => !/\d/.test(node.characters));
            }


            if (copy) nodes.map(n => n.x += n.width + 50);

            // Load fonts
            const fonts: { [key: string]: Set<string> } = {};
            textNodes.map(
                node => {
                    node.getRangeAllFontNames(0, node.characters.length).map(f => {
                        if (!fonts[f.family]) {
                            fonts[f.family] = new Set();
                        }
                        fonts[f.family].add(f.style)
                    })
                }
            )
            const loadFonts = [];
            for (const family of Object.keys(fonts)) {
                for (const style of Array.from(fonts[family])) {
                    loadFonts.push(figma.loadFontAsync({family, style}));
                }
            }
            await Promise.all(loadFonts);

            // Change text
            for (const node of textNodes) {
                node.autoRename = false;
                node.characters = text;
            }

            console.log(figma.notify(
                `Changed ${textNodes.length} text nodes!`,
                {
                    timeout: 10000,
                    button: {
                        text: "Cancel",
                        action() {
                            figma.triggerUndo();
                            figma.currentPage.selection = previousSelection;
                        }
                    }
                }
            ));
            figma.viewport.scrollAndZoomIntoView(nodes);
            figma.ui.hide();
        }
    }
};

