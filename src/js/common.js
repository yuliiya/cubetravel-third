$(function() {

  var controller = new ScrollMagic.Controller();

  new ScrollMagic.Scene({triggerElement: "#trigger1", duration: 700, offset: 0})
    .setPin("#pin1")
    .addTo(controller);

  new ScrollMagic.Scene({triggerElement: "#trigger2", duration: 300, })
    .setPin("#pin2")
    .addIndicators({name: "2 (duration: 0)"}) // add indicators (requires plugin)
    .addTo(controller);

});