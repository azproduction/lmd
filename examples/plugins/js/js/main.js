/**
 * LMD require.js() and shortcuts example
 */

function renderMap() {
    var $map = $('#map');

    // @see http://api.yandex.ru/maps/jsbox/geolocation_ip
    ymaps.ready(function () {
        // IP based geolocation
        var geolocation = ymaps.geolocation,
            coords = [geolocation.latitude, geolocation.longitude],
            myMap = new ymaps.Map($map[0], {
                center: coords,
                zoom: 10
            });

        myMap.geoObjects.add(
            new ymaps.Placemark(
                coords,
                {
                    // add balloon
                    balloonContentHeader: geolocation.country,
                    balloonContent: geolocation.city,
                    balloonContentFooter: geolocation.region
                }
            )
        );
    });
}

$(function () {
    var $button = $('.b-button');

    $button.click(function () {
        $button.text('Loading...');

        // using shortcuts
        // yandexMapsApi -> //api-maps.yandex.ru/2.0-stable/?load=package.standard&lang=ru-RU
        require.js("yandexMapsApi", function (status) {
            console.log(status ? 'Js Loaded' : 'Fail to load');
            $button.remove();
            renderMap();
        });
    });
});