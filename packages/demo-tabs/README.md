# add behavior to server generated html

https://headlessui.dev/ demonstrated how to reuse component behavior without reusing its style.
What if we can borrow the same idea to make server generated html "reactive"?

## Step1: import feature

We need import reusable headless component first

```ts
import { startDomObserver } from '@incremental-html/reactivity';
import { Tab } from '@incremental-html/headlessui';
window.$Tab = Tab;
startDomObserver();
```

startDomObserver() works like React render(), it makes the dom reactive.
Tab component is injected globally as $Tab so we can reference it later.

## Step2: tab group

```html
<div use:tab-group="$Tab.Group" tab-group:selected-index="1" class="w-full max-w-md px-2 py-16 sm:px-0">
```

startDomObserver will scan all dom nodes, and process `use:xxx`. The html above will execute

```ts
// this refers to the <div> element
this.tabGroup = new $Tab.Group({ element: this, selectedIndex: 1 })
```

## Step3: tab

```html
<button use:tab="$Tab" bind:class.selection="this.tab.selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'"
    class="w-full py-2.5 text-sm leading-5 font-medium text-blue-700 rounded-lg focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60"
    id="headlessui-tabs-tab-1" type="button" aria-selected="true" tabindex="0"
    aria-controls="headlessui-tabs-panel-4">Recent</button>
```

The html above will execute

```ts
// this refers to the <button> element
this.tab = new $Tab({ element: this })
```

It also has a `bind:class.selection` to reactively bind part of the class name to `this.tab.selected`. 
The `class.selection` will be appended to the final `class`.

## Under the hood

Instead of using react context to pass Tab.Group to Tab, we use the native DOM api.

```ts
export class Tab {

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

export function featureOf<T>(element: Element, featureClass: { new(props: any): T }): T | undefined {
    const featureElement = element.closest(`[use\\:${hyphenate(featureClass.name)}]`);
    if (featureElement) {
        const featureName = featureClass.name.charAt(0).toLowerCase() + featureClass.name.slice(1);
        return (featureElement as any)[featureName]
    }
    return undefined;
}
```

using `element.closet` we can find a feature from the context.

```ts
import { reactive } from '@vue/reactivity';

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
```

reactivity is powered by `@vue/reactivity`, when reading `this.tab.selected` it will subscribe to the reactive state.

```ts
import { effect } from '@vue/reactivity';

effect(() => {
    refreshNode(node);
})
```

`@vue/reactivity` will trigger effect, if `this.tab.selected` changed.