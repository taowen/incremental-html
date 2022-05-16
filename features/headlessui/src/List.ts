import { Feature } from "@incremental-html/reactivity";

class ListLoader extends Feature<{}> {
}

export class List extends Feature<{}> {
    public static Loader = ListLoader
}