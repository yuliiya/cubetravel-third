(($) => {
  const options = {
    default: {
      arrows: false,
      dots: true
    },
    'carusel-name-1': {
      slidesToShow: 4
    },
    'carusel-name-2': {
      slidesToShow: 2,
      slidesToScroll: 2
    }
  };

  const $caruselContainer = $('[data-uikit-carusel-container]');

  $caruselContainer.each(function(index, el) {
    const $container = $(el);
    const $carusel = $container.find('[data-uikit-carusel]');
    const $buttonPrev = $container.find('.control-arrow--prev');
    const $buttonNext = $container.find('.control-arrow--next');
    const $pagination = $container.find('.control-pagination');

    options.default.appendDots = $pagination;
    $carusel.slick({...options.default, ...options[$carusel.data('uikit-carusel')]});

    $buttonNext.on('click', function () {
      $carusel.slick('slickNext');
    });
    $buttonPrev.on('click', function () {
      $carusel.slick('slickPrev');
    });

  });
})(jQuery);
