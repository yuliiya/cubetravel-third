(($) => {
  const options = {
    closeExisting: true,
    smallBtn: false,
    toolbar: false,
    touch: false,
  };

  $('[data-uikit-popup-open]').on('click', function (ev) {

    ev.preventDefault();

    const popupName = $(this).data('uikit-popup-open');

    $.fancybox.open($(`[data-uikit-popup=${popupName}]`), options);

    $('.control-close').on('click', () => {
      $.fancybox.close();
    });
  });
})(jQuery);
