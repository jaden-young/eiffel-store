'use strict';
import "./layout.html";
import "../components/aggregation.html";
import "../components/details.html";
import "../components/eventchain.html";

$(document).ready(function () {
    $(document.body).attr('data-spy', 'scroll');
    $(document.body).attr('data-target', '#navscrollspy');
    $(document.body).scrollspy({offset: 200});
    $('[data-spy="scroll"]').each(function () {
        $(this).scrollspy('refresh');
    });

});


//jQuery for page scrolling feature - requires jQuery Easing plugin
$(function () {
    $(document).on('click', 'a.page-scroll', function (event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top - 10
        }, 300, 'easeInOutExpo');
        event.preventDefault();
    });
});
