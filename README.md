# incremental-html

Render in server side, using html as virtual DOM to update ui incrementally. The goal is making client side logic minimal so that we can release new version without update client, and we can implement native clients (Android, iOS, miniprogram) with similar web development experience and reusing server code between them.

There are several independent libraries to load/reload html without whole page refresh

* [web] navigator: update DOM via html diff to reload, go forward or go backward. unlike https://turbo.hotwired.dev/ it is declarative instead of imperative.
* [wechat] navigator-wechat: miniprogram version of `@incremental-html/navigator`, implemented in wechat miniprogram wxml language, unlike https://github.com/Tencent/kbone it does not implement a complete DOM/BOM api 
* [server] middleware: navigator will optionally share a page-state object with server to allow server to re-render the whole page with user input data (such as search criteria from a input box). HTTP GET does not allow body content, so we need to come up a protocol to pass user input data to refresh the page. @incremental-html/middleware make page-state available for express/connect user. unlike asp.net view-state, we do not intend to use page-state to handle form submission.
* [server] jsx-to-html: optional tiny library to use jsx as a server side template language, which renders the page within given deadline, fallback to show loading indicator if data loading is too slow.
* server code modification is optional. `@incremental-html/navigator` library can work with any existing server servering html written in any server side language. server modification is required only when additional features (page-state, render deadline) are needed. 

some optional libraries to make client side interaction code mordern and declarative, feels like vue/react, but working directly with real DOM instead of virtual DOM.

* [client] reactivity: a reactive version jquery to make page interactive, built on top of @vue/reactivity. unlike https://stimulus.hotwired.dev/ it is declarative instead of imperative.
* [server] validate-form: read the form-object submitted from client, and send back validation errors. unlike page-state, form-object only exists in one http roundtrip.
* [client] submit-form: the client part of validate-form, submit form-object to server and render validation errors back.
* libraries written in language other than javascript will be provided after `@incremental-html/navigator` library ported to more platform (Android, iOS)