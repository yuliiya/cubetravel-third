(function ($) {
  $('.js-carousel').owlCarousel({
    margin:30,
    nav:true,
    responsive:{
      0:{
        items:1
      },
      576:{
        items:2
      },
      992:{
        items:3
      },
      1200:{
        items:4
      }
    }
  })

  $(".owl-stage-outer").attr({
    'data-toggle': 'modal',
    'data-target': '#lightboxModal',
  });
}($));