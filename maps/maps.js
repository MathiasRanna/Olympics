// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Olympics/api/Games');
    self.displayName = 'Olympic Games locations on Map';
    self.error = ko.observable('');

    //--- Page Events
    self.activate = function () {
        console.log('CALL:' + "games" + '...');
        var composedUri = self.baseUri() + "?page=1&pagesize=250";
        console.log(composedUri);
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            createMap(data.Records);
            hideLoading();
        });
    };

    //--- Internal functions
    function ajaxHelper(uri, method, data) {
        self.error(''); // Clear error message
        return $.ajax({
            type: method,
            url: uri,
            dataType: 'json',
            contentType: 'application/json',
            data: data ? JSON.stringify(data) : null,
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("AJAX Call[" + uri + "] Fail...");
                hideLoading();
                self.error(errorThrown);
            }
        });
    }

    function showLoading() {
        $("#myModal").modal('show', {
            backdrop: 'static',
            keyboard: false
        });
    }

    function hideLoading() {
        $('#myModal').on('shown.bs.modal', function (e) {
            $("#myModal").modal('hide');
        })
    }

    //--- start ....
    showLoading();
    self.activate();

    console.log("VM initialized!");
};

$(document).ready(function () {
    console.log("ready!");
    ko.applyBindings(new vm());
});

$(document).ajaxComplete(function (event, xhr, options) {
    $("#myModal").modal('hide');
})

function createMap(dataArr){
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 40.638839623328494, lng: -8.6626567552871 },
        zoom: 2,
    });
    // Create an info window to share between markers.
    const infoWindow = new google.maps.InfoWindow();

    for (const countryObj of dataArr) {
        const marker = new google.maps.Marker({
            position: { lat: parseFloat(countryObj.Lat), lng: parseFloat(countryObj.Lon) },
            map,
            title: countryObj.Name + ", " + countryObj.CityName + ", " + countryObj.CountryName,
        });

        marker.addListener("click", ({ domEvent, latLng }) => {
            const { target } = domEvent;

            infoWindow.close();
            infoWindow.setContent(marker.title);
            infoWindow.open(marker.map, marker);
        });
    }


}

// let map;
//
// function initMap() {
//     map = new google.maps.Map(document.getElementById("map"), {
//         center: { lat: -34.397, lng: 150.644 },
//         zoom: 8,
//     });
// }
//
// window.initMap = initMap;
