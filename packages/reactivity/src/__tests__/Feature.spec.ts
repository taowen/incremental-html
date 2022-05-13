import { computed, ref } from "@vue/reactivity";
import { Feature, queryFeature } from "../Feature";

test('getter should be cached', () => {
    class MyFeature extends Feature<{}> {
        private a = 1;
        get b() {
            return this.a++;
        }
    }
    const feature = new MyFeature(document.createElement('div'), 'my:');
    expect(feature.b).toBe(1);
    expect(feature.b).toBe(1);
})

test('new feature will invalidate queryFeature cache', () => {
    class MyFeature extends Feature<{}> {
    }
    const div = document.createElement('div');
    const cache = computed(() => queryFeature(div, MyFeature));
    expect(cache.value).toBeUndefined();
    const feature = new MyFeature(div, 'my:')
    expect(cache.value).toBe(feature);
})

test('re-run getter should trigger unmount', () => {
    let unmountCounter = 0;
    let trigger = ref(0);
    class MyFeature extends Feature<{}> {
        get b() {
            trigger.value;
            return {
                unmount() {
                    unmountCounter++;
                }
            };
        }
    }
    const feature = new MyFeature(document.createElement('div'), 'my:');
    Reflect.get(feature, 'b');
    expect(unmountCounter).toBe(0);

    trigger.value = 1;

    Reflect.get(feature, 'b');
    expect(unmountCounter).toBe(1);
})

test('getter cache should be unmounted when feature unmount', () => {
    let unmountCounter = 0;
    let trigger = ref(0);
    class MyFeature extends Feature<{}> {
        get b() {
            trigger.value;
            return {
                unmount() {
                    unmountCounter++;
                }
            };
        }
    }
    const feature = new MyFeature(document.createElement('div'), 'my:');
    Reflect.get(feature, 'b');
    expect(unmountCounter).toBe(0);

    feature.unmount();

    expect(unmountCounter).toBe(1);
});