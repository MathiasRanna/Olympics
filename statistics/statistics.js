
// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Olympics/api/Statistics/');
    self.displayName = 'Olympic Games Statistics';
    self.error = ko.observable('');

    //--- Page Events
    self.activate = function (charType, id, param1, param2, title, smallTitle) {
        console.log('CALL:' + id + '...');
        var composedUri = self.baseUri() + id;
        console.log(composedUri);
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            createChart(charType, data, id, param1, param2, title, smallTitle);
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
    self.activate('bar', "Games_Athletes", 'Name', 'Counter', 'Number of Atheletes per Olympic Games edition', 'Number of Atheletes');
    self.activate('bar', "Games_Competitions", 'Name', 'Counter', 'Number of Competitions per Olympic Games edition', 'Number of Competitions');
    self.activate('line', "Games_Countries", 'Name', 'Counter', 'Number of Countries per Olympic Games edition', 'Number of Countries');
    self.activate('line', "Games_Modalities", 'Name', 'Counter', 'Number of Modalities per Olympic Games edition', 'Number of Modalities');

    console.log("VM initialized!");
};

$(document).ready(function () {
    console.log("ready!");
    ko.applyBindings(new vm());
});

$(document).ajaxComplete(function (event, xhr, options) {
    $("#myModal").modal('hide');
})

function createChart(charType, dataApi, chartId, param1, param2, title, smallTitle){
    const ctx = document.getElementById(chartId);

    new Chart(ctx, {
        type: charType,
        data: {
            labels: dataApi.map(item => item[param1]),
            datasets: [{
                label: smallTitle,
                data: dataApi.map(item => item[param2]),
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: title
                }
            }
        }

    });

}
