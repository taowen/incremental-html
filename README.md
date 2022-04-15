# incremental-html

Render in server side, using html as virtual dom to update ui incrementally, 
leaving client side managed dom state untouched.

There are two client libraries to achieve the common goal

* navigator: update DOM via html diff to reload, go forward or go backward. unlike https://turbo.hotwired.dev/ it is declarative instead of imperative.
* reactivity: a reactive version jquery to make page interactive, built on top of @vue/reactivity. unlike https://stimulus.hotwired.dev/ it is declarative instead of imperative.

