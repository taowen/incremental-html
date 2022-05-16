import { morphAttributes, morphChildNodes } from "@incremental-html/morph";
import { Feature, queryFeature, reactive, Ref } from "@incremental-html/reactivity";

class ListLoader extends Feature<{ url?: string, load?: () => Promise<string> }> {
    private state = reactive({
        isLoading: false,
        loadError: undefined as any
    })
    public get isLoading() {
        return this.state.isLoading;
    }
    public get loadError() {
        return this.state.loadError;
    }
    private _ = this.onMount(() => {
        const intersectionObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                this.load();
            }
        });
        intersectionObserver.observe(this.element);
        return () => {
            intersectionObserver.disconnect();
        }
    });
    private list = queryFeature(this.element, List);
    private async load() {
        if (!this.list) {
            console.error('Can not use List.Loader without List', this.element);
            return;
        }
        try {
            if (this.props.url) {
                this.state.isLoading = true;
                const resp = await fetch(this.props.url);
                const respText = await resp.text();
                this.list.load(respText);
            } else if (this.props.load) {
                this.state.isLoading = true;
                this.list.load(await this.props.load());
            }
        } catch(e) {
            this.state.loadError = e;
        } finally {
            this.state.isLoading = false;
        }
    }
}

class MasonryColumn extends Feature<{}> {
    private items: HTMLElement[] = [];

    public removeItem(item: HTMLElement) {
        const index = this.items.indexOf(item);
        if (index !== -1) {
            this.items.splice(index, 1);
        }
    }

    public addItem(item: HTMLElement, skipAppendChild?: boolean) {
        this.items.push(item);
        if (!skipAppendChild) {
            this.element.appendChild(item);
        }
        (item as any).$cachedHeight = item.getBoundingClientRect().height;
        this.height += (item as any).$cachedHeight;
    }

    public height: number = 0;
}

export class List extends Feature<{ masonryColumns?: number; masonryColumnClass?: string; masonryColumnStyle?: string; virtualized?: boolean }> {
    public static Loader = ListLoader

    // compare with loaded items to know what has been added, what has been removed
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

    private columns = this.create(() => {
        if (!this.props.masonryColumns) {
            return [new MasonryColumn(this.element, () => ({}))];
        }
        this.element.innerHTML = '';
        const columnsCount = this.props.masonryColumns!;
        const columns = [];
        for (let i = 0; i < columnsCount; i++) {
            const columnEl = document.createElement('div');
            columnEl.setAttribute('style', this.props.masonryColumnStyle || '');
            columnEl.className = this.props.masonryColumnClass || '';
            this.element.appendChild(columnEl);
            columns.push(new MasonryColumn(columnEl, () => ({})));
        }
        return columns;
    })

    private _ = this.onMount(() => {
        const skipAppendChild = !this.props.masonryColumns;
        for (const item of this.items) {
            this.onItemAdded(item, skipAppendChild);
        }
    })

    private onItemRemoved(item: HTMLElement) {
        for (const column of this.columns) {
            column.removeItem(item);
        }
        item.parentElement?.removeChild(item);
    }

    private onItemAdded(item: HTMLElement, skipAppendChild?: boolean) {
        let minHeight = this.columns[0].height;
        let pickedColumn = this.columns[0];
        for (const column of this.columns) {
            if (column.height < minHeight) {
                pickedColumn = column;
            }
        }
        pickedColumn.addItem(item, skipAppendChild);
    }

    public async load(respText: string) {
        if (!this.element.id) {
            console.error('List does not have id', this.element);
            return;
        }
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
        let index = this.searchBackwards(newItem);
        if (index === -1) {
            this.items = [newItem, ...this.items];
            index = 0;
            this.onItemAdded(newItem);
        }
        const oldItems = this.items.splice(index + 1, this.items.length - index - 1);
        const oldItemMap = new Map<any, HTMLElement>();
        for (const oldItem of oldItems) {
            if (!oldItem.id) {
                this.onItemRemoved(oldItem);
                continue;
            }
            oldItemMap.set(oldItem.id, oldItem);
        }
        newItem = newItem.nextElementSibling as HTMLElement;
        const newItems = [];
        while (newItem) {
            const oldItem = oldItemMap.get(newItem.id);
            if (oldItem) {
                // reuse oldItem if we can
                morphAttributes(oldItem, newItem);
                morphChildNodes(oldItem, newItem);
                oldItemMap.delete(newItem.id);
                this.items.push(oldItem);
            } else {
                newItems.push(newItem);
                this.items.push(newItem);
            }
            newItem = newItem.nextElementSibling as HTMLElement;
        }
        for (const newItem of newItems) {
            this.onItemAdded(newItem);
        }
        for (const oldItem of oldItemMap.values()) {
            this.onItemRemoved(oldItem);
        }
    }

    private searchBackwards(newItem: HTMLElement): number {
        for (let i = this.items.length - 1; i >= 0; i--) {
            if (this.items[i].id === newItem.id) {
                return i;
            }
        }
        return -1;
    }
}