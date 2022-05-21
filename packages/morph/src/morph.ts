export function morph(node: Element, cb: () => void) {
    node.dispatchEvent(new Event('beforeMorph'));
    try {
        cb();
    } finally {
        node.dispatchEvent(new Event('afterMorph'));
    }
}