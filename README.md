# incremental-html

Argument HTML with iOS like layout animation and gestures, deliver modern user experience with traditional monolith web server.

> As more and more people come to realize that the chase for microservices ended in a blind alley, the pendulum is going to swing back. The Majestic Monolith is here waiting for [microservice refugees](https://www.youtube.com/watch?v=y8OnoxKotPQ). And The Citadel is there to give peace of mind that the pattern will stretch, if they ever do hit that jackpot of becoming a mega-scale app.
> https://m.signalvnoise.com/the-majestic-monolith-can-become-the-citadel/

Inspired by [[html over the wire]](https://hotwired.dev/) and various [similar previous efforts](https://github.com/taowen/awesome-html), incremental-html adds declarative inline javascript to your server generated HTML. You do not need to write a lot of javascript, it is more like declarative annotation of data binding. The web page will be as performant, as reactive, as React built app. Checkout the demos -->

## interaction styles

incremental-html provides out-of-box support of following interactions

interact with server

* [ ] load server generated page without waiting in blank state for too long, load as much as possible within a time budget, defer unfinished loading to second roundtrip
* [ ] show loading indicator to allow other areas to show before everything ready, but not too many indicators
* [ ] show error in area, instead of make whole page unusable
* [ ] show result of my action without whole page refresh, keep uncommited edit state in other area
* [ ] if button click takes some time, show a processing indicator on the button to prevent user clicking twice
* [ ] if server processing takes time, client may optimistically update before server confirm
* [ ] use infinite scroll to load more
* [ ] preload next page, show progress, save the waiting time after switching
* [ ] multiple concurrent actions, end up with a consistent final state
* [ ] go back to previous page without reload waiting

form 

* [ ] show feedback while typing, save extra click
* [ ] show search results while typing, save extra click
* [ ] show error next to the input
* [ ] avoid multi page form, prefer minimal data entry initially, grow the form gradually as user provided more information
* [ ] perserve unsaved form in browser 

common pan gestures and animation

* [ ] [Scroll] use pull down to refresh
* [ ] [SwipeActions] use swipe to show/hide more actions
* [ ] [SwipeSlide] use swipe to select prev/next item, like powerpoint slide
* [ ] [SwipePick] use swipe to select nearest selectable item on pointer release
* [ ] [Reorder] use drag and drop to re-order item in a list
* [ ] [Relocate] use drag and drap to re-locate item to different group
* [ ] [ConnectedPath] continuously keep path visually connected to items at one/both ends while dragging
* [ ] show current and next page side by side with transition animation, if no loading required
* [ ] use FLIP layout animation to avoid content suddenly appear/disappear

common javascript based layout

* [ ] use half screen dialog to replace page jumping, use inline editing to replace modal dialog, avoid jumping around if possible
* [ ] render big page with many dom nodes, showing only the porition in viewport
* [ ] use masonry to layout double columns, use screen space more efficiently
