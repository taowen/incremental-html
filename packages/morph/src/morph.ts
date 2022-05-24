let morphing = false;

export function morph(node: Element, cb: () => void) {
    const topLevel = !morphing;
    if (topLevel) {
        morphing = true;
        node.dispatchEvent(new Event('beforeMorph'));
    }
    try {
        cb();
    } finally {
        if (topLevel) {
            morphing = false;
            node.dispatchEvent(new Event('afterMorph'));
        }
    }
}