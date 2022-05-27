import * as quicklink from 'quicklink';
window.addEventListener('load', () => {
  quicklink.listen();
});

window.addEventListener( "pageshow", function ( event ) {
    console.log('page show', event, performance.getEntriesByType("navigation"));
  });