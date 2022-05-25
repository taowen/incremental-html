import { computed, ref } from "@vue/reactivity";
import { Feature, closestFeature } from "../Feature";

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

test('new feature will invalidate closestFeature cache', () => {
    class MyFeature extends Feature<{}> {
    }
    const div = document.createElement('div');
    const cache = computed(() => closestFeature(div, MyFeature));
    expect(cache.value).toBeUndefined();
    const feature = new MyFeature(div, 'my:')
    expect(cache.value).toBe(feature);
})