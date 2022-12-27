// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Olympics/api/athletes');
    //self.baseUri = ko.observable('http://localhost:62595/api/drivers');
    self.displayName = 'Olympic Games Athletes';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.records = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(10);
    self.totalRecords = ko.observable(50);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);
    self.previousPage = ko.computed(function () {
        return self.currentPage() * 1 - 1;
    }, self);
    self.nextPage = ko.computed(function () {
        return self.currentPage() * 1 + 1;
    }, self);
    self.fromRecord = ko.computed(function () {
        return self.previousPage() * self.pagesize() + 1;
    }, self);
    self.toRecord = ko.computed(function () {
        return Math.min(self.currentPage() * self.pagesize(), self.totalRecords());
    }, self);
    self.totalPages = ko.computed(function (){
        return Math.ceil(self.totalRecords() / self.pagesize());
    }, self);
    self.searchInput = ko.observable('');
    self.pageArray = function () {
        var list = [];
        var size = Math.min(self.totalPages(), 9);
        var step;
        if (size < 9 || self.currentPage() === 1)
            step = 0;
        else if (self.currentPage() >= self.totalPages() - 4)
            step = self.totalPages() - 9;
        else
            step = Math.max(self.currentPage() - 5, 0);

        for (var i = 1; i <= size; i++)
            list.push(i + step);
        return list;
    };
    self.athletePhoto = function (photo) {
        if (photo) {
            return photo;
        } else {
            return "https://thumbs.dreamstime.com/b/default-avatar-profile-flat-icon-social-media-user-vector-portrait-unknown-human-image-default-avatar-profile-flat-icon-184330869.jpg";
        }
    };

    self.filterAthletes = function (id) {
        console.log('CALL: searchAthlete....')
        let composedUri = self.baseUri() + "/SearchByName?q=" + self.searchInput();
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            if (data.length > 0){
                self.records(data);
                self.pagesize(100);
                $('.info-nav').addClass('d-none');
                $('#specify-message').removeClass('d-none');
            } else {
                $('.info-nav').addClass('d-none');
                $('.table').addClass('d-none');
                $('#noResults').removeClass('d-none');
            }

        })
        return false;
    }

    self.tryAPI = function (ioc , id){
        console.log("CALL: ioc");
        let composedUri = self.baseUri() + "/ByIOC?ioc=" + ioc + "&page=" + id + "&pagesize=" + self.pagesize();
        ajaxHelper(composedUri, 'GET').done(function (data){
            console.log(data);
        })
    }

    //--- Page Events
    self.activate = function (id) {
        console.log('CALL: getGames...');
        var composedUri = self.baseUri() + "?page=" + id + "&pageSize=" + self.pagesize();
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            hideLoading();
            self.records(data.Records);
            self.currentPage(data.CurrentPage);
            self.hasNext(data.HasNext);
            self.hasPrevious(data.HasPrevious);
            self.pagesize(data.PageSize)
            self.totalRecords(data.TotalRecords);
            //self.SetFavourites();
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

    function sleep(milliseconds) {
        const start = Date.now();
        while (Date.now() - start < milliseconds);
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

    function getUrlParameter(sParam) {

        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;
        console.log("sPageURL=", sPageURL);
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    }

    //--- start ....
    showLoading();
    var pg = getUrlParameter('page');
    console.log(pg);
    if (pg === undefined){
        self.activate(1);
        self.tryAPI("est", 1);
    }
    else {
        self.activate(pg);
        self.tryAPI("est", pg);
    }
    console.log("VM initialized!");
};

if (typeof jQuery !== 'undefined'){
    $(document).ready(function () {
        console.log("ready!");
        ko.applyBindings(new vm());
    });

    $(document).ajaxComplete(function (event, xhr, options) {
        $("#myModal").modal('hide');
    })
}
