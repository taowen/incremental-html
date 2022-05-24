import { effect, Feature, queryFeature, reactive, scheduleChange, unmountElement } from '@incremental-html/reactivity';
import { render } from '@incremental-html/template';

export class TabGroup extends Feature<{ selectedIndex?: number }> {
    private tabs: Tab[] = [];
    private panels: TabPanel[] = [];
    public unmounting: Promise<void>[] = [];
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
    private currentElement: Element = this.create(() => {
        const newElement = document.createElement('div');
        this.element.parentNode!.replaceChild(newElement, this.element);
        return newElement;
    });
    private template = this.create(() => {
        const cloned = this.element.cloneNode(true) as Element;
        cloned.removeAttribute('use:tab-panel');
        cloned.setAttribute('role', 'tabpanel');
        cloned.setAttribute('render:style.display', "this.$props.selected ? 'block' : 'none'");
        const template = document.createElement('template');
        template.content.appendChild(cloned);
        return template;
    })
    private index = this.tabGroup.registerPanel(this);
    private get tabGroup() {
        const tabGroup = queryFeature(this.currentElement, TabGroup);
        if (!tabGroup) {
            throw new Error('use:tab-panel requires use:tab-group in its ancestor element');
        }
        return tabGroup;
    };
    public get selected() {
        return this.tabGroup.store.selectedIndex === this.index;
    }
    private _ = this.effect(() => {
        this.showNewElement(this.selected, this.tabGroup);
    });
    private async showNewElement(selected: boolean, tabGroup: TabGroup) {
        let newElement = render(this.template, { selected })[0] as Element || document.createElement('div');
        if (selected) {
            await new Promise(resolve => setTimeout(resolve, 0));
            const unmounting = Promise.all([...tabGroup.unmounting]);
            tabGroup.unmounting.length = 0;
            await unmounting;
        } else {
            const promise = unmountElement(this.currentElement);
            if (promise) {
                tabGroup.unmounting.push(promise);
                await promise;
            }
        }
        this.currentElement.parentNode!.replaceChild(newElement, this.currentElement);
        this.currentElement = newElement;
    }
}

export class Tab extends Feature<{}> {
    public static Group = TabGroup;
    public static List = TabList;
    public static Panel = TabPanel;

    private template = this.create(() => {
        this.element.setAttribute('role', 'tab');
        const template = document.createElement('template');
        template.content.appendChild(this.element.cloneNode(true));
        return template;
    })
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
    private _ = this.effect(() => {
        const newElement = render(this.template, { selected: this.selected })[0] as Element;
        scheduleChange(this.element, 'attributes', newElement);
        scheduleChange(this.element, 'childNodes', newElement);
    });
    public onClick = this.on('click', () => {
        this.tabGroup.store.selectedIndex = this.index;
    })
}