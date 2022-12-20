// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Olympics/api/Athletes/');
    self.displayName = 'Olympic Games Athlete Details';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    //--- Data Record
    self.Id = ko.observable('');
    self.Name = ko.observable('');
    self.Sex = ko.observable('');
    self.Height = ko.observable('');
    self.Weight = ko.observable('');
    self.BornDate = ko.observable('');
    self.DiedDate = ko.observable('');
    self.Photo = ko.observable('');
    self.OlympediaLink = ko.observableArray('');
    self.Url = ko.observable('');
    self.age = ko.computed(function () {
        if (self.BornDate() !== null && self.DiedDate() == null) {
            let today = new Date();
            let bornDate = new Date(self.BornDate());
            return Math.floor(Math.abs(today - bornDate) / (1000 * 60 * 60 * 24 * 365));
        } else if (self.BornDate() !== null && self.DiedDate() != null){
            let bornDate = new Date(self.BornDate());
            let dieDate = new Date(self.DiedDate());
            return "Died at the age of: " + Math.floor(Math.abs(dieDate - bornDate) / (1000 * 60 * 60 * 24 * 365));
        }
        return "-";
    });
    self.athletePhoto = ko.computed(function () {
        if (self.Photo()) {
            return self.Photo();
        } else {
            return "https://thumbs.dreamstime.com/b/default-avatar-profile-flat-icon-social-media-user-vector-portrait-unknown-human-image-default-avatar-profile-flat-icon-184330869.jpg";
        }
    });
    self.formatDate = function (date) {
        let newDate = new Date(date);
        let days = newDate.getDate() < 10 ? "0" + newDate.getDate() : newDate.getDate();
        let month = (newDate.getMonth() + 1) < 10 ? "0" + (newDate.getMonth() + 1) : (newDate.getMonth() + 1);
        let year = newDate.getFullYear();
        return days + "/" + month + "/" + year;
    }

    //--- Page Events
    self.activate = function (id) {
        console.log('CALL: getGame...');
        var composedUri = self.baseUri() + id;
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            hideLoading();
            self.Id(data.Id);
            self.Name(data.Name);
            self.Sex(data.Sex);
            self.Height(data.Height);
            self.Weight(data.Weight);
            self.BornDate(data.BornDate);
            self.DiedDate(data.DiedDate);
            self.Photo(data.Photo);
            self.OlympediaLink(data.OlympediaLink);
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
        $('#myModal').modal('show', {
            backdrop: 'static',
            keyboard: false
        });
    }

    function hideLoading() {
        $('#myModal').on('shown.bs.modal', function (e) {
            $("#myModal").modal('hide');
        })
    }

    function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    }

    //--- start ....
    showLoading();
    var pg = getUrlParameter('id');
    console.log(pg);
    if (pg === undefined)
        self.activate(1);
    else {
        self.activate(pg);
    }
    console.log("VM initialized!");
};

$(document).ready(function () {
    console.log("document.ready!");
    ko.applyBindings(new vm());
});

$(document).ajaxComplete(function (event, xhr, options) {
    $("#myModal").modal('hide');
})