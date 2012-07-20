var $ = require().$; // require("undefined")
    
function Roster(element) {
    element.innerHTML += this.renderWrapper();

    var contactsHtml = [];

    for (var i = 100; i --> 0;) {
        contactsHtml.push(this.renderItem());
    }

    $('.b-roster').innerHTML = contactsHtml.join('');

    $('.b-roster').addEventListener('click', function (e) {
        // Preload talk for dialog using parallel resource loading

        // they are both shortcuts
        require.async(['b-dialog', 'b-talk'], function (Dialog) {
            new Dialog(element);
            require.stats.sendTo('http://localhost:8081');
        });
    }, false);
}

Roster.prototype.renderWrapper = function () {
    return '<div class="b-roster"></div>';
};

Roster.prototype.renderItem = function () {
    return '<div class="b-roster__item js-item">' +
               '<div class="b-roster__item__photo js-photo"></div>' +
               '<div class="b-roster__item__meta">' +
                   '<div class="b-roster__item__meta__name">' + this.renderName('Test Test Test Test') + '</div>' +
                   '<div class="b-roster__item__meta__status b-roster__item__meta__status_status_online">' +
                       '<span class="b-roster__item__meta__status_icon"></span>' +
                       '<span>Online</span>' +
                   '</div>' +
               '</div>' +
           '</div>';
};

Roster.prototype.renderName = function (name) {
    return Long_Long_Name_renderName0('<span>' + name + '</span>');
};

