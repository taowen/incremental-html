let morphing: Promise<void>[] | undefined;

export function morph(element: Element, cb: () => void) {
    const topLevel = !morphing;
    if (topLevel) {
        morphing = [];
        element.dispatchEvent(new Event('beforeMorph'));
    }
    try {
        cb();
    } finally {
        if (topLevel) {
            postMorph(element, morphing!);
            morphing = undefined;
        }
    }
}

async function postMorph(element: Element, morphingProgress: Promise<void>[]) {
    await Promise.all(morphingProgress);
    element.dispatchEvent(new Event('afterMorph'));
}

export function getMorphingProgress() {
    return morphing;
}