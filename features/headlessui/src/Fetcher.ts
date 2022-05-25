import { Feature, reactive } from "@incremental-html/reactivity";

export class Fetcher extends Feature<{}> {
    private state = reactive({
        error: null as any,
        isSubmitting: false,
        submission: null as any
    })

    public get error() {
        return this.state.error;
    }

    public get isSubmitting() {
        return this.state.isSubmitting;
    }

    public get submission() {
        return this.state.submission;
    }

    public async submit(input?: RequestInfo, init?: RequestInit) {
        try {
            this.state.error = null;
            this.state.isSubmitting = true;
            if (!input) {
                input = this.form.action;
            }
            if (!init) {
                init = {
                    method: this.form.method,
                    body: new URLSearchParams(new FormData(this.form) as any)
                }
            }
            this.state.submission = init.body;
            const resp = await fetch(input, init);
            if (resp.status === 422) {
                const { errorMessage, formErrors } = await resp.json();
                for (const [k, v] of Object.entries(formErrors)) {
                    const input = this.form.querySelector(`[name="${k}"]`);
                    if (input) {
                        input.setAttribute('error', v as string);
                    }
                }
                this.state.error = errorMessage;
                throw new Error('validation failed: ' + errorMessage);
            } else if (!resp.ok) {
                this.state.error = resp.statusText;
                throw new Error('server returned status code: ' + resp.status);
            }
            return resp;
        } finally {
            this.state.isSubmitting = false;
        }
    }

    private get form() {
        if (this.element.tagName !== 'FORM') {
            throw new Error('use:fetcher need to applied to <form/> to submit without arguments');
        }
        return this.element as HTMLFormElement;
    }
}