// client side entry
import { startObserver, onSubmit } from 'incremental-html';

window.$$ = {
    onSubmit
}
startObserver()