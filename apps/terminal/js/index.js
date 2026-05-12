"use strict";

$(function () {
    $(".animate-text").typed({
      strings: ["Hello","","", "You have come too far","",
      "There is no way back"],
        backSpeed: 50, // скорость удаления текста
        startDelay: 0, // изначальная задержка перед набором
        backDelay: 500, // пауза перед удалением текста
        loop: true, // повтор (true или false)
        loopCount: false, // число повтором, false = бесконечно
        attr: null
    });
});
