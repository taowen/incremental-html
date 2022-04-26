import { featureOf, reactive } from '@incremental-html/reactivity';

export class TabGroup {
    private tabs: Tab[] = [];
    private panels: TabPanel[] = [];
    public store: { selectedIndex: number };
    constructor(props: { element: Element, selectedIndex?: number }) {
        this.store = reactive({ selectedIndex: props.selectedIndex || 0 });
    }

    public registerTab(tab: Tab) {
        const index = this.tabs.length;
        this.tabs.push(tab);
        return index;
    }

    public registerPanel(panel: TabPanel) {
        const index = this.panels.length;
        this.panels.push(panel);
        return index;
    }
}

export class TabList {
    constructor(props: { element: Element, vertical?: boolean }) {
        props.element.setAttribute('role', 'tablist');
        props.element.setAttribute('aria-orientation', props.vertical ? 'vertical' : 'horizontal');
    }
}

export class TabPanel {
    private index: number;
    private tabGroup: TabGroup;
    constructor(props: { element: Element, vertical?: boolean }) {
        props.element.setAttribute('role', 'tabpanel');
        props.element.setAttribute('bind:style.display', "this.tabPanel.selected ? 'block' : 'none'");
        const tabGroup = featureOf(props.element, TabGroup);
        if (!tabGroup) {
            throw new Error('use:tab-panel requires use:tab-group in its ancestor element');
        }
        this.tabGroup = tabGroup;
        this.index = tabGroup.registerPanel(this);
    }

    public get selected() {
        return this.tabGroup.store.selectedIndex === this.index;
    }
}

export class Tab {
    public static Group = TabGroup;
    public static List = TabList;
    public static Panel = TabPanel;

    private index: number;
    private tabGroup: TabGroup;
    constructor(private props: { element: Element }) {
        props.element.setAttribute('role', 'tab');
        props.element.addEventListener('click', this.onClick.bind(this));
        const tabGroup = featureOf(props.element, TabGroup);
        if (!tabGroup) {
            throw new Error('use:tab requires use:tab-group in its ancestor element');
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