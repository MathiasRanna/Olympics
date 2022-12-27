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
    // for countries search
    self.selectedContryName = ko.observable('');
    self.selectedCountry = ko.observable('');
    self.availableCountries = ko.observableArray([]);
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
    self.totalPages = ko.computed(function () {
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

    self.filterAthletes = function (formElement, page = 1) {
        console.log('CALL: searchAthlete....')
        let composedUri = self.baseUri() + "/SearchByName?q=" + self.searchInput();
        ajaxHelper(composedUri, 'GET').done(function (data) {
            hideLoading();
            console.log(data);
            if (data.length > 0) {
                let sliceCorrectData = data.slice((page - 1) * self.pagesize(), ((page - 1) * self.pagesize() + self.pagesize()));
                self.records(sliceCorrectData);
                self.totalRecords(data.length);
                self.currentPage(page);
            } else {
                $('#noResults').removeClass('d-none');
            }
        })
        return false;
    }

    self.activateFilterByCountry = function (viewModel, event) {
        let parseIOC = event.target.value.toString().slice(1, -1);
        self.selectedCountry(parseIOC);
        if (pg === undefined) {
            self.activate(1, parseIOC);
        } else {
            self.activate(pg, parseIOC);
        }
    }

    self.searchAndFilterByCountry = function (){

    }
    //--- Page Events
    self.activate = function (id, ioc) {
        var composedUri = "";
        // activate country dropdown list
        if (self.selectedCountry() !== '') {
            console.log('CALL: IOC list...');
            composedUri = self.baseUri() + '/ByIOC?ioc=' + ioc + "&page=" + id + "&pageSize=" + self.pagesize();
        }
        // activate normal
        else {
            console.log('CALL: getGames...');
            composedUri = self.baseUri() + "?page=" + id + "&pageSize=" + self.pagesize();
        }
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
            ioc !== undefined && $('#selectCountry').val("(" + ioc + ")");
        });
        // Activate api call for available countries
        let composedUriForCountries = 'http://192.168.160.58/Olympics/api/Countries?page=1&pagesize=250';
        ajaxHelper(composedUriForCountries, 'GET').done(function (data) {
            self.availableCountries(data.Records);
        })
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
        while (Date.now() - start < milliseconds) ;
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
    var search = getUrlParameter("q");
    let ioc = getUrlParameter('ioc');
    console.log(pg);
    console.log(search);
    console.log(ioc);
    if (ioc !== undefined && ioc !== "") {
        self.selectedCountry(ioc);
        self.activate(pg, ioc);
    } else {
        // Activate search functions if search was given
        if (search !== undefined && search !== "") {
            self.searchInput(search);
            self.filterByQuery("", pg);
        } else if (pg === undefined) {
            self.activate(1);
        } else {
            self.activate(pg);
        }
    }

    console.log("VM initialized!");
};

if (typeof jQuery !== 'undefined') {
    $(document).ready(function () {
        console.log("ready!");
        ko.applyBindings(new vm());
    });

    $(document).ajaxComplete(function (event, xhr, options) {
        $("#myModal").modal('hide');
    })
}
