//Viewmodel KnockOut
var vm = function () {                            //declare viewmodel for KO
    console.log('ViewModel initiated...');
    //local variables
    var self = this;                            //this=window
    self.baseUri = ko.observable('http://192.168.160.58/Olympics/api/countries');   //observable if infos on API are changed
    self.displayName = 'Olympic games countries list';//displayName set to ...
    self.error = ko.observable('');             //error empty
    self.passingMessage = ko.observable('');    //passing Message empty
    self.records = ko.observableArray([]);      //records array empty
    self.currentPage = ko.observable(1);        //currentpage set to 1
    self.pagesize = ko.observable(20);          //pagesize set to 20
    self.totalRecords = ko.observable(50);      //totalRecords(number of countries) set to 50           --->are there 50 games??
    self.hasPrevious = ko.observable(false);    //hasPrevious set to false
    self.hasNext = ko.observable(false);        //hasNext set to false
    self.previousPage = ko.computed(function () {//calculates the previous page number
        return self.currentPage() * 1 - 1;
    }, self);
    self.nextPage = ko.computed(function () {   //calculates the next page number
        return self.currentPage() * 1 + 1;
    }, self);
    self.fromRecord = ko.computed(function () { //number of the country which is displayed first on this page
        return self.previousPage() * self.pagesize() + 1;
    }, self);
    self.toRecord = ko.computed(function () {   //number of the country which is displayed last on this page
        return Math.min(self.currentPage() * self.pagesize(), self.totalRecords());
    }, self);
    self.totalPages = ko.observable(0);         //totalPages set to 0
    self.pageArray = function () {              //calculates the number of pages?
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

    //--- Page Events
    self.activate = function (id) {
        console.log('CALL: getCountries...');
        var composedUri = self.baseUri() + "?page=" + id + "&pageSize=" + self.pagesize();
        ajaxHelper(composedUri, 'GET').done(function (data) {   //if api reachable, "true.done" then...???
            console.log(data);                                  //data=JSON data from api
            hideLoading();                                      //don't show loading modal
            self.records(data.Records);                         //load all the data from api to the variables...
            self.currentPage(data.CurrentPage);
            self.hasNext(data.HasNext);
            self.hasPrevious(data.HasPrevious);
            self.pagesize(data.PageSize)
            self.totalPages(data.TotalPages);
            self.totalRecords(data.TotalRecords);
            //self.SetFavourites();
        });
    };

    //--- Internal functions
    function ajaxHelper(uri, method, data) {                    //if api not reachable, error is thrown and cycle is interrupted
        self.error(''); // Clear error message
        return $.ajax({
            type: method,                                       //method='GET'
            url: uri,                                           //uri='http://192.168.160.58/Olympics/api/games?page=1&pageSize=20'
            dataType: 'json',
            contentType: 'application/json',
            data: data ? JSON.stringify(data) : null,
            error: function (jqXHR, textStatus, errorThrown) {  //if there was no response from the server
                console.log("AJAX Call[" + uri + "] Fail...");
                hideLoading();                                  //no laoding modal if error
                self.error(errorThrown);
            }
        });
    }

    function sleep(milliseconds) {                          //stays for 'milliseconds' in the while loop
        const start = Date.now();
        while (Date.now() - start < milliseconds);
    }

    function showLoading() {                                //shows the loading modal if active
        $("#myModal").modal('show', {
            backdrop: 'static',                                 //closing while clicking outside not possible
            keyboard: false                                     //closing while clicking ESC not possible
        });
    }
    function hideLoading() {                                //hides the loading modal if active
        $('#myModal').on('shown.bs.modal', function (e) {       //shows the modal and after shown hides it immediately 
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
    };

    //--- start ....
    showLoading();
    var pg = getUrlParameter('page');
    console.log(pg);
    if (pg == undefined)
        self.activate(1);
    else {
        self.activate(pg);
    }
    console.log("VM initialized!");
};

$(document).ready(function () {
    console.log("ready!");
    ko.applyBindings(new vm());
});

$(document).ajaxComplete(function (event, xhr, options) {
    $("#myModal").modal('hide');
})
