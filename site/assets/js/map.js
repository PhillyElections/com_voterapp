(function(scoped) {
    scoped(window.jQuery, window.L, window, document)
}(function($, L, W, D) {
    'use strict'

    // true init
    $(function() {
        setupMultipleSelects();
        $(".office-level-accordion > dd").hide();
        $(".office-accordion > dd").hide();
        runonce.populateSelect2Lists = true

        initialize();
    });

    var ie = /msie ([0-9]+)\.[0-9]+/.exec(navigator.userAgent.toLowerCase()),
        directionsService = new google.maps.DirectionsService(),
        directionsRenderer = new google.maps.DirectionsRenderer({
            suppressMarkers: true
        }),
        GATEKEEPER_KEY = 'f2e3e82987f8a1ef78ca9d9d3cfc7f1d',
        runonce = [],
        markers = [],
        shapes = [],
        labels = [],
        geocoder, map, bounds, marker, mayorAddress, pollingBounds, startMarker, endMarker, pollingAddress, wardDivision, searchBox, wardData, councilData, stateRepData, stateSenateData, usCongressData, divisions, wards, councilDistricts, paRepDistricts, paSenateDistricts, usCongressDistricts,
        officeToId = {
            "President of the United States": "#potus",
            "U.S. Senate": "#us-senators",
            "U.S. Representative": "#us-representative",
            "Governor": "#governor",
            "Lieutenant Governor": "#lieutenant-governor",
            "Attorney General": "#attorney-general",
            "State Treasurer": "#state-treasurer",
            "Auditor General": "#auditor-general",
            "State Senator": "#state-senator",
            "State Representative": "#state-representative",
            "Mayor": "#mayor",
            "District Attorney": "#district-attorney",
            "City Controller": "#city-controller",
            "Register of Wills": "#register-of-wills",
            "Sheriff": "#sheriff",
            "City Commissioner": "#city-commissioners",
            "City Council At-Large": "#city-council-at-large",
            "City Council": "#city-council"
        },
        buildingCodes = {
            F: "BUILDING FULLY ACCESSIBLE",
            A: "ALTERNATE ENTRANCE",
            B: "BUILDING SUBSTANTIALLY ACCESSIBLE",
            R: "ACCESSIBLE WITH RAMP",
            M: "BUILDING ACCESSIBLITY MODIFIED",
            N: "BUILDING NOT ACCESSIBLE"
        },
        parkingCodes = {
            N: "NO PARKING",
            L: "LOADING ZONE",
            H: "HANDICAP PARKING",
            G: "GENERAL PARKING"
        },
        tabFunctions = {
            "nav-polling-place": function(a) {
                getPollingPlace(a.ward, a.division);
                $("#map-canvas").show();
                $("#sample-pdf").hide();
            },
            "nav-elected-officials": function(a) {
                getOfficials(a.congressionalDistrict, a.stateSenateDistrict, a.stateRepresentativeDistrict, a.councilDistrict, a.ward, a.division);
                $("#map-canvas").show();
                $("#sample-pdf").hide();
            },
            "nav-maps": function(a) {
                $("#map-canvas").show();
                $("#sample-pdf").hide();
                runonce.bindDistrictSelectEvent(a);
            },
            "nav-download-ballot": function(a) {
                getSampleBallot(a.ward, a.division);
                $("#map-canvas").hide();
                $("#sample-pdf").show();
            }
        },
        services = {
            address_completer: {
                url(input) {
                    const encInput = encodeURIComponent(input)
                    return '//apis.philadelphiavotes.com/autocomplete/{encInput}'.replace('{encInput}', encInput)
                }
            },
            geocoder: {
                url(input) {
                    const encInput = encodeURIComponent(input)
                    return '//api.phila.gov/ais/v1/search/{encInput}'.replace('{encInput}', encInput)
                },
                params: {
                    gatekeeperKey: GATEKEEPER_KEY
                },
                style: {
                    color: "#FF0000",
                }
            },
            indexer: {
                url(input) {
                    const encInput = encodeURIComponent(pad(input, 4))
                    return '//apis.philadelphiavotes.com/indexes/{encInput}'.replace('{encInput}', encInput)
                }
            },
            polling_place: {
                url(input) {
                    const encInput = encodeURIComponent(pad(input, 4))
                    return '//apis.philadelphiavotes.com/pollingplaces/{encInput}'.replace('{encInput}', encInput)
                },
                style: {
                    color: "#FF0000"
                }
            },
            shape_city_division: {
                url(input) {
                    const encInput = encodeURIComponent(pad(input, 4))
                    return '//apis.philadelphiavotes.com/shapes/city_division/{encInput}'.replace('{encInput}', encInput)
                },
                style: {
                    color: "#FF0000"
                }
            },
            // ward service - single quotes
            shape_city_ward: {
                url(input) {
                    const encInput = encodeURIComponent(parseInt(input, 10))
                    return '//apis.philadelphiavotes.com/shapes/city_ward/{encInput}'.replace('{encInput}', encInput)
                },
                style: {
                    color: "#0000FF"
                }
            },
            // council service - single quotes
            shape_city_district: {
                url(input) {
                    const encInput = encodeURIComponent(parseInt(input, 10))
                    return '//apis.philadelphiavotes.com/shapes/city_district/{encInput}'.replace('{encInput}', encInput)
                },
                style: {
                    color: "#0D912E"
                }
            },
            // state rep service - single quotes
            shape_state_house: {
                url(input) {
                    const encInput = encodeURIComponent(parseInt(input, 10))
                    return '//apis.philadelphiavotes.com/shapes/state_house/{encInput}'.replace('{encInput}', encInput)
                },
                style: {
                    color: "#751675"
                }
            },
            // state sen service - no single quotes
            shape_state_senate: {
                url(input) {
                    const encInput = encodeURIComponent(parseInt(input, 10))
                    return '//apis.philadelphiavotes.com/shapes/state_senate/{encInput}'.replace('{encInput}', encInput)
                },
                style: {
                    color: "#875010"
                }
            },
            shape_federal_house: {
                url(input) {
                    const encInput = encodeURIComponent(pad(input))
                    return '//apis.philadelphiavotes.com/shapes/federal_house/42{encInput}'.replace('{encInput}', encInput)
                },
                style: {
                    color: "#0C727D"
                }
            }
        }

    // begin ajax functions
    function byPassGoogle() {
        if (!wardDivision) {
            invalidAddress();
            return false;
        }
        var a = wardDivision.substring(0, 2);
        var b = wardDivision.substring(2, 4);
        $.ajax({
            type: "GET",
            url: baseUri + "index.php",
            data: {
                option: "com_divisions",
                view: "json",
                division_id: wardDivision
            },
            dataType: "json",
            async: false,
            success: function(c) {
                var e = {},
                    d;
                $.each(c.features, function(f, g) {
                    e.id = g.attributes.division_id;
                    e.ward = a;
                    e.division = b;
                    e.congressionalDistrict = g.attributes.congressional_district;
                    e.stateSenateDistrict = g.attributes.state_senate_district;
                    e.stateRepresentativeDistrict = g.attributes.state_representative_district;
                    e.councilDistrict = g.attributes.council_district;
                    e.coordinates = [];
                    g.attributes.coordinates.split(" ").forEach(function(h) {
                        e.coordinates.push(h.split(","));
                    });
                });
                runonce.populateDistrictSelectList(e);
                d = function(f) {
                    $("option[value=" + f + "]").prop("disabled", false);
                };
                tabFunc(e);
                getDivisionShape(wardDivision).done(function(f) {
                    drawMap([{
                        name: f.name,
                        coordinates: f.coordinates
                    }]);
                    d("DIVISION");
                });
                getWardShape(a).done(function(f) {
                    wardData = f;
                    d("WARD");
                });
                getCouncilShape(e.councilDistrict).done(function(f) {
                    councilData = f;
                    d("COUNCIL");
                });
                getStateRepShape(e.stateRepresentativeDistrict).done(function(f) {
                    stateRepData = f;
                    d("STATE_REP");
                });
                getStateSenateShape(e.stateSenateDistrict).done(function(f) {
                    stateSenateData = f;
                    d("STATE_SENATE");
                });
                getUsCongressShape(e.congressionalDistrict).done(function(f) {
                    usCongressData = f;
                    d("US_CONGRESS");
                });
            },
            error: function(c, e, d) {
                alert(e + " " + d);
            }
        });
    }

    function addressEntered(m) {
        if (!searchBox || !addressIsProvided(document.getElementById("target"))) {
            return false;
        }
        if (m == "2") {
            byPassGoogle();
            return;
        }
        var a = searchBox.getPlaces(),
            e, g, c, h, b, n = [],
            r, l;
        clearCustomMap();
        if (directionsRenderer) {
            directionsRenderer.setMap(null);
        }
        for (g = 0; g < markers.length; g++) {
            markers[g].setMap(null);
        }
        e = a[0];
        var f = ["street_number", "route"],
            j = {},
            q = "",
            service = services.geocoder;
        /*        if (typeof e.address_components !== "undefined") {
                    for (var g = 0; g < e.address_components.length; g++) {
                        if (typeof e.address_components[g].types !== "undefined") {
                            for (var d = 0; d < e.address_components[g].types.length; d++) {
                                if (f.indexOf(e.address_components[g].types[d]) > -1) {
                                    var p = e.address_components[g].long_name.replace(/ /g, "+");
                                    j[e.address_components[g].types[d]] = p;
                                }
                            }
                        }
                    }
                }
                if (j) {
                    for (var o in j) {
                        if (j.hasOwnProperty(o)) {
                            if (f.indexOf(o) > -1) {
                                q += " " + j[o];
                            }
                        }
                    }
                }*/
        q = e.name;
        if (q == "") {
            invalidAddress();
            return;
        }
        c = baseUri + "components/com_voterapp/assets/images/home.png";
        b = String(e.geometry.location).replace(/ /g, "");
        n = b.split(",");
        r = n[1] + "%2C" + n[0];
        l = r.replace(/[()]/g, "");
        $.getJSON(service.url(q), service.params).done(function(t) {
            //"https://gis.phila.gov/arcgis/rest/services/ElectionGeocoder/GeocodeServer/findAddressCandidates?Street=" + q + "&Single+Line+Input=&category=&outFields=division&maxLocations=United+States&outSR=&searchExtent=&location=&distance=&magicKey=&f=pjson&callback=?").done(function(t) {
            var u = 0;
            var i = '<table width=" 100%" cellspacing="0" cellpadding="3" id="multiple_address_tbl">';
            var s = '<table width=" 100%" cellspacing="0" cellpadding="3" id="multiple_address_tbl">';
            $.each(t.features, function(x, y) {
                i += '<tr><td><input type="radio" name="address_vals" value="' + y.properties.street_address + '">' + y.properties.street_address + "</td></tr>";
                if (y.match_type = "exact") {
                    u = u + 1;
                    s += '<tr><td><input type="radio" name="address_vals" value="' + y.properties.street_address + '">' + y.properties.street_address + "</td></tr>";
                }
            });
            i += '<tr><td><input type="radio" name="address_vals" value="-1">' + Joomla.JText._("MODALBOX LAST OPTION") + "</td></tr>";
            i += "</table>";
            s += '<tr><td><input type="radio" name="address_vals" value="-1">' + Joomla.JText._("MODALBOX LAST OPTION") + "</td></tr>";
            s += "</table>";
            var k = 0;
            if (u == 0 || u > 1) {
                if (u > 1) {
                    popupFunctionAddress(t, c, e, s);
                } else {
                    popupFunctionAddress(t, c, e, i);
                }
            } else {
                $.each(t.features, function(x, y) {
                    /*if (k < y.score) {
                        k = y.score;
                        wardDivision = y.properties.political_division;
                        e.geometry.location.A = y.geometry.coordinates[0];
                        e.geometry.location.F = y.geometry.coordinates[1];
                    }*/
                    wardDivision = y.properties.political_division;
                    e.geometry.location.A = y.geometry.coordinates[0];
                    e.geometry.location.F = y.geometry.coordinates[1];
                    bounds = new google.maps.LatLngBounds();
                    h = new google.maps.Marker({
                        map: map,
                        icon: c,
                        title: e.name,
                        position: e.geometry.location
                    });
                    bounds.extend(e.geometry.location);
                    startMarker = h;
                    markers.push(h);
                });
                if (!wardDivision || t.features.length === 0) {
                    invalidAddress();
                } else {
                    var v = wardDivision.substring(0, 2);
                    var w = wardDivision.substring(2, 4);
                    $.ajax({
                        type: "GET",
                        url: baseUri + "index.php",
                        data: {
                            option: "com_divisions",
                            view: "json",
                            division_id: wardDivision
                        },
                        dataType: "json",
                        async: false,
                        success: function(x) {
                            var z = {},
                                y;
                            $.each(x.features, function(A, B) {
                                z.id = B.attributes.division_id;
                                z.ward = v;
                                z.division = w;
                                z.congressionalDistrict = B.attributes.congressional_district;
                                z.stateSenateDistrict = B.attributes.state_senate_district;
                                z.stateRepresentativeDistrict = B.attributes.state_representative_district;
                                z.councilDistrict = B.attributes.council_district;
                                z.coordinates = [];
                                B.attributes.coordinates.split(" ").forEach(function(C) {
                                    z.coordinates.push(C.split(","));
                                });
                            });
                            runonce.populateDistrictSelectList(z);
                            y = function(A) {
                                $("option[value=" + A + "]").prop("disabled", false);
                            };
                            tabFunc(z);
                            getDivisionShape(wardDivision).done(function(A) {
                                drawMap([{
                                    name: A.name,
                                    coordinates: A.coordinates
                                }]);
                                y("DIVISION");
                            });
                            getWardShape(v).done(function(A) {
                                wardData = A;
                                y("WARD");
                            });
                            getCouncilShape(z.councilDistrict).done(function(A) {
                                councilData = A;
                                y("COUNCIL");
                            });
                            getStateRepShape(z.stateRepresentativeDistrict).done(function(A) {
                                stateRepData = A;
                                y("STATE_REP");
                            });
                            getStateSenateShape(z.stateSenateDistrict).done(function(A) {
                                stateSenateData = A;
                                y("STATE_SENATE");
                            });
                            getUsCongressShape(z.congressionalDistrict).done(function(A) {
                                usCongressData = A;
                                y("US_CONGRESS");
                            });
                        },
                        error: function(x, z, y) {
                            alert(z + " " + y);
                        }
                    });
                }
            }
        });
    }

    function getPollingPlace(a, j) {
        var i, f, e, d, h, b, k, l, c,
            pollingPlaceMain = $("#polling-place-main")
        i = f = e = d = h = b = k = l = c = null

        pollingPlaceMain.empty();
        $.ajax({
            type: "GET",
            url: baseUri + "index.php",
            data: {
                option: "com_pollingplaces",
                view: "json",
                ward: a,
                division: j
            },
            dataType: "json",
            async: false,
            success: function(m) {
                $.each(m.features, function(n, o) {
                    i = o.attributes.pin_address;
                    f = o.attributes.display_address;
                    e = o.attributes.zip_code;
                    d = o.attributes.intersection;
                    h = o.attributes.location;
                    h = h.toProperCase();
                    b = o.attributes.building;
                    l = o.attributes.parking;
                });
            },
            error: function(m, o, n) {
                alert(o + " " + n);
            }
        });
        pollingAddress = i + "," + e;
        if ($("#nav-polling-place").hasClass("active")) {
            dropPollingPin(pollingAddress, wardDivision);
        } else {
            if (mayorAddress) {
                dropOfficePin(mayorAddress);
            } else {
                alert(mayorAddress);
            }
        }
        k = buildingCodes[b];
        c = parkingCodes[l];

        var g = '<div id="polling-place-info"><h3 class="polling-place-info-header">' + Joomla.JText._("YOUR POLLING PLACE") + '</h3><div id="polling-place-info-container"><br><div id="polling-info-card"><strong>' + Joomla.JText._("WARD") + " " + a + " " + Joomla.JText._("DIVISION") + " " + j + "</strong><br><hr><strong>" + Joomla.JText._("P_LOCATION") + " </strong><br/>" + h + "<br/><br/><strong>" + Joomla.JText._("P_ADDRESS") + " </strong><br/>" + f + "<br/>Philadelphia, PA " + e + "<br/><br/><strong>" + Joomla.JText._("P_ACCESSIBILITY") + '</strong><br/><span id="polling-building">' + k + "</span><br/><br/><strong>" + Joomla.JText._("P_PARKING") + '</strong><br/><span id="polling-parking">' + c + '</span><br/></div><br /></div><h3 class="polling-place-directions-header">' + Joomla.JText._("DIRECTIONS") + '</h3><div id="polling-place-directions-container"><br><span id="walking-directions" class="directions">' + Joomla.JText._("WALKING") + '</span> | <span id="bicycling-directions" class="directions">' + Joomla.JText._("BICYCLING") + '</span> | <span id="driving-directions" class="directions">' + Joomla.JText._("DRIVING") + '</span><br /><div class="directions-text"></div></div></div>';
        if (wardDivisionIsNotMappable(wardDivision)) {
            g = '<div id ="polling-header"><h3>' + Joomla.JText._("YOUR POLLING PLACE") + '</h3></div><div><br><div id="polling-info-card-disclaimer"><br><p>' + Joomla.JText._("DISCLAIMER") + "</p></div>";
        }
        pollingPlaceMain.empty();
        pollingPlaceMain.html(g);
        $("#polling-place-info").accordion({
            header: "h3",
            collapsible: true
        });
    }

    function getOfficials(e, d, b, a, c, f) {
        $.ajax({
            type: "GET",
            url: baseUri + "index.php",
            data: {
                option: "com_electedofficials",
                view: "json",
                congressional_district: e,
                state_senate_district: d,
                state_representative_district: b,
                council_district: a
            },
            dataType: "json",
            async: false,
            success: function(g) {
                $(".office-accordion").find("dd").html("");
                $.each(g.officials, function(r, q) {
                    var h = guid(),
                        i = "",
                        j = q.office_level,
                        s = q.leadership_role,
                        o = q.office,
                        k = q.congressional_district,
                        x = q.state_senate_district,
                        w = q.state_representative_district,
                        v = q.council_district,
                        pinStyle = 'class="drop-office-pin"',
                        n = q.main_contact_address_1 + "," + q.main_contact_city + "," + q.main_contact_state + " " + q.main_contact_zip,
                        m = q.local_contact_1_address_1 + "," + q.local_contact_1_city + "," + q.local_contact_1_state + " " + q.local_contact_1_zip,
                        l = q.local_contact_2_address_1 + "," + q.local_contact_2_city + "," + q.local_contact_2_state + " " + q.local_contact_2_zip,
                        t = q.local_contact_3_address_1 + "," + q.local_contact_3_city + "," + q.local_contact_3_state + " " + q.local_contact_3_zip,
                        u = '';
                    if (q.first_name) {
                        i = q.first_name;
                    }
                    if (q.middle_name) {
                        i = i + " " + q.middle_name;
                    }
                    if (q.last_name) {
                        i = i + " " + q.last_name;
                    }
                    if (q.suffix) {
                        i = i + " " + q.suffix;
                    }
                    // <div id="more-' + h + '" class="more-info-div"><a href="javascript:void(0)" id="hide-more-link-' + h + '" onClick="hideMoreInfo(\'' + h + '\')" class="hide-more-link"><i class="icon-angle-left icon-3x"></i></a><strong style="font-size:11px;">' + i + "</strong> (" + party + ")<br>" + o + " " + s + "<br>";
                    u = '<div data-value="' + h + '" class="more-info-div"<span data-value="' + h + '" class="hide-more-link"><i class="icon-angle-left icon-3x"></i></span><strong style="font-size:11px;">' + i + '</strong> (' + q.party + ')<br>' + o + ' ' + s + '<br>';
                    if (q.email) {
                        u = u + '<br><a href="mailto:' + q.email + '" target="_top">' + Joomla.JText._("EMAIL") + ' <i class="icon-envelope-alt"></i></a>';
                    }
                    if (q.website) {
                        u = u + '<br><a href="https://' + q.website + '" target="_blank">' + Joomla.JText._("WEBSITE") + ' <i class="icon-external-link"></i></a>';
                    }
                    if (q.main_contact_address_1 || q.main_contact_address_2 || q.main_contact_phone || q.main_contact_fax || q.main_contact_city || q.main_contact_state || q.main_contact_zip) {
                        u = u + '<hr><h4><span data-value="' + n + '" ' + (q.main_contact_address_1 && q.main_contact_city == "Philadelphia" ? pinStyle : '') + '>' + Joomla.JText._("MAIN OFFICE") + ' <i class="icon-map-marker icon-large"></i></a></h4><br>';
                    }
                    if (q.main_contact_phone) {
                        u = u + "<strong>" + Joomla.JText._("PHONE") + '</strong> <span class="phone">' + q.main_contact_phone + "</span><br>";
                    }
                    if (q.main_contact_fax) {
                        u = u + "<strong>" + Joomla.JText._("FAX") + '</strong> <span class="phone">' + q.main_contact_fax + "</span><br>";
                    }
                    if (q.main_contact_address_1 || q.main_contact_address_2 || q.main_contact_city || q.main_contact_state || q.main_contact_zip) {
                        u = u + "<br><strong>" + Joomla.JText._("OFFICE_ADDRESS") + "</strong><br>";
                    }
                    if (q.main_contact_address_1) {
                        u = u + q.main_contact_address_1 + "<br>";
                    }
                    if (q.main_contact_address_2) {
                        u = u + q.main_contact_address_2 + "<br>";
                    }
                    if (q.main_contact_city) {
                        u = u + q.main_contact_city + ", " + q.main_contact_state + " " + q.main_contact_zip + "<br>";
                    }
                    if (q.local_contact_1_address_1 || q.local_contact_1_address_2 || q.local_contact_1_phone || q.local_contact_1_fax || q.local_contact_1_city || q.local_contact_1_state || q.local_contact_1_zip) {
                        u = u + '<hr><h4><span data-value="' + m + '" ' + (q.local_contact_1_address_1 && q.local_contact_1_city == "Philadelphia" ? pinStyle : '') + '>' + Joomla.JText._("LOCAL OFFICE") + ' <i class="icon-map-marker icon-large"></i></a></h4><br>';
                    }
                    if (q.local_contact_1_phone) {
                        u = u + "<strong>" + Joomla.JText._("PHONE") + '</strong> <span class="phone">' + q.local_contact_1_phone + "</span><br>";
                    }
                    if (q.local_contact_1_fax) {
                        u = u + "<strong>" + Joomla.JText._("FAX") + '</strong> <span class="phone">' + q.local_contact_1_fax + "</span><br>";
                    }
                    if (q.local_contact_1_address_1 || q.local_contact_1_address_2 || q.local_contact_1_city || q.local_contact_1_state || q.local_contact_1_zip) {
                        u = u + "<br><strong>" + Joomla.JText._("OFFICE_ADDRESS") + "</strong><br>";
                    }
                    if (q.local_contact_1_address_1) {
                        u = u + q.local_contact_1_address_1 + "<br>";
                    }
                    if (q.local_contact_1_address_2) {
                        u = u + q.local_contact_1_address_2 + "<br>";
                    }
                    if (q.local_contact_1_city) {
                        u = u + q.local_contact_1_city + ", " + q.local_contact_1_state + " " + q.local_contact_1_zip + "<br>";
                    }
                    if (q.local_contact_2_address_1 || q.local_contact_2_address_2 || q.local_contact_2_phone || q.local_contact_2_fax || q.local_contact_2_city || q.local_contact_2_state || q.local_contact_2_zip) {
                        u = u + '<hr><h4><span data-value="' + l + '" ' + (q.local_contact_2_address_1 && q.local_contact_2_city == "Philadelphia" ? pinStyle : '') + '>' + Joomla.JText._("LOCAL OFFICE") + ' <i class="icon-map-marker icon-large"></i></a></h4><br>';
                    }
                    if (q.local_contact_2_phone) {
                        u = u + "<strong>" + Joomla.JText._("PHONE") + '</strong> <span class="phone">' + q.local_contact_2_phone + "</span><br>";
                    }
                    if (q.local_contact_2_fax) {
                        u = u + "<strong>" + Joomla.JText._("FAX") + '</strong> <span class="phone">' + q.local_contact_2_fax + "</span><br>";
                    }
                    if (q.local_contact_2_address_1 || q.local_contact_2_address_2 || q.local_contact_2_city || q.local_contact_2_state || q.local_contact_2_zip) {
                        u = u + "<br><strong>" + Joomla.JText._("OFFICE_ADDRESS") + "</strong><br>";
                    }
                    if (q.local_contact_2_address_1) {
                        u = u + q.local_contact_2_address_1 + "<br>";
                    }
                    if (q.local_contact_2_address_2) {
                        u = u + q.local_contact_2_address_2 + "<br>";
                    }
                    if (q.local_contact_2_city) {
                        u = u + q.local_contact_2_city + ", " + q.local_contact_2_state + " " + q.local_contact_2_zip + "<br>";
                    }
                    if (q.local_contact_3_address_1 || q.local_contact_3_address_2 || q.local_contact_3_phone || q.local_contact_3_fax || q.local_contact_3_city || q.local_contact_3_state || q.local_contact_3_zip) {
                        u = u + '<hr><h4><span data-value="' + t + '" ' + (q.local_contact_3_address_1 && q.local_contact_3_city == "Philadelphia" ? pinStyle : '') + '>' + Joomla.JText._("LOCAL OFFICE") + ' <i class="icon-map-marker icon-large"></i></a></h4><br>';
                    }
                    if (q.local_contact_3_phone) {
                        u = u + "<strong>" + Joomla.JText._("PHONE") + '</strong> <span class="phone">' + q.local_contact_3_phone + "</span><br>";
                    }
                    if (q.local_contact_3_fax) {
                        u = u + "<strong>" + Joomla.JText._("FAX") + '</strong> <span class="phone">' + q.local_contact_3_fax + "</span><br>";
                    }
                    if (q.local_contact_3_address_1 || q.local_contact_3_address_2 || q.local_contact_3_city || q.local_contact_3_state || q.local_contact_3_zip) {
                        u = u + "<br><strong>" + Joomla.JText._("OFFICE_ADDRESS") + "</strong><br>";
                    }
                    if (q.local_contact_3_address_1) {
                        u = u + q.local_contact_3_address_1 + "<br>";
                    }
                    if (q.local_contact_3_address_2) {
                        u = u + q.local_contact_3_address_2 + "<br>";
                    }
                    if (q.local_contact_3_city) {
                        u = u + q.local_contact_3_city + ", " + q.local_contact_3_state + " " + q.local_contact_3_zip + "<br>";
                    }
                    u = u + "</div>";
                    var p = '<div id="basic-' + h + '" class="basic-official-info"><strong style="font-size:11px;">' + i + "</strong> (" + q.party + ")<br>" + o + " " + s + "<br>";
                    if (q.email) {
                        p = p + '<br><a href="mailto:' + q.email + '" target="_top">' + Joomla.JText._("EMAIL") + ' <i class="icon-envelope-alt"></i></a>';
                    }
                    if (q.website) {
                        p = p + '<br><a href="https://' + q.website + '" target="_blank">' + Joomla.JText._("WEBSITE") + ' <i class="icon-external-link"></i></a>';
                    }
                    p = p + '<br><span data-value="' + h + '" class="more-info">' + Joomla.JText._("MORE INFORMATION") + ' <i class="icon-angle-right"></i></a><hr></div>';
                    $(officeToId[o]).append(p);
                    $(officeToId[o]).append(u);
                    if (o === "Mayor") {
                        mayorAddress = n;
                    }
                    $(".phone").text(function(y, z) {
                        return z.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
                    });
                });
                getPollingPlace(c, f);
            },
            error: function(g, i, h) {
                alert(i + " " + h);
            }
        });
    }

    function getLShapeFromService(input, service) {
        var deferred = $.Deferred()
        $.getJSON(service.url(input), service.params).done(function(response) {
            if (response.features) {
                deferred.resolve({
                    geoJSON: {
                        type: "Feature",
                        properties: {
                            name: input
                        },
                        geometry: {
                            type: "Polygon",
                            coordinates: [response.features[0].geometry.coordinates[0]]
                        }
                    },
                    style: {
                        style: service.style,
                    }
                })
            } else {
                deferred.reject()
            }
        })
        return deferred.promise()
    }

    function getShapeFromService(input, service) {
        var deferred = $.Deferred()
        $.getJSON(service.url(input), service.params).done(function(response) {
            if (response.features) {
                deferred.resolve({
                    coordinates: [response.features[0].geometry.coordinates[0]],
                    color: service.style.color,
                    name: input
                })
            } else {
                deferred.reject()
            }
        })
        return deferred.promise()
    }

    function getDivisionShape(input) {
        var deferred = $.Deferred(),
            service = services.shape_city_division
        $.getJSON(service.url(input), service.params).done(function(c) {
            if (c.features) {
                deferred.resolve({
                    coordinates: c.features[0].geometry.coordinates[0],
                    color: "#FF0000",
                    name: input
                });
            } else {
                deferred.reject();
            }
        });
        return deferred.promise();
    }

    function getWardShape(input) {
        var deferred = $.Deferred(),
            service = services.shape_city_ward
        $.getJSON(service.url(input), service.params).done(function(c) {
            if (c.features) {
                deferred.resolve({
                    coordinates: c.features[0].geometry.coordinates[0],
                    color: "#0000FF",
                    name: input
                });
            } else {
                deferred.reject();
            }
        });
        return deferred.promise();
    };

    function getCouncilShape(input) {
        var deferred = $.Deferred(),
            service = services.shape_city_district
        $.getJSON(service.url(input), service.params).done(function(c) {
            if (c.features) {
                deferred.resolve({
                    coordinates: c.features[0].geometry.coordinates[0],
                    color: "#0D912E",
                    name: input
                });
            } else {
                deferred.reject();
            }
        });
        return deferred.promise();
    };

    function getStateRepShape(input) {
        var deferred = $.Deferred(),
            service = services.shape_state_house
        $.getJSON(service.url(input), service.params).done(function(c) {
            if (c.features) {
                deferred.resolve({
                    coordinates: c.features[0].geometry.coordinates[0],
                    color: "#751675",
                    name: input
                });
            } else {
                deferred.reject();
            }
        });
        return deferred.promise();
    };

    function getStateSenateShape(input) {
        var deferred = $.Deferred(),
            service = services.shape_state_senate
        $.getJSON(service.url(input), service.params).done(function(c) {
            if (c.features) {
                deferred.resolve({
                    coordinates: c.features[0].geometry.coordinates[0],
                    color: "#875010",
                    name: input
                });
            } else {
                deferred.reject();
            }
        });
        return deferred.promise();
    };

    function getUsCongressShape(input) {
        var deferred = $.Deferred(),
            service = services.shape_federal_house
        $.getJSON(service.url(input), service.params).done(function(c) {
            if (c.features) {
                deferred.resolve({
                    coordinates: c.features[0].geometry.coordinates[0],
                    color: "#0C727D",
                    name: parseInt(input).toString()
                });
            } else {
                deferred.reject();
            }
        });
        return deferred.promise();
    };
    // end ajax functions

    // map functions
    function clearShapes() {
        shapes.forEach(function(a) {
            a.setMap(null);
        });
        labels.forEach(function(a) {
            a.close();
        });
        shapes = [];
        labels = [];
    }

    function resetBounds() {
        bounds = new google.maps.LatLngBounds();
    }

    function drawMap(a, b) {
        if (!b) {
            clearShapes();
        }
        a.forEach(function(d) {
            var h = [];
            var f = getPolygonCentroid(d.coordinates);
            d.coordinates.forEach(function(j) {
                var i = new google.maps.LatLng(j[1], j[0]);
                h.push(i);
                bounds.extend(i);
            });
            if (!d.color) {
                d.color = "#FF0000";
            }
            var c = new google.maps.Polygon({
                paths: h,
                strokeColor: d.color,
                strokeOpacity: .8,
                strokeWeight: 2,
                fillColor: d.color,
                fillOpacity: .3,
                clickable: false,
                map: map
            });
            var e = {
                content: d.name,
                position: f,
                closeBoxURL: "",
                boxStyle: {
                    textAlign: "center",
                    fontSize: "12px",
                    backgroundColor: d.color,
                    color: "#fff",
                    padding: "2px"
                }
            };
            var g = new InfoBox(e);
            labels.push(g);
            g.open(map);
            shapes.push(c);
        });
        map.fitBounds(bounds);
    }

    function dropOfficePin(b) {
        for (var a = 2; a < markers.length; a++) {
            markers[a].setMap(null);
        }
        geocoder.geocode({
            address: b
        }, function(e, d) {
            if (d == google.maps.GeocoderStatus.OK) {
                bounds = new google.maps.LatLngBounds();
                bounds.extend(e[0].geometry.location);
                map.fitBounds(bounds);
                var f = google.maps.event.addListener(map, "idle", function() {
                    if (map.getZoom() > 16) {
                        map.setZoom(16);
                    }
                    google.maps.event.removeListener(f);
                });
                var g = baseUri + "components/com_voterapp/assets/images/congress.png";
                var c = new google.maps.Marker({
                    map: map,
                    icon: g,
                    animation: google.maps.Animation.DROP,
                    position: e[0].geometry.location,
                    title: ""
                });
                markers.push(c);
            } else {
                alert("Geocode of office location was not successful for the following reason: " + d);
            }
        });
    }

    function dropPollingPin(c) {
        if (getHash() === "elected-officials") {
            for (var b = 1, a; a = markers[b]; b++) {
                a.setMap(null);
            }
        }
        bounds = new google.maps.LatLngBounds();
        geocoder.geocode({
            address: c
        }, function(f, e) {
            if (e === google.maps.GeocoderStatus.OK) {
                bounds.extend(f[0].geometry.location);
                map.fitBounds(bounds);
                pollingBounds = bounds;
                var g = google.maps.event.addListener(map, "idle", function() {
                    if (map.getZoom() > 16) {
                        map.setZoom(16);
                    }
                    google.maps.event.removeListener(g);
                });
                var h = baseUri + "components/com_voterapp/assets/images/polling.png";
                var d = new google.maps.Marker({
                    map: map,
                    icon: h,
                    animation: google.maps.Animation.DROP,
                    position: f[0].geometry.location,
                    title: ""
                });
                if (wardDivisionIsNotMappable(wardDivision)) {
                    d.setVisible(false);
                }
                endMarker = d;
                markers.push(d);
            } else {
                alert("Geocode of polling place was not successful for the following reason: " + e);
            }
        });
    }

    function reCenterMap() {
        map.setCenter(new google.maps.LatLng(39.95, -75.1642));
    }

    function popupFunctionAddress(c, d, a, b) {
        $("#multiple_address_tbl").html(b);
        $("#cstm-score-address-popup").dialog({
            modal: true,
            buttons: {
                Ok: function() {
                    if ($('[name="address_vals"]').is(":checked")) {
                        var e = $("input:radio[name=address_vals]:checked").val();
                        $("#cstm-score-address-popup").dialog("close");
                        if (e == "-1") {
                            $("#target").val("");
                        } else {
                            $.each(c.candidates, function(g, h) {
                                if (e == h.address) {
                                    previous_score = h.score;
                                    wardDivision = h.attributes.division;
                                    a.geometry.location.A = h.location.y;
                                    a.geometry.location.F = h.location.x;
                                }
                                var f = e + ", Philadelphia, PA, United States";
                                $("#target").val(f);
                                marker = new google.maps.Marker({
                                    map: map,
                                    icon: d,
                                    title: a.name,
                                    position: a.geometry.location
                                });
                                bounds = new google.maps.LatLngBounds();
                                bounds.extend(a.geometry.location);
                                startMarker = marker;
                                markers.push(marker);
                            });
                            if (!wardDivision || c.candidates.length === 0) {
                                invalidAddress();
                            } else {
                                byPassGoogle();
                            }
                        }
                    } else {
                        tips = $(".validateTips");
                        tips.text("Please select at least one Address").addClass("ui-state-highlight");
                        setTimeout(function() {
                            tips.removeClass("ui-state-highlight", 1500);
                        }, 500);
                    }
                }
            }
        });
    }
    // end map functions

    // ui functions
    function showInfos() {
        $("#polling-place-intro").hide();
        $("#polling-place-info").show();
        $("#elected-officials-intro").hide();
        $("#elected-officials-info").show();
        $("#maps-intro").hide();
        $("#maps-info").show();
    }

    function addressIsProvided(a) {
        return a.value && a.value !== $(a).attr("placeholder") && a.value !== "Enter a query";
    }

    function addDistrictToList(a, d, c, b) {
        a.append($("<option />").text(d).val(c).prop("disabled", !!b));
    }

    runonce.populateDistrictSelectList = function(b) {
        var a = $("#maps-district-type");
        a.empty();
        addDistrictToList(a, "Division " + b.ward + b.division, "DIVISION");
        addDistrictToList(a, "Ward " + b.ward, "WARD", true);
        addDistrictToList(a, "City Council District " + b.councilDistrict, "COUNCIL", true);
        addDistrictToList(a, "State Rep District " + b.stateRepresentativeDistrict, "STATE_REP", true);
        addDistrictToList(a, "State Senate District " + b.stateSenateDistrict, "STATE_SENATE", true);
        addDistrictToList(a, "US Congress PA-" + b.congressionalDistrict, "US_CONGRESS", true);
        runonce.populateDistrictSelectList = function() {}
    }

    runonce.bindDistrictSelectEvent = function(b) {
        var a = $("#maps-district-type");
        a.unbind("change");
        a.change(function() {
            resetBounds();
            switch (a.val()) {
                case "DIVISION":
                    drawMap([b]);
                    break;

                case "WARD":
                    drawMap([wardData]);
                    break;

                case "COUNCIL":
                    drawMap([councilData]);
                    break;

                case "STATE_REP":
                    drawMap([stateRepData]);
                    break;

                case "STATE_SENATE":
                    drawMap([stateSenateData]);
                    break;

                case "US_CONGRESS":
                    drawMap([usCongressData]);
                    break;

                default:
                    break;
            }
        });
        runonce.bindDistrictSelectEvent = function() {}
    }

    function tabFunc(a) {
        resetBounds();
        return tabFunctions[$("#nav").find("li.active").attr("id")](a);
    }

    function getPolygonCentroid(m) {
        var d = 0,
            h = 0,
            g = 0,
            a = m.length,
            l, k, e;
        for (var c = 0, b = a - 1; c < a; b = c++) {
            l = m[c];
            k = m[b];
            var p1x = parseFloat(l[0]);
            var p1y = parseFloat(l[1]);
            var p2x = parseFloat(k[0]);
            var p2y = parseFloat(k[1]);
            e = p1x * p2y - p2x * p1y;
            d += e;
            h += (p1x + p2x) * e;
            g += (p1y + p2y) * e;
        }
        e = d * 3;
        return new google.maps.LatLng(g / e, h / e);
    }

    function getHash() {
        return window.location.hash.substring(1);
    }

    function setMapOptionsForPrint(a) {
        map.setOptions({
            mapTypeControl: !a,
            zoomControl: !a,
            streetViewControl: !a,
            panControl: !a
        });
    }

    function printMapInIE() {
        var a = function() {
            setMapOptionsForPrint(true);
            var b = $("#map-canvas"),
                c = b.height(),
                d = b.width(),
                info = $("#maps-custom-info, #maps-info"),
                lcol = $(".leftmenu .col2"),
                art = $(".art-bar, .art-nav, .art-header, .art-header-inner, .art-nav-outer, .art-page-footer");
            art.hide();
            info.hide();
            lcol.hide();
            b.width(d * 2);
            b.height(c * 1.5);
            document.window.print();
            b.height(c);
            b.width(d);
            info.show();
            art.show();
            lcol.show();
            setMapOptionsForPrint(false);
        };
        setTimeout(a, 500);
    }

    function printMapInOther() {
        setMapOptionsForPrint(true);
        var a = function() {
            var f = [];
            $("#map-canvas canvas").filter(function() {
                f.push(this.toDataURL("image/png"));
            });
            var c = document.getElementById("map-canvas");
            var g = c.cloneNode(true);
            var e = c.clientWidth;
            var b = c.clientHeight;
            $(g).find("canvas").each(function(h, j) {
                $(j).replaceWith($("<img>").attr("src", f[h])).css("position", "absolute").css("left", "0").css("top", "0").css("width", e + "px").css("height", b + "px");
            });
            var d = window.open("", "PrintMap", "width=" + e + ",height=" + b);
            if (d) {
                d.document.writeln($(g).html());
                d.document.close();
                d.focus();
                d.print();
                d.close();
                setMapOptionsForPrint(false);
            }
        };
        setTimeout(a, 500);
    };

    function printMap() {
        if (ie && ie[1] < 9) {
            printMapInIE();
        } else {
            printMapInOther();
        }
    };

    function setDirectionsText(a) {
        var b = $("div.directions-text"),
            c = $("<table></table>");
        b.empty();
        $.each(a, function(d, e) {
            $.each(e.steps, function(f, g) {
                var h = $("<tr></tr>");
                h.append($("<td></td>").addClass("step-num").append(f + 1 + "."));
                h.append($("<td></td>").append($("<span></span>").addClass("directions-text-segment").append(g.instructions)));
                h.append($("<td></td>").addClass("distance").append($("<span></span>").addClass("directions-text-segment-distance").append(g.distance.text)));
                c.append(h);
            });
        });
        b.append(c);
        b.show();
    }

    // my utils
    function grouper(markers) {
        var group = new L.featureGroup(markers)
        lmap.fitBounds(group.getBounds())
    }

    function coordsSwap(coords) {
        var tmp = []
        for (var i = 0; i < coords.length - 1; i++) {
            tmp.push([coords[i][1], coords[i][0]])
        }
        return tmp
    }

    function pad(n, width, z) {
        n = n + '' // cast to string
        z = z || '0' // default padding: '0'
        width = width || 2 // default digits: 2
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
    }

    function s4() {
        return Math.floor((1 + Math.random()) * 65536).toString(16).substring(1);
    }

    function guid() {
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
    }

    function wardDivisionIsNotMappable(a) {
        return false;
    }

    function invalidAddress() {
        wardDivision = "";
        alert("The address you have chosen is invalid. Please select an address in Philadelphia.");
    }

    function setupMultipleSelects() {
        var b = function(c, d) {
            return d.toUpperCase().indexOf(c.toUpperCase()) == 0;
        };
        var a = {
            matcher: b
        };
        $("#custom-divisions").select2(a);
        $("#custom-wards").select2(a);
        $("#custom-council-districts").select2(a);
        $("#custom-parep-districts").select2(a);
        $("#custom-pasen-districts").select2(a);
        $("#custom-uscongress-districts").select2(a);
    }

    function clearCustomMap() {
        $(".custom-map-selector").val([]).change();
    }

    function updateCustomMap() {
        clearShapes();
        reCenterMap();
        var f = [],
            d = function(j, l) {
                var k = $.map(j.select2("data"), function(m) {
                    return m.text;
                });
                if (k) {
                    if (k[0] === "ALL") {
                        k = $.map(j.children(), function(m) {
                            var n = $(m).val();
                            if (n !== "ALL") {
                                return n;
                            }
                        });
                    }
                    k.forEach(function(m) {
                        f.push(l(m));
                    });
                }
            },
            h = $("#custom-divisions"),
            i = $("#custom-wards"),
            a = $("#custom-council-districts"),
            b = $("#custom-parep-districts"),
            g = $("#custom-pasen-districts"),
            c = $("#custom-uscongress-districts"),
            e = [
                [h, getDivisionShape],
                [i, getWardShape],
                [a, getCouncilShape],
                [b, getStateRepShape],
                [g, getStateSenateShape],
                [c, getUsCongressShape]
            ];
        e.forEach(function(j) {
            d(j[0], j[1]);
        });
        if (f.length) {
            $("#maps-intro").show();
            $("#maps-info").hide();
        }
        $.when.apply($, f).then(function() {
            var j = Array.prototype.slice.call(arguments);
            if (j.length > 0) {
                resetBounds();
                drawMap(j, true);
            }
        });
    }

    function getSampleBallot(a, j) {
        var c = a + "-" + j;
        var l = $("#download-ballot-intro");
        if (typeof ward_divisions_files === "undefined" || !ward_divisions_files) {
            var o = "<h3>" + getMessageAndText("DOWNLOAD BALLOT INTRO HEADER NO BALLOT") + "</h3><br/><p>" + getMessageAndText("DOWNLOAD BALLOT INTRO TEXT NO BALLOT") + "</p>";
            $(l).html(o);
            $("#sample-pdf").html("");
            return;
        }
        if (typeof ward_divisions_files[c] !== "undefined") {
            if (typeof ward_divisions_files[c].file_id !== "undefined") {
                if (ward_divisions_files[c].file_id != "") {
                    var m = baseUri + "ballot_paper/" + ward_divisions_files[c].file_id + ".pdf";
                    var f = '<object width="100%" height="100%" data="' + m + '?#zoom=0&amp;scrollbar=1&amp;toolbar=0&amp;navpanes=0" type="application/pdf">NO PDF FOUND</object>';
                    $("#sample-pdf").html(f);
                    var o = "<h3>" + getMessageAndText("DOWNLOAD BALLOT INTRO HEADER AFTER") + "</h3><br/><p>" + getMessageAndText("DOWNLOAD BALLOT INTRO TEXT AFTER") + '</p><br/><a href="' + baseUri + "ballot_paper/" + ward_divisions_files[c].file_id + '.pdf" target="_blank" class="showPDF">' + getMessageAndText("DOWNLOAD BALLOT BUTTON TEXT") + "</a>";
                    $(l).html(o);
                    var d = [];
                    var b = [];
                    $.each(ward_divisions_files, function(p, q) {
                        if (d.indexOf(q.sid) === -1) {
                            d.push(q.sid);
                            b.push(p);
                        }
                    });
                    var h = "";
                    if (d.length > 1) {
                        h += '<select id="ballots_dropdown" name="ballots_dropdown"  ><option value="">' + getMessageAndText("DOWNLOAD BALLOT EMPTY DROPDOWN TEXT") + "</option>";
                        var k = {},
                            n = [];
                        for (var e = 0; e < b.length; e++) {
                            if (ward_divisions_files[b[e]].file_id != ward_divisions_files[c].file_id) {
                                n.push(ward_divisions_files[b[e]].sid);
                                k[ward_divisions_files[b[e]].sid] = ward_divisions_files[b[e]].file_id;
                            }
                        }
                        n.sort().forEach(function(p) {
                            h += '<option value="' + k[p] + '">Spilt ' + p + "</option>";
                        });
                        h += '</select>&nbsp;&nbsp;<button id="show-me" value="Show Me" name="Show Me">' + getMessageAndText("SHOW ME TEXT") + "</button>";
                    }
                    var g = "<h3>" + getMessageAndText("OTHER SAMPLE BALLOTS HEADER") + "</h3><br/><p>" + getMessageAndText("OTHER SAMPLE BALLOTS TEXT") + "</p><br/>" + h;
                    $("#download-ballot-info").html(g);
                    $("#download-ballot-info").show();
                    return;
                }
            }
        }
        var o = "<h3>" + getMessageAndText("DOWNLOAD BALLOT INTRO HEADER NO BALLOT") + "</h3><br/><p>" + getMessageAndText("DOWNLOAD BALLOT INTRO TEXT NO BALLOT") + "</p>";
        $(l).html(o);
        $("#sample-pdf").html("");
        $(el).attr("href", "javascript:void(0)");
        $(el).attr("target", "");
    }

    function getMessageAndText(b) {
        var a = {
            "DOWNLOAD BALLOT INTRO TEXT NO BALLOT": Joomla.JText._("DOWNLOAD BALLOT INTRO TEXT NO BALLOT"),
            "OTHER SAMPLE BALLOTS TEXT": Joomla.JText._("OTHER SAMPLE BALLOTS TEXT"),
            "OTHER SAMPLE BALLOTS HEADER": Joomla.JText._("OTHER SAMPLE BALLOTS HEADER"),
            "DOWNLOAD BALLOT INTRO TEXT AFTER": Joomla.JText._("DOWNLOAD BALLOT INTRO TEXT AFTER"),
            "DOWNLOAD BALLOT INTRO HEADER AFTER": Joomla.JText._("DOWNLOAD BALLOT INTRO HEADER AFTER"),
            "DOWNLOAD BALLOT INTRO HEADER": Joomla.JText._("DOWNLOAD BALLOT INTRO HEADER"),
            "OTHER SAMPLE BALLOTS HEADER": Joomla.JText._("OTHER SAMPLE BALLOTS HEADER"),
            "DOWNLOAD BALLOT INTRO HEADER NO BALLOT": Joomla.JText._("DOWNLOAD BALLOT INTRO HEADER NO BALLOT"),
            "DOWNLOAD BALLOT BUTTON TEXT": Joomla.JText._("DOWNLOAD BALLOT BUTTON TEXT"),
            "DOWNLOAD BALLOT EMPTY DROPDOWN TEXT": Joomla.JText._("DOWNLOAD BALLOT EMPTY DROPDOWN TEXT"),
            "SHOW ME TEXT": Joomla.JText._("SHOW ME TEXT")
        };
        return a[b];
    }

    function showBallotDropdown() {
        var b = $("#ballots_dropdown").val();
        if (b != "") {
            var a = baseUri + "ballot_paper/" + b + ".pdf";
            var c = window.open(a, "_blank");
            c.focus();
        } else {
            alert();
        }
    }

    function getQueryParams(a) {
        a = a.split("+").join(" ");
        var d = {},
            c, b = /[?&]?([^=]+)=([^&]*)/g;
        while (c = b.exec(a)) {
            d[decodeURIComponent(c[1])] = decodeURIComponent(c[2]);
        }
        return d;
    }

    function tabsReset() {
        clearShapes();
        $("#nav-elected-officials").removeClass("active");
        $("#nav-polling-place").removeClass("active");
        $("#nav-maps").removeClass("active");
        $("#nav-download-ballot").removeClass("active");
        $("#polling-place").hide();
        $("#elected-officials").hide();
        $("#maps").hide();
        $("#download-ballot").hide();
    }

    function showTabElectedOfficials() {
        tabsReset();
        $("#nav-elected-officials").addClass("active");
        $("#elected-officials").show();
        $("#print-map").css({
            display: "inline",
            position: "absolute"
        });
        addressEntered(2);
    }

    function showTabPollingplace() {
        tabsReset();
        $("#nav-polling-place").addClass("active");
        $("#polling-place").show();
        $("#print-map").css({
            display: "inline",
            position: "absolute"
        });
        addressEntered(2);
    }

    function showTabMaps() {
        tabsReset();
        $("#nav-maps").addClass("active");
        $("#maps").show();
        $("#print-map").css({
            display: "inline",
            position: "absolute"
        });
        if (runonce.populateSelect2Lists) {
            populateSelect2Lists("#custom-divisions", divisions, "division_id", baseUri + "index.php?option=com_divisions&view=all");
            populateSelect2Lists("#custom-wards", wards, "ward", baseUri + "index.php?option=com_divisions&view=ward");
            populateSelect2Lists("#custom-council-districts", councilDistricts, "council_district", baseUri + "index.php?option=com_divisions&view=council");
            populateSelect2Lists("#custom-parep-districts", paRepDistricts, "state_representative_district", baseUri + "index.php?option=com_divisions&view=parep");
            populateSelect2Lists("#custom-pasen-districts", paRepDistricts, "state_senate_district", baseUri + "index.php?option=com_divisions&view=pasenate");
            populateSelect2Lists("#custom-uscongress-districts", usCongressDistricts, "congressional_district", baseUri + "index.php?option=com_divisions&view=uscongress");
        }
        runonce.populateSelect2Lists = false
        addressEntered(2);
    }

    function showTabBallot() {
        tabsReset();
        $("#nav-download-ballot").addClass("active");
        $("#download-ballot").show();
        $("#print-map").hide();
        addressEntered(2);
    }

    function populateSelect2Lists(o, p, r, q) {
        var s = $(o);
        if (p) {
            if ("#custom-divisions" !== o) {
                s.append($("<option>").text("ALL"));
            }
            p.forEach(function(t) {
                s.append($("<option>").text(t[r]));
            });
            s.prop("disabled", false);
        } else {
            $.getJSON(q).done(function(t) {
                p = t;
                populateSelect2Lists(o, p, r, q);
            });
        }
    }

    // settings and initialization
    $.support.cors = true;

    String.prototype.toProperCase = function() {
        return this.replace(/\w\S*/g, function(a) {
            return a.charAt(0).toUpperCase() + a.substr(1).toLowerCase();
        });
    };

    function onhashChange() {
        var hash = getHash();
        switch (hash) {
            case "elected-officials":
                showTabElectedOfficials();
                break;
            case "polling-place":
                showTabPollingplace();
                break;
            case "maps":
                showTabMaps();
                break;
            case "ballots":
                showTabBallot();
                break;
        }
    }

    /* see above */
    function initialize() {
        onhashChange();
        geocoder = new google.maps.Geocoder();
        map = new google.maps.Map(document.getElementById("map-canvas"), {
            center: new google.maps.LatLng(39.95, -75.1642),
            zoom: 12,
            streetViewControl: true,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });
        var target = document.getElementById("target");
        searchBox = new google.maps.places.SearchBox(target);
        var bounds = new google.maps.LatLngBounds(new google.maps.LatLng(39.96225, -75.1642));
        searchBox = new google.maps.places.SearchBox(target, {
            bounds: bounds
        });
        markers = [];
        google.maps.event.addListener(searchBox, "places_changed", function() {
            showInfos();
            addressEntered(1);
        });
        google.maps.event.addListener(map, "bounds_changed", function() {
            var newBounds = map.getBounds();
            searchBox.setBounds(newBounds);
        });
        var params = getQueryParams(document.location.search);
        if (typeof params.address !== "undefined") {
            target.value = params.address;
            /*
            setTimeout(function() {
                //addressEntered(1)
                $('.pac-item')[0].click();
            }, 250);
            */
            var listener = google.maps.event.addListener(map, "idle", function() {
                target.focus();
                google.maps.event.trigger(searchBox, "bounds_changed");
                google.maps.event.removeListener(listener);
            });
        }
    }

    // events
    if (document.addEventListener) {
        window.addEventListener("hashchange", onhashChange, false);
    } else if (document.attachEvent) {
        window.attachEvent("onhashchange", onhashChange);
    }

    $(document).on('click', ".office-level-accordion > dt > a", function() {
        $(".office-level-accordion > dd").slideUp();
        if ($(this).hasClass("active")) {
            $(this).removeClass("active");
        } else {
            $(this).parent().next().slideDown();
            $(this).addClass("active");
        }
        return false;
    });
    $(document).on('click', ".office-accordion > dt > a", function() {
        $(".office-accordion > dd").slideUp();
        if ($(this).hasClass("active")) {
            $(this).removeClass("active");
        } else {
            $(this).parent().next().slideDown();
            $(this).addClass("active");
        }
        return false;
    });
    $(document).on("click", "#show-me", function() {
        showBallotDropdown();
    });
    $(document).on("click", "#print-map", function() {
        printMap();
    });
    $(document).on("click", "#nav-polling-place", function() {
        showTabPollingplace(wardDivision);
    });
    $(document).on("click", "#nav-elected-officials", function() {
        showTabElectedOfficials();
        $(".office-accordion > dd").hide();
        $(".office-level-accordion > dd").hide();
        $("#local-accordion").slideDown();
        $("#mayor").slideDown();
        if (mayorAddress) {
            dropOfficePin(mayorAddress);
        }
    });
    $(document).on("click", "#nav-maps", function() {
        showTabMaps()
    });
    $(document).on("click", "#nav-download-ballot", function() {
        showTabBallot();
    });
    $(document).on('change', ".custom-map-selector", function(p) {
        var o = $(p.target);
        var q = $.map(o.select2("data"), function(r) {
            return r.text;
        });
        $.each(q, function(s, r) {
            if (p.added && p.added.text === "ALL") {
                if (r !== "ALL") {
                    q.splice(s, 1);
                }
            } else {
                if (r === "ALL") {
                    q.splice(s, 1);
                }
            }
        });
        o.select2("val", q);
        updateCustomMap();
    });
    $(document).on('click', "span.hide-more-link", function() {
        var $this = $(this),
            $more = $('div.more-info-div[data-value=' + $this.data('value') + ']')
        $more.hide();
        $this.parent().siblings(".basic-official-info").fadeIn("slow");
    });
    $(document).on('click', "span.drop-office-pin", function() {
        dropOfficePin($(this).data('value'))
    });
    $(document).on('click', "span.more-info", function() {
        var $this = $(this),
            $more = $('div.more-info-div[data-value=' + $this.data('value') + ']')
        $this.parent().hide();
        $more.parent().scrollTop(0);
        $this.parent().siblings().hide();
        $more.fadeIn("slow");
    });
    $(document).on('click', "#walking-directions", function() {
        $(this).addClass("active");
        $("#driving-directions").removeClass("active");
        $("#bicycling-directions").removeClass("active");
        var m = {
            origin: startMarker.getPosition(),
            destination: endMarker.getPosition(),
            travelMode: google.maps.DirectionsTravelMode.WALKING
        };
        directionsService.route(m, function(n, o) {
            if (o === google.maps.DirectionsStatus.OK) {
                directionsRenderer.setMap(map);
                directionsRenderer.setDirections(n);
                setDirectionsText(n.routes[0].legs);
            }
        });
        return false;
    });
    $(document).on('click', "#driving-directions", function() {
        $(this).addClass("active");
        $("#walking-directions").removeClass("active");
        $("#bicycling-directions").removeClass("active");
        var m = {
            origin: startMarker.getPosition(),
            destination: endMarker.getPosition(),
            travelMode: google.maps.DirectionsTravelMode.DRIVING
        };
        directionsService.route(m, function(n, o) {
            if (o === google.maps.DirectionsStatus.OK) {
                directionsRenderer.setMap(map);
                directionsRenderer.setDirections(n);
                setDirectionsText(n.routes[0].legs);
            }
        });
        return false;
    });
    $(document).on('click', "#bicycling-directions", function() {
        $(this).addClass("active");
        $("#driving-directions").removeClass("active");
        $("#walking-directions").removeClass("active");
        var m = {
            origin: startMarker.getPosition(),
            destination: endMarker.getPosition(),
            travelMode: google.maps.DirectionsTravelMode.BICYCLING
        };
        directionsService.route(m, function(n, o) {
            if (o === google.maps.DirectionsStatus.OK) {
                directionsRenderer.setMap(map);
                directionsRenderer.setDirections(n);
                setDirectionsText(n.routes[0].legs);
            }
        });
        return false;
    });
}))