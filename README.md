# incremental-html

Render in server side, using html as "virtual DOM" to update ui incrementally. The goal is making client side logic minimal so that we can release new version without update client, and we can implement native clients (Android, iOS, miniprogram) with similar web development experience and reusing server code between them.

Inspired by https://hotwired.dev/ like [previous effort](https://github.com/taowen/awesome-html), incremental-html try to avoid re-inventing javascript, and try to be declaractive. The API to remember should be minimal, normal javascript programming as we are familiar with should be encouraged (compared to programming by turbo-stream/htmx action).

## interaction styles

incremental-html want to enable following interaction styles

* [ ] load server generated page without waiting in blank state for too long, load as much as possible within a time budget, defer unfinished loading to second roundtrip
* [ ] show loading indicator to allow other areas to show before everything ready, but not too many indicators
* [ ] show error in area, instead of make whole page unusable
* [ ] show result of my action without whole page refresh, keep uncommited edit state in other area
* [ ] show feedback while typing, save extra click
* [ ] show search results while typing, save extra click
* [ ] if button click takes some time, show a processing indicator on the button to prevent user clicking twice
* [ ] if server processing takes time, client may optimistically update before server confirm
* [ ] show error next to the input
* [ ] avoid multi page form, prefer minimal data entry initially, grow the form gradually as user provided more information
* [ ] use infinite scroll to load more
* [ ] use pull down to refresh
* [ ] use swipe to show/hide more actions
* [ ] use drag and drop to re-order items
* [ ] use drag and drop to connect relationship
* [ ] use half screen dialog to replace page jumping, use inline editing to replace modal dialog, avoid jumping around if possible
* [ ] use mansonry to layout double columns, use screen space more efficiently
* [ ] use FLIP layout animation to avoid content suddenly appear/disappear
* [ ] preload next page, show progress, save the waiting time after switching
* [ ] show current and next page side by side with transition animation, if no loading required
* [ ] go back to previous page without reload waiting
* [ ] perserve unsaved form in browser 
* [ ] render big page with many dom nodes, showing only the porition in viewport

## reusable libraries

There are several independent libraries to load/reload html without whole page refresh (just like F5, but without trashing client side input and state). When client side code handle some input, it either update the DOM directly somehow (such as showing form validation error), or it will use `@incremental-html/navigator` to refresh latest data from server.

* [web] navigator: update DOM via html diff to reload, go forward or go backward. unlike https://turbo.hotwired.dev/ it is declarative instead of imperative. and navigator does not try to handle form submission.
* [wechat] navigator-wechat: miniprogram version of `@incremental-html/navigator`, implemented in wechat miniprogram wxml language, unlike https://github.com/Tencent/kbone it does not implement a complete DOM/BOM api 
* [server] middleware: navigator will optionally share a page-state object with server to allow server to re-render the whole page with user input data (such as search criteria from a input box). HTTP GET does not allow body content, so we need to come up a protocol to pass user input data to refresh the page. @incremental-html/middleware make page-state available for express/connect user. unlike asp.net view-state, we do not intend to use page-state to handle form submission.
* [server] jsx-to-html: optional tiny library to use jsx as a server side template language, which renders the page within given deadline, fallback to show loading indicator if data loading is too slow.
* server code modification is optional. `@incremental-html/navigator` library can work with any existing server servering html written in any server side language. server modification is required only when additional features (page-state, render deadline) are needed. 

some optional libraries to make client side interaction code mordern and declarative, feels like vue/react, but working directly with real DOM instead of virtual DOM.

* [client] reactivity: a reactive version jquery to make page interactive, built on top of @vue/reactivity. unlike https://stimulus.hotwired.dev/ it is declarative instead of imperative.
* [client] submit-form: the client part of validate-form, submit form-object to server and render validation errors back.
* [server] form-object: read the form-object submitted from client, and send back validation errors. unlike page-state, form-object only exists in one http roundtrip.
* libraries written in language other than javascript will be provided after `@incremental-html/navigator` library ported to more platform (Android, iOS)