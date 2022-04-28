import { effect, Feature, queryFeature, reactive } from '@incremental-html/reactivity';

export class TabGroup extends Feature<{ selectedIndex?: number }> {
    private tabs: Tab[] = [];
    private panels: TabPanel[] = [];
    public store = reactive({ selectedIndex: this.props.selectedIndex || 0 });

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

export class TabList extends Feature<{ vertical?: boolean }> {
    private _ = effect(() => {
        this.element.setAttribute('role', 'tablist');
        this.element.setAttribute('aria-orientation', this.props.vertical ? 'vertical' : 'horizontal');
    })
}

export class TabPanel extends Feature<{}> {
    private _ = effect(() => {
        this.element.setAttribute('role', 'tabpanel');
        this.element.setAttribute('bind:style.display', "this.tabPanel.selected ? 'block' : 'none'");
    })
    private index = this.tabGroup.registerPanel(this);
    private get tabGroup() {
        const tabGroup = queryFeature(this.element, TabGroup);
        if (!tabGroup) {
            throw new Error('use:tab-panel requires use:tab-group in its ancestor element');
        }
        return tabGroup;
    };
    public get selected() {
        return this.tabGroup.store.selectedIndex === this.index;
    }
}

export class Tab extends Feature<{}> {
    public static Group = TabGroup;
    public static List = TabList;
    public static Panel = TabPanel;

    private _ = this.effect(() => {
        this.element.setAttribute('role', 'tab');
    });
    private index = this.tabGroup.registerTab(this);
    private get tabGroup() {
        const tabGroup = queryFeature(this.element, TabGroup);
        if (!tabGroup) {
            throw new Error('use:tab-panel requires use:tab-group in its ancestor element');
        }
        return tabGroup;
    };
    public get selected() {
        return this.tabGroup.store.selectedIndex === this.index;
    }
    public onClick = this.on('click', () => {
        this.tabGroup.store.selectedIndex = this.index;
    })
}