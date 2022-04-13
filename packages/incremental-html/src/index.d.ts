import './jsx';

export declare function startObserver(platformApis: Record<string, any>): void;
declare function jsxToHtml(node: any): Promise<string>;
declare namespace jsxToHtml {
    var createElement: (tag: string, props: Record<string, any>, ...children: any[])=> {
        tag: string;
        props: Record<string, any>;
        children: any[];
    };
    var Fragment: string;
}