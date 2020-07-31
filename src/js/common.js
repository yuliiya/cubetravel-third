jQuery( document ).ready( function($) {

  var tooSmall = false;
  var controller = null;
  var maxWidth = 1100; // or whatever your max width is

  if( $(window).width() < maxWidth ) {
    tooSmall = true;
  }

  function initScrollMagic() {
    $('body').scrollTop( 0 );
    controller = new ScrollMagic.Controller();
    // add your ScrollMagic scene goodness here

    new ScrollMagic.Scene({triggerElement: "#trigger1", duration: 700, offset: 0})
      .setPin("#pin1")
      .addTo(controller);

    new ScrollMagic.Scene({triggerElement: "#trigger2", duration: 300, })
      .setPin("#pin2")
      .addTo(controller);

    new ScrollMagic.Scene({triggerElement: "#trigger2", duration: 300, })
      .setPin("#pin4")
      .addTo(controller);

    new ScrollMagic.Scene({triggerElement: "#trigger3", duration: 700, offset: 0})
      .setPin("#pin3")
      .addTo(controller);
  }

  if( !tooSmall ) {
    initScrollMagic();
  }

  // part of the problem is that window resizes can trigger multiple times as the events fire rapidly
  // this solution prevents the controller from being initialized/destroyed more than once
  $(window).resize( function() {
    var wWidth = $(window).width();
    if( wWidth < maxWidth ) {
      if( controller !== null && controller !== undefined ) {
        // completely destroy the controller
        controller = controller.destroy( true );
        // if needed, use jQuery to manually remove styles added to DOM elements by GSAP etc. here
      }
    } else if( wWidth >= maxWidth ) {
      if( controller === null || controller === undefined ) {
        // reinitialize ScrollMagic only if it is not already initialized
        initScrollMagic();
      }
    }
  });

});