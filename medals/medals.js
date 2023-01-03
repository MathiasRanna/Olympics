
// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Olympics/api/Statistics/');
    self.displayName = 'Olympic Games Medals';
    self.error = ko.observable('');

    //--- Page Events
    self.activate = function () {
        console.log('CALL:' + "Medals_Country" + '...');
        var composedUri = self.baseUri() + "Medals_Country";
        console.log(composedUri);
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            createChart('bar', data, "Bronze_Medals_by_Country", 'CountryName', 'Medals', 'Bronze medals per Country', 'Bronze');
            createChart('bar', data, "Silver_Medals_by_Country", 'CountryName', 'Medals', 'Silver medals per Country', 'Silver');
            createChart('bar', data, "Gold_Medals_by_Country", 'CountryName', 'Medals', 'Gold medals per Country', 'Gold');
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

function createChart(charType, dataApi, chartId, param1, param2, title, smallTitle){
    const ctx = document.getElementById(chartId);
    const currData = dataApi.map(item => item.Medals.filter(medal => medal.MedalName === smallTitle && medal.Counter));
    console.log();

    new Chart(ctx, {
        type: charType,
        data: {
            labels: dataApi.map(item => item.CountryName),
            datasets: [{
                label: smallTitle,
                data: currData.map(item => item.map(item => item.Counter)),
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
