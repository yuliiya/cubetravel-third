$(function() {

  var controller = new ScrollMagic.Controller();

  new ScrollMagic.Scene({triggerElement: "#trigger1", duration: 700, offset: 0})
    .setPin("#pin1")
    .addTo(controller);

  new ScrollMagic.Scene({triggerElement: "#trigger2", duration: 300, })
    .setPin("#pin2")
    .addTo(controller);

  new ScrollMagic.Scene({triggerElement: "#trigger3", duration: 700, offset: 0})
    .setPin("#pin3")
    .addTo(controller);

});