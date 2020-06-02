//  ==========================================================================
//  Component header-fixed
//  ==========================================================================

(($) => {
  const $headerFixed = $('.header-fixed');

  $(window).on('scroll', function () {
    if ($(this).scrollTop() > 100) {
      $headerFixed.addClass('header-fixed--visible');
    } else {
      $headerFixed.removeClass('header-fixed--visible');
    }
  });

})(jQuery);
