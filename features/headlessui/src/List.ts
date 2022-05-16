import { morphAttributes, morphChildNodes } from "@incremental-html/morph";
import { Feature, queryFeature } from "@incremental-html/reactivity";

class ListLoader extends Feature<{ url: string }> {
    private _ = this.onMount(() => {
        const intersectionObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                this.load();
            }
        });
        intersectionObserver.observe(this.element);
    });
    private list = queryFeature(this.element, List);
    private async load() {
        if (!this.list) {
            console.error('Can not use List.Loader without List', this.element);
            return;
        }
        this.list.load(this.props.url);
    }
}

export class List extends Feature<{}> {
    public static Loader = ListLoader

    // virtual DOM
    private items = this.create(() => {
        let child = this.element.firstChild;
        const items = [];
        while (child) {
            if (child.nodeType === 1) {
                items.push(child as HTMLElement);
            }
            child = child.nextSibling;
        }
        return items;
    });

    public async load(url: string) {
        if (!this.element.id) {
            console.error('List does not have id', this.element);
            return;
        }
        const resp = await fetch(url);
        const respText = await resp.text();
        const parsed = document.createElement('html');
        parsed.innerHTML = respText;
        const newList = parsed.querySelector('#' + this.element.id);
        if (!newList) {
            console.error(`List #${this.element.id} not found in response`, respText);
            return;
        }
        let newItem = newList.firstElementChild as HTMLElement;
        if (!newItem) {
            console.error(`List #${this.element.id} is empty`, respText);
            return;
        }
        let index = this.insertNewItem(newItem);
        const oldItems = this.items.splice(index + 1, this.items.length - index - 1);
        const oldItemMap = new Map<any, HTMLElement>();
        for (const oldItem of oldItems) {
            oldItemMap.set(oldItem.id, oldItem);
        }
        newItem = newItem.nextElementSibling as HTMLElement;
        while (newItem) {
            const oldItem = oldItemMap.get(newItem.id);
            if (oldItem) {
                morphAttributes(oldItem, newItem);
                morphChildNodes(oldItem, newItem);
                newItem = oldItem;
            }
            this.items.push(newItem);
            newItem = newItem.nextElementSibling as HTMLElement;
        }
        morphChildNodes(this.element, this.items);
    }

    private insertNewItem(newItem: HTMLElement): number {
        for (let i = this.items.length - 1; i >= 0; i--) {
            if (this.items[i].id === newItem.id) {
                return i;
            }
        }
        this.items = [newItem, ...this.items];
        return 0;
    }
}