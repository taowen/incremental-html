import { featureOf, reactive } from '@incremental-html/reactivity';

export class TabGroup {
    private tabs: Tab[] = [];
    public store: { selectedIndex: number };
    constructor(props: { element: Element, selectedIndex?: number }) {
        this.store = reactive({ selectedIndex: props.selectedIndex || 0 });
    }

    public registerTab(tab: Tab) {
        const index = this.tabs.length;
        this.tabs.push(tab);
        return index;
    }
}

export class TabList {
    constructor(props: { element: Element, vertical?: boolean }) {
        props.element.setAttribute('role', 'tablist');
        props.element.setAttribute('aria-orientation', props.vertical ? 'vertical' : 'horizontal');
    }
}

export class Tab {
    private index: number;
    private tabGroup: TabGroup;
    constructor(private props: { element: Element }) {
        props.element.setAttribute('role', 'tab');
        props.element.addEventListener('click', this.onClick.bind(this));
        const tabGroup = featureOf(props.element, TabGroup);
        if (!tabGroup) {
            throw new Error('use:tab requires use:tabGroup in its ancestor element');
        }
        this.tabGroup = tabGroup;
        this.index = tabGroup.registerTab(this);
    }

    public get selected() {
        return this.tabGroup.store.selectedIndex === this.index;
    }

    public onClick() {
        this.tabGroup.store.selectedIndex = this.index;
    }
}