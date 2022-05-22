import { morphChildNodes } from "@incremental-html/morph";
import { Feature, queryFeature, reactive } from "@incremental-html/reactivity";

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
                intersectionObserver.disconnect();
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
            return;
        }
        try {
            if (this.props.url) {
                this.state.isLoading = true;
                const resp = await fetch(this.props.url);
                const respText = await resp.text();
                this.list.load(this, respText);
            } else if (this.props.load) {
                this.state.isLoading = true;
                this.list.load(this, await this.props.load());
            }
        } catch (e) {
            this.state.loadError = e;
        } finally {
            this.state.isLoading = false;
        }
    }
}

let nextId = 1;

class MasonryColumn extends Feature<{ virtualized: boolean, measureVisibleRange: () => readonly [number, number] }> {
    public readonly items: HTMLElement[] = [];
    private headPlaceholder = this.create(() => {
        const headPlaceholder = document.createElement('div');
        headPlaceholder.id = `head-placeholder-${nextId++}`;
        return headPlaceholder;
    })
    private tailPlaceholder = this.create(() => {
        const tailPlaceholder = document.createElement('div');
        tailPlaceholder.id = `tail-placeholder-${nextId++}`;
        return tailPlaceholder;

    })

    public removeLoader(loader: ListLoader) {
        if (this.items[this.items.length -1] === loader.element) {
            this.items.length -= 1;
        }
    }

    public addItem(item: HTMLElement, skipAppendChild?: boolean) {
        if (!item.id) {
            item.id = `ci-${nextId++}`
        }
        this.items.push(item);
        if (!skipAppendChild) {
            this.element.appendChild(item);
        }
    }

    public compact() {
        const [min, max] = this.props.measureVisibleRange();
        let top = 0;
        let head = 0;
        let tail = 0;
        const inViewItems = [];
        for (const item of this.items) {
            let itemHeight = (item as any).$cachedHeight;
            if (itemHeight === undefined) {
                (item as any).$cachedHeight = itemHeight = item.getBoundingClientRect().height;
            }
            let inView = false;
            if (top > max) {
                tail += itemHeight;
            }
            if (top >= min && top <= max) {
                inView = true;
            }
            top += itemHeight;
            if (top >= min && top <= max) {
                inView = true;
            }
            if (inView) {
                if (inViewItems.length === 0) {
                    head = top - itemHeight;
                }
                inViewItems.push(item);
            }
        }
        this.headPlaceholder.style.minHeight = `${head}px`;
        this.headPlaceholder.style.minWidth = '100%';
        this.tailPlaceholder.style.minHeight = `${tail}px`;
        this.tailPlaceholder.style.minWidth = '100%';
        const refresh = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                refresh.disconnect();
                this.compact();
            }
        });
        if (head > 0) {
            refresh.observe(this.headPlaceholder);
        }
        if (tail > 0) {
            refresh.observe(this.tailPlaceholder);
        }
        morphChildNodes(this.element, [this.headPlaceholder, ...inViewItems, this.tailPlaceholder]);
    }

    public imagesLoaded() {
        const images = this.element.querySelectorAll('img');
        if (images.length === 0) {
            return undefined;
        }
        let promises: Promise<void>[] | undefined;
        for (let i = 0; i < images.length; i++) {
            const image = images.item(i);
            if (image.complete || image.getAttribute('height')) {
                continue;
            }
            if (promises === undefined) {
                promises = [];
            }
            promises.push(new Promise<void>(resolve => image.addEventListener('load', () => {
                resolve()
            })));
        }
        return promises ? Promise.all(promises) : undefined;
    }

    public async calcHeight() {
        await this.imagesLoaded();
        let height = 0;
        for (const item of this.items) {
            if ((item as any).$cachedHeight === undefined) {
                (item as any).$cachedHeight = item.getBoundingClientRect().height;
            }
            height += (item as any).$cachedHeight
        }
        return height;
    }
}

export class List extends Feature<{ masonryColumns?: number; masonryColumnClass?: string; masonryColumnStyle?: string; virtualized?: boolean }> {
    public static Loader = ListLoader

    private initItems = this.create(() => {
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

    private measureVisibleRange = () => {
        const height = this.element.getBoundingClientRect().height;
        let min = this.element.scrollTop - height;
        return [min > 0 ? min : 0, this.element.scrollTop + height + height] as const;
    }

    private columns = this.create(() => {
        if (!this.props.masonryColumns) {
            return [new MasonryColumn(this.element, () => ({ virtualized: !!this.props.virtualized, measureVisibleRange: this.measureVisibleRange }))];
        }
        this.element.innerHTML = '';
        const columnsCount = this.props.masonryColumns!;
        const columns = [];
        for (let i = 0; i < columnsCount; i++) {
            const columnEl = document.createElement('div');
            columnEl.setAttribute('style', this.props.masonryColumnStyle || '');
            columnEl.className = this.props.masonryColumnClass || '';
            this.element.appendChild(columnEl);
            columns.push(new MasonryColumn(columnEl, () => ({ virtualized: !!this.props.virtualized, measureVisibleRange: this.measureVisibleRange  })));
        }
        return columns;
    })

    public get items() {
        return this.columns[0].items;
    }

    private _ = this.onMount(async () => {
        for (const item of this.initItems) {
            await this.addItem(item);
        }
    })

    private async addItem(item: HTMLElement) {
        if (this.columns.length === 1) {
            return this.columns[0].addItem(item, true);
        }
        let minHeight = await this.columns[0].calcHeight();
        let pickedColumn = this.columns[0];
        for (let i = 1; i < this.columns.length; i++) {
            const column = this.columns[i];
            if (await column.calcHeight() < minHeight) {
                pickedColumn = column;
            }
        }
        pickedColumn.addItem(item);
    }

    public async load(loader: ListLoader, respText: string) {
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
        for (const column of this.columns) {
            column.removeLoader(loader);
        }
        loader.element.parentElement!.removeChild(loader.element);
        let newItem = newList.firstElementChild as HTMLElement;
        const newItems = [];
        while (newItem) {
            newItems.push(newItem);
            newItem = newItem.nextElementSibling as HTMLElement;
        }
        for (const newItem of newItems) {
            await this.addItem(newItem);
        }
        for (const column of this.columns) {
            column.compact();
        }
    }
}