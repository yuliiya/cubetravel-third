(($) => {

  $('[data-uikit-go-to-anchor]').on('click', function (ev) {
    ev.preventDefault();

    const offset = 0;
    const $window = $(window);
    const sectionAnchor = $(this).data('uikit-go-to-anchor');
    const $sectionTarget = $(`[data-uikit-go-to-target=${sectionAnchor}]`);
    const destination = $sectionTarget.offset().top - offset;

    $('html, body').animate({
      scrollTop: destination,
    }, {
      queue: true,
      duration: 800,
      //easing: 'easeOutQuad',

      start: function() {
        $window.bind('mousewheel', function(event) {
          event.preventDefault();
        });
      },

      complete: function() {
        $window.unbind('mousewheel');
      }
    });
  });
})(jQuery);