//Noop function
function Long_Long_Name_renderName0 (name) {
    return Long_Long_Name_renderName1('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName1 (name) {
    return Long_Long_Name_renderName2('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName2 (name) {
    return Long_Long_Name_renderName3('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName3 (name) {
    return Long_Long_Name_renderName4('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName4 (name) {
    return Long_Long_Name_renderName5('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName5 (name) {
    return Long_Long_Name_renderName6('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName6 (name) {
    return Long_Long_Name_renderName7('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName7 (name) {
    return Long_Long_Name_renderName8('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName8 (name) {
    return Long_Long_Name_renderName9('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName9 (name) {
    return Long_Long_Name_renderName10('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName10 (name) {
    return Long_Long_Name_renderName11('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName11 (name) {
    return Long_Long_Name_renderName12('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName12 (name) {
    return Long_Long_Name_renderName13('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName13 (name) {
    return Long_Long_Name_renderName14('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName14 (name) {
    return Long_Long_Name_renderName15('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName15 (name) {
    return Long_Long_Name_renderName16('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName16 (name) {
    return Long_Long_Name_renderName17('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName17 (name) {
    return Long_Long_Name_renderName18('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName18 (name) {
    return Long_Long_Name_renderName19('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName19 (name) {
    return Long_Long_Name_renderName20('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName20 (name) {
    return Long_Long_Name_renderName21('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName21 (name) {
    return Long_Long_Name_renderName22('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName22 (name) {
    return Long_Long_Name_renderName23('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName23 (name) {
    return Long_Long_Name_renderName24('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName24 (name) {
    return Long_Long_Name_renderName25('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName25 (name) {
    return Long_Long_Name_renderName26('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName26 (name) {
    return Long_Long_Name_renderName27('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName27 (name) {
    return Long_Long_Name_renderName28('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName28 (name) {
    return Long_Long_Name_renderName29('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName29 (name) {
    return Long_Long_Name_renderName30('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName30 (name) {
    return Long_Long_Name_renderName31('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName31 (name) {
    return Long_Long_Name_renderName32('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName32 (name) {
    return Long_Long_Name_renderName33('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName33 (name) {
    return Long_Long_Name_renderName34('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName34 (name) {
    return Long_Long_Name_renderName35('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName35 (name) {
    return Long_Long_Name_renderName36('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName36 (name) {
    return Long_Long_Name_renderName37('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName37 (name) {
    return Long_Long_Name_renderName38('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName38 (name) {
    return Long_Long_Name_renderName39('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName39 (name) {
    return Long_Long_Name_renderName40('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName40 (name) {
    return Long_Long_Name_renderName41('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName41 (name) {
    return Long_Long_Name_renderName42('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName42 (name) {
    return Long_Long_Name_renderName43('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName43 (name) {
    return Long_Long_Name_renderName44('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName44 (name) {
    return Long_Long_Name_renderName45('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName45 (name) {
    return Long_Long_Name_renderName46('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName46 (name) {
    return Long_Long_Name_renderName47('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName47 (name) {
    return Long_Long_Name_renderName48('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName48 (name) {
    return Long_Long_Name_renderName49('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName49 (name) {
    return Long_Long_Name_renderName50('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName50 (name) {
    return Long_Long_Name_renderName51('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName51 (name) {
    return Long_Long_Name_renderName52('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName52 (name) {
    return Long_Long_Name_renderName53('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName53 (name) {
    return Long_Long_Name_renderName54('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName54 (name) {
    return Long_Long_Name_renderName55('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName55 (name) {
    return Long_Long_Name_renderName56('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName56 (name) {
    return Long_Long_Name_renderName57('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName57 (name) {
    return Long_Long_Name_renderName58('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName58 (name) {
    return Long_Long_Name_renderName59('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName59 (name) {
    return Long_Long_Name_renderName60('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName60 (name) {
    return Long_Long_Name_renderName61('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName61 (name) {
    return Long_Long_Name_renderName62('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName62 (name) {
    return Long_Long_Name_renderName63('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName63 (name) {
    return Long_Long_Name_renderName64('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName64 (name) {
    return Long_Long_Name_renderName65('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName65 (name) {
    return Long_Long_Name_renderName66('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName66 (name) {
    return Long_Long_Name_renderName67('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName67 (name) {
    return Long_Long_Name_renderName68('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName68 (name) {
    return Long_Long_Name_renderName69('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName69 (name) {
    return Long_Long_Name_renderName70('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName70 (name) {
    return Long_Long_Name_renderName71('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName71 (name) {
    return Long_Long_Name_renderName72('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName72 (name) {
    return Long_Long_Name_renderName73('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName73 (name) {
    return Long_Long_Name_renderName74('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName74 (name) {
    return Long_Long_Name_renderName75('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName75 (name) {
    return Long_Long_Name_renderName76('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName76 (name) {
    return Long_Long_Name_renderName77('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName77 (name) {
    return Long_Long_Name_renderName78('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName78 (name) {
    return Long_Long_Name_renderName79('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName79 (name) {
    return Long_Long_Name_renderName80('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName80 (name) {
    return Long_Long_Name_renderName81('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName81 (name) {
    return Long_Long_Name_renderName82('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName82 (name) {
    return Long_Long_Name_renderName83('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName83 (name) {
    return Long_Long_Name_renderName84('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName84 (name) {
    return Long_Long_Name_renderName85('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName85 (name) {
    return Long_Long_Name_renderName86('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName86 (name) {
    return Long_Long_Name_renderName87('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName87 (name) {
    return Long_Long_Name_renderName88('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName88 (name) {
    return Long_Long_Name_renderName89('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName89 (name) {
    return Long_Long_Name_renderName90('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName90 (name) {
    return Long_Long_Name_renderName91('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName91 (name) {
    return Long_Long_Name_renderName92('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName92 (name) {
    return Long_Long_Name_renderName93('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName93 (name) {
    return Long_Long_Name_renderName94('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName94 (name) {
    return Long_Long_Name_renderName95('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName95 (name) {
    return Long_Long_Name_renderName96('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName96 (name) {
    return Long_Long_Name_renderName97('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName97 (name) {
    return Long_Long_Name_renderName98('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName98 (name) {
    return Long_Long_Name_renderName99('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName99 (name) {
    return Long_Long_Name_renderName100('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName100 (name) {
    return Long_Long_Name_renderName101('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName101 (name) {
    return Long_Long_Name_renderName102('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName102 (name) {
    return Long_Long_Name_renderName103('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName103 (name) {
    return Long_Long_Name_renderName104('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName104 (name) {
    return Long_Long_Name_renderName105('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName105 (name) {
    return Long_Long_Name_renderName106('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName106 (name) {
    return Long_Long_Name_renderName107('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName107 (name) {
    return Long_Long_Name_renderName108('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName108 (name) {
    return Long_Long_Name_renderName109('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName109 (name) {
    return Long_Long_Name_renderName110('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName110 (name) {
    return Long_Long_Name_renderName111('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName111 (name) {
    return Long_Long_Name_renderName112('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName112 (name) {
    return Long_Long_Name_renderName113('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName113 (name) {
    return Long_Long_Name_renderName114('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName114 (name) {
    return Long_Long_Name_renderName115('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName115 (name) {
    return Long_Long_Name_renderName116('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName116 (name) {
    return Long_Long_Name_renderName117('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName117 (name) {
    return Long_Long_Name_renderName118('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName118 (name) {
    return Long_Long_Name_renderName119('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName119 (name) {
    return Long_Long_Name_renderName120('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName120 (name) {
    return Long_Long_Name_renderName121('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName121 (name) {
    return Long_Long_Name_renderName122('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName122 (name) {
    return Long_Long_Name_renderName123('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName123 (name) {
    return Long_Long_Name_renderName124('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName124 (name) {
    return Long_Long_Name_renderName125('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName125 (name) {
    return Long_Long_Name_renderName126('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName126 (name) {
    return Long_Long_Name_renderName127('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName127 (name) {
    return Long_Long_Name_renderName128('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName128 (name) {
    return Long_Long_Name_renderName129('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName129 (name) {
    return Long_Long_Name_renderName130('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName130 (name) {
    return Long_Long_Name_renderName131('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName131 (name) {
    return Long_Long_Name_renderName132('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName132 (name) {
    return Long_Long_Name_renderName133('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName133 (name) {
    return Long_Long_Name_renderName134('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName134 (name) {
    return Long_Long_Name_renderName135('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName135 (name) {
    return Long_Long_Name_renderName136('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName136 (name) {
    return Long_Long_Name_renderName137('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName137 (name) {
    return Long_Long_Name_renderName138('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName138 (name) {
    return Long_Long_Name_renderName139('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName139 (name) {
    return Long_Long_Name_renderName140('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName140 (name) {
    return Long_Long_Name_renderName141('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName141 (name) {
    return Long_Long_Name_renderName142('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName142 (name) {
    return Long_Long_Name_renderName143('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName143 (name) {
    return Long_Long_Name_renderName144('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName144 (name) {
    return Long_Long_Name_renderName145('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName145 (name) {
    return Long_Long_Name_renderName146('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName146 (name) {
    return Long_Long_Name_renderName147('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName147 (name) {
    return Long_Long_Name_renderName148('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName148 (name) {
    return Long_Long_Name_renderName149('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName149 (name) {
    return Long_Long_Name_renderName150('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName150 (name) {
    return Long_Long_Name_renderName151('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName151 (name) {
    return Long_Long_Name_renderName152('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName152 (name) {
    return Long_Long_Name_renderName153('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName153 (name) {
    return Long_Long_Name_renderName154('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName154 (name) {
    return Long_Long_Name_renderName155('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName155 (name) {
    return Long_Long_Name_renderName156('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName156 (name) {
    return Long_Long_Name_renderName157('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName157 (name) {
    return Long_Long_Name_renderName158('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName158 (name) {
    return Long_Long_Name_renderName159('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName159 (name) {
    return Long_Long_Name_renderName160('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName160 (name) {
    return Long_Long_Name_renderName161('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName161 (name) {
    return Long_Long_Name_renderName162('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName162 (name) {
    return Long_Long_Name_renderName163('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName163 (name) {
    return Long_Long_Name_renderName164('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName164 (name) {
    return Long_Long_Name_renderName165('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName165 (name) {
    return Long_Long_Name_renderName166('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName166 (name) {
    return Long_Long_Name_renderName167('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName167 (name) {
    return Long_Long_Name_renderName168('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName168 (name) {
    return Long_Long_Name_renderName169('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName169 (name) {
    return Long_Long_Name_renderName170('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName170 (name) {
    return Long_Long_Name_renderName171('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName171 (name) {
    return Long_Long_Name_renderName172('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName172 (name) {
    return Long_Long_Name_renderName173('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName173 (name) {
    return Long_Long_Name_renderName174('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName174 (name) {
    return Long_Long_Name_renderName175('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName175 (name) {
    return Long_Long_Name_renderName176('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName176 (name) {
    return Long_Long_Name_renderName177('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName177 (name) {
    return Long_Long_Name_renderName178('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName178 (name) {
    return Long_Long_Name_renderName179('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName179 (name) {
    return Long_Long_Name_renderName180('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName180 (name) {
    return Long_Long_Name_renderName181('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName181 (name) {
    return Long_Long_Name_renderName182('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName182 (name) {
    return Long_Long_Name_renderName183('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName183 (name) {
    return Long_Long_Name_renderName184('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName184 (name) {
    return Long_Long_Name_renderName185('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName185 (name) {
    return Long_Long_Name_renderName186('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName186 (name) {
    return Long_Long_Name_renderName187('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName187 (name) {
    return Long_Long_Name_renderName188('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName188 (name) {
    return Long_Long_Name_renderName189('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName189 (name) {
    return Long_Long_Name_renderName190('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName190 (name) {
    return Long_Long_Name_renderName191('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName191 (name) {
    return Long_Long_Name_renderName192('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName192 (name) {
    return Long_Long_Name_renderName193('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName193 (name) {
    return Long_Long_Name_renderName194('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName194 (name) {
    return Long_Long_Name_renderName195('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName195 (name) {
    return Long_Long_Name_renderName196('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName196 (name) {
    return Long_Long_Name_renderName197('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName197 (name) {
    return Long_Long_Name_renderName198('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName198 (name) {
    return Long_Long_Name_renderName199('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName199 (name) {
    return Long_Long_Name_renderName200('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName200 (name) {
    return Long_Long_Name_renderName201('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName201 (name) {
    return Long_Long_Name_renderName202('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName202 (name) {
    return Long_Long_Name_renderName203('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName203 (name) {
    return Long_Long_Name_renderName204('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName204 (name) {
    return Long_Long_Name_renderName205('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName205 (name) {
    return Long_Long_Name_renderName206('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName206 (name) {
    return Long_Long_Name_renderName207('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName207 (name) {
    return Long_Long_Name_renderName208('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName208 (name) {
    return Long_Long_Name_renderName209('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName209 (name) {
    return Long_Long_Name_renderName210('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName210 (name) {
    return Long_Long_Name_renderName211('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName211 (name) {
    return Long_Long_Name_renderName212('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName212 (name) {
    return Long_Long_Name_renderName213('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName213 (name) {
    return Long_Long_Name_renderName214('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName214 (name) {
    return Long_Long_Name_renderName215('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName215 (name) {
    return Long_Long_Name_renderName216('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName216 (name) {
    return Long_Long_Name_renderName217('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName217 (name) {
    return Long_Long_Name_renderName218('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName218 (name) {
    return Long_Long_Name_renderName219('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName219 (name) {
    return Long_Long_Name_renderName220('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName220 (name) {
    return Long_Long_Name_renderName221('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName221 (name) {
    return Long_Long_Name_renderName222('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName222 (name) {
    return Long_Long_Name_renderName223('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName223 (name) {
    return Long_Long_Name_renderName224('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName224 (name) {
    return Long_Long_Name_renderName225('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName225 (name) {
    return Long_Long_Name_renderName226('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName226 (name) {
    return Long_Long_Name_renderName227('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName227 (name) {
    return Long_Long_Name_renderName228('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName228 (name) {
    return Long_Long_Name_renderName229('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName229 (name) {
    return Long_Long_Name_renderName230('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName230 (name) {
    return Long_Long_Name_renderName231('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName231 (name) {
    return Long_Long_Name_renderName232('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName232 (name) {
    return Long_Long_Name_renderName233('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName233 (name) {
    return Long_Long_Name_renderName234('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName234 (name) {
    return Long_Long_Name_renderName235('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName235 (name) {
    return Long_Long_Name_renderName236('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName236 (name) {
    return Long_Long_Name_renderName237('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName237 (name) {
    return Long_Long_Name_renderName238('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName238 (name) {
    return Long_Long_Name_renderName239('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName239 (name) {
    return Long_Long_Name_renderName240('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName240 (name) {
    return Long_Long_Name_renderName241('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName241 (name) {
    return Long_Long_Name_renderName242('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName242 (name) {
    return Long_Long_Name_renderName243('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName243 (name) {
    return Long_Long_Name_renderName244('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName244 (name) {
    return Long_Long_Name_renderName245('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName245 (name) {
    return Long_Long_Name_renderName246('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName246 (name) {
    return Long_Long_Name_renderName247('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName247 (name) {
    return Long_Long_Name_renderName248('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName248 (name) {
    return Long_Long_Name_renderName249('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName249 (name) {
    return Long_Long_Name_renderName250('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName250 (name) {
    return Long_Long_Name_renderName251('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName251 (name) {
    return Long_Long_Name_renderName252('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName252 (name) {
    return Long_Long_Name_renderName253('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName253 (name) {
    return Long_Long_Name_renderName254('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName254 (name) {
    return Long_Long_Name_renderName255('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName255 (name) {
    return Long_Long_Name_renderName256('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName256 (name) {
    return Long_Long_Name_renderName257('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName257 (name) {
    return Long_Long_Name_renderName258('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName258 (name) {
    return Long_Long_Name_renderName259('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName259 (name) {
    return Long_Long_Name_renderName260('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName260 (name) {
    return Long_Long_Name_renderName261('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName261 (name) {
    return Long_Long_Name_renderName262('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName262 (name) {
    return Long_Long_Name_renderName263('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName263 (name) {
    return Long_Long_Name_renderName264('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName264 (name) {
    return Long_Long_Name_renderName265('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName265 (name) {
    return Long_Long_Name_renderName266('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName266 (name) {
    return Long_Long_Name_renderName267('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName267 (name) {
    return Long_Long_Name_renderName268('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName268 (name) {
    return Long_Long_Name_renderName269('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName269 (name) {
    return Long_Long_Name_renderName270('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName270 (name) {
    return Long_Long_Name_renderName271('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName271 (name) {
    return Long_Long_Name_renderName272('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName272 (name) {
    return Long_Long_Name_renderName273('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName273 (name) {
    return Long_Long_Name_renderName274('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName274 (name) {
    return Long_Long_Name_renderName275('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName275 (name) {
    return Long_Long_Name_renderName276('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName276 (name) {
    return Long_Long_Name_renderName277('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName277 (name) {
    return Long_Long_Name_renderName278('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName278 (name) {
    return Long_Long_Name_renderName279('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName279 (name) {
    return Long_Long_Name_renderName280('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName280 (name) {
    return Long_Long_Name_renderName281('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName281 (name) {
    return Long_Long_Name_renderName282('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName282 (name) {
    return Long_Long_Name_renderName283('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName283 (name) {
    return Long_Long_Name_renderName284('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName284 (name) {
    return Long_Long_Name_renderName285('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName285 (name) {
    return Long_Long_Name_renderName286('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName286 (name) {
    return Long_Long_Name_renderName287('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName287 (name) {
    return Long_Long_Name_renderName288('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName288 (name) {
    return Long_Long_Name_renderName289('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName289 (name) {
    return Long_Long_Name_renderName290('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName290 (name) {
    return Long_Long_Name_renderName291('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName291 (name) {
    return Long_Long_Name_renderName292('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName292 (name) {
    return Long_Long_Name_renderName293('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName293 (name) {
    return Long_Long_Name_renderName294('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName294 (name) {
    return Long_Long_Name_renderName295('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName295 (name) {
    return Long_Long_Name_renderName296('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName296 (name) {
    return Long_Long_Name_renderName297('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName297 (name) {
    return Long_Long_Name_renderName298('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName298 (name) {
    return Long_Long_Name_renderName299('<span>' + name + '</span>');
};
//Noop function
function Long_Long_Name_renderName299 (name) {
    return name;
};

module.exports = Roster;