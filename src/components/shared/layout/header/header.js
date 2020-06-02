//  ==========================================================================
//  Component header
//  ==========================================================================

(($) => {
  const $header = $('.header');

  $(window).on('scroll', function () {
    if ($(this).scrollTop() > 0) {
      $header.addClass('header--fixed');
    } else {
      $header.removeClass('header--fixed');
    }
  });

})(jQuery);
