var mirna = '';
var term = '';
var page = 1;
var page_count = 1;
var target_count = 0;
var downloaded = false;
var mirna_open = false;
var term_open = false;
var selected = [];

// Filter variables
var publication_filter = 'all';
var predicted_by = 'any';
var sort_by = 'mirdb';
var limit = 5;

Array.prototype.remove = function (v) {
    this.splice(this.indexOf(v) == -1 ? this.length : this.indexOf(v), 1);
};

$(window).on('unload', function () {
    $('#results').find('tbody').html('');
});

$(document).ready(function () {
    var mirna_searchbox_div = $('#mirna_searchbox_div');
    var mirna_searchbox_input = $('#mirna_searchbox_input');
    var term_searchbox_div = $('#term_searchbox_div');
    var term_searchbox_input = $('#term_searchbox_input');

    // Tooltip cursor fix
    $('[data-toggle="tooltip"]').tooltip().css('cursor', 'default');

    //--------------------------------------
    //             MISC EVENTS
    //--------------------------------------
    $(document.body).on('click', function () {
        hide_all();
    });

    $(document).on('keydown', function (e) {
        if (e.which === 8 && !$(e.target).is("input, textarea")) {
            e.preventDefault();
        }
    });

    //--------------------------------------
    //           SEARCH CONTROLS
    //--------------------------------------
    $('#search_form').on('submit', function (e) {
        e.preventDefault();
        selected = [];
        page = 1;
        page_count = 1;
        target_count = 0;
        search();
    });

    $('.searchbox').find('div').on('touchmove', function (e) {
        e.stopPropagation();
    });

    //--------------------------------------
    //           MIRNA SEARCHBOX
    //--------------------------------------
    mirna_searchbox_input
        .on('input', function () {
            mirna_query(false);
        })
        .on('dblclick', function () {
            if (mirna_searchbox_div.is(':hidden'))
                mirna_query(true);
            else if (mirna_open)
                mirna_searchbox_div.find(':first-child').focus();
        })
        .on('keydown', function (e) {
            var keyCode = e.keyCode || e.which;

            if (keyCode == 9) {
                mirna_searchbox_div.hide();
                $(this).next().focus();
            }
            else if (keyCode == 40) {
                if (mirna_searchbox_div.is(':hidden'))
                    mirna_query(true);
                else if (mirna_open)
                    mirna_searchbox_div.find(':first-child').focus();

                return false;
            }
        });

    mirna_searchbox_div
        .on('mousemove', 'p', function () {
            if (mirna_open)
                $(this).focus();
        })
        .on('click', 'p', function () {
            mirna_searchbox_input.val($(this).text()).focus();
            $(this).parent().hide();
        })
        .on('keydown', 'p', function (e) {
            var keyCode = e.keyCode || e.which;

            if (keyCode == 9 || keyCode == 13) {
                mirna_searchbox_input.val($(this).text()).focus();
                $(this).parent().hide();
                if (keyCode == 13)
                    return false;
            }
            else if (keyCode == 33) {
                var index = mirna_searchbox_div.find('p:focus').index();
                var children = mirna_searchbox_div.children();
                index = Math.max(0, Math.min(index - 10, children.length - 1));
                children[index].focus();
                return false;
            }
            else if (keyCode == 34) {
                index = mirna_searchbox_div.find('p:focus').index();
                children = mirna_searchbox_div.children();
                index = Math.max(0, Math.min(index + 10, children.length - 1));
                children[index].focus();
                return false;
            }
            else if (keyCode == 38) {
                $(this).prev().focus();
                return false;
            }
            else if (keyCode == 40) {
                $(this).next().focus();
                return false;
            }
        });

    //--------------------------------------
    //         MESH TERM SEARCHBOX
    //--------------------------------------
    term_searchbox_input
        .on('input', function () {
            term_query(false);
        })
        .on('dblclick', function () {
            if (term_searchbox_div.is(':hidden'))
                term_query(true);
            else if (term_open)
                term_searchbox_div.find(':first-child').focus();
        })
        .on('keydown', function (e) {
            var keyCode = e.keyCode || e.which;

            if (keyCode == 9) {
                term_searchbox_div.hide();
                $(this).next().focus();
            }
            else if (keyCode == 40) {
                if (term_searchbox_div.is(':hidden'))
                    term_query(true);
                else if (mirna_open)
                    term_searchbox_div.find(':first-child').focus();

                return false;
            }
        });

    term_searchbox_div
        .on('mousemove', 'p', function () {
            if (mirna_open)
                $(this).focus();
        })
        .on('click', 'p', function () {
            term_searchbox_input.val($(this).text()).focus();
            $(this).parent().hide();
        })
        .on('keydown', 'p', function (e) {
            var keyCode = e.keyCode || e.which;

            if (keyCode == 9 || keyCode == 13) {
                term_searchbox_input.val($(this).text()).focus();
                $(this).parent().hide();
                if (keyCode == 13)
                    return false;
            }
            else if (keyCode == 33) {
                var index = term_searchbox_div.find('p:focus').index();
                var children = term_searchbox_div.children();
                index = Math.max(0, Math.min(index - 10, children.length - 1));
                children[index].focus();
                return false;
            }
            else if (keyCode == 34) {
                index = term_searchbox_div.find('p:focus').index();
                children = term_searchbox_div.children();
                index = Math.max(0, Math.min(index + 10, children.length - 1));
                children[index].focus();
                return false;
            }
            else if (keyCode == 38) {
                $(this).prev().focus();
                return false;
            }
            else if (keyCode == 40) {
                $(this).next().focus();
                return false;
            }
        });

    //--------------------------------------
    //              PAGINATION
    //--------------------------------------
    $('#first_btn').on('click', function () {
        page = 1;
        search();
    });

    $('#prev_btn').on('click', function () {
        page--;
        search();
    });

    $('#next_btn').on('click', function () {
        page++;
        search();
    });

    $('#last_btn').on('click', function () {
        page = page_count;
        search();
    });

    $('#page_txt').on('keydown', function (e) {
        var keyCode = e.keyCode || e.which;

        if (keyCode == 13) {
            page = $('#page_txt').val();
            if (isNaN(page)) {
                page = 1;
            }
            search();
        }
    });

    //--------------------------------------
    //       TARGET CHECKBOX SELECTION
    //--------------------------------------
    $('#select_all_cb').on('change', function () {
        if ($(this).is(':checked')) {
            $('#select_all_cb').prop('disabled', true);

            $.get('search.php', {
                    type: 'select_all',
                    mirna: mirna,
                    term: term,
                    sort_by: sort_by,
                    predicted_by: predicted_by,
                    publication_filter: publication_filter,
                    page: page,
                    limit: limit
                })
                .done(function (data) {
                    selected = data.targets;
                    $('#results_body').find('input[type=checkbox]').prop('checked', true);
                })
                .fail(function () {
                    window.location.href = "error.php";
                })
                .always(function () {
                    $('#select_all_cb').prop('disabled', false);
                });
        }
        else {
            selected = [];
            $('#results_body').find('input[type=checkbox]').prop('checked', false);
        }
    });

    $('#results').find('tbody').on('change', 'input[type=checkbox]', function () {
        if ($(this).is(':checked'))
            selected.push($(this).val());
        else
            selected.remove($(this).val());

        $('#select_all_cb').prop('checked', selected.length == target_count);
    });

    //--------------------------------------
    //              CLEAR RESULTS
    //--------------------------------------
    $('#clear_results_btn').on('click', function () {
        $('#results').find('tbody').html('<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>');
        $('#results_controls').find('input, button, select').prop('disabled', true);
        $('#limit_select').find('option:first').prop('selected', true);
        $('#sort_by_select').prop('disabled', true).find('option:first').prop('selected', true);
        $('#predicted_by_select').prop('disabled', true).find('option:first').prop('selected', true);
        $('#publication_filter_select').prop('disabled', true).find('option:first').prop('selected', true);
        $('#select_all_cb').prop('checked', false).prop('disabled', true);
        $('#term_lbl').text('');
        $('#page_txt').val('0');
        $('#page_count_lbl').text('0');

        page = 1;
        page_count = 1;
        target_count = 0;
        downloaded = false;
        selected = [];

        publication_filter = 'all';
        predicted_by = 'any';
        sort_by = 'mirdb';
        limit = 5;
    });

    //--------------------------------------
    //              FILTERS
    //--------------------------------------
    $('#publication_filter_select').on('change', function () {
        publication_filter = $(this).val();
        $('#select_all_cb').prop('checked', false);
        selected = [];
        search();
    });

    $('#predicted_by_select').on('change', function () {
        predicted_by = $(this).val();
        $('#select_all_cb').prop('checked', false);
        selected = [];
        search();
    });

    $('#sort_by_select').on('change', function () {
        sort_by = $(this).val();
        search();
    });

    $('#limit_select').on('change', function () {
        limit = $(this).val();
        search();
    });

    //--------------------------------------
    //          DOWNLOAD RESULTS
    //--------------------------------------
    $('.download')
        .on('click', 'button', function (e) {
            e.stopPropagation();

            $('.searchbox').find('div').hide();
            if ($('#download_results_btn').is(this))
                $('#perform_analysis_div').hide();
            else
                $('#download_results_div').hide();

            $(this).next().toggle();
        })
        .on('click', 'div', function (e) {
            e.stopPropagation();
        });

    $('#download_results').find('input[name=amount]').on('change', function () {
        if ($('#download_selected_radio').is(this))
            $('#format').prop('disabled', true);
        else if ($('#download_all_radio').is(this))
            $('#format').prop('disabled', false);
    });

    $('#download_results_btn').on('click', function () {
        var select_all_cb = $('#select_all_cb');

        $('#selected_count_lbl').text(selected.length);

        if (!select_all_cb.is(':checked') && selected.length === 0) {
            $('#download_all_radio').prop('checked', true);
            $('#download_selected_radio').prop('disabled', true);
            $('#format').prop('disabled', false);
        }
        else {
            $('#download_selected_radio').prop('checked', true).prop('disabled', false);
            $('#format').prop('disabled', true);
        }
    });

    $('#download_btn').on('click', function () {
        var format = $('#format').find('option:selected').prop('value');

        if ($('#download_selected_radio').is(':checked')) {
            format = 'txt';
            downloaded = true;
        }

        window.open('download.php?' +
            'mirna=' + mirna +
            '&term=' + term +
            '&sort_by=' + sort_by +
            '&predicted_by=' + predicted_by +
            '&publication_filter=' + publication_filter +
            '&format=' + format +
            '&selected=' + selected.toString(),
            '_blank');
    });

    //--------------------------------------
    //          ANALYZE RESULTS
    //--------------------------------------
    $('#perform_analysis_btn').on('click', function () {
        $('#david_tool_select').prop('disabled', downloaded);
    });

    $('#david_btn').on('click', function () {
        $('#perform_analysis_div').hide();

        if (downloaded) {
            alert('The previously downloaded Target List file can be used in the DAVID interface.');
            window.open('https://david.ncifcrf.gov/tools.jsp', '_blank');
        }
        else {
            var tool = $('#david_tool_select').find('option:selected').val();

            if (selected.length === 0) {
                alert('Please select one or more candidate targets');
            }
            else {
                var url = 'http://david.abcc.ncifcrf.gov/api.jsp?type=GENE_SYMBOL&ids=' + selected.toString() + '&tool=' + tool;
                if (url.length > 2048) {
                    alert('Generated DAVID URL exceeds the maximum URL size. Please download the selected targets and upload the file in the DAVID user interface.');
                }
                else {
                    window.open(url, '_blank');
                }
            }
        }
    });

    //--------------------------------------
    //          FUNCTIONS
    //--------------------------------------
    function hide_all() {
        $('.searchbox').find('div').hide();
        $('.download').find('div').hide();
    }

    function mirna_query(focus) {
        mirna_open = false;

        $('#mirna_searchbox_div').html('<h5>Searching...</h5>').show();

        $.get('query.php', {mirna: $('#mirna_searchbox_input').val().trim()})
            .done(function (data) {
                $('#mirna_searchbox_div').html(data);
                setTimeout(function () {
                    if (focus)
                        $('#mirna_searchbox_div').find(':first-child').focus();
                    mirna_open = true;
                }, 50);
            })
            .fail(function () {
                $('#mirna_searchbox_div').html('<h5>OmniStore Unavailable</h5>');
            })
    }

    function term_query(focus) {
        term_open = false;

        $('#term_searchbox_div').html('<h5>Searching...</h5>').show();

        $.get('query.php', {term: $('#term_searchbox_input').val().trim()})
            .done(function (data) {
                $('#term_searchbox_div').html(data);
                setTimeout(function () {
                    if (focus)
                        $('#term_searchbox_div').find(':first-child').focus();
                    term_open = true;
                }, 50);
            })
            .fail(function () {
                $('#term_searchbox_div').html('<h5>OmniStore Unavailable</h5>');
            });
    }

    function search() {
        mirna = $('#mirna_searchbox_input').val().trim();
        term = $('#term_searchbox_input').val().trim();

        $('input, button, select').prop('disabled', true);

        $.getJSON('search.php',
            {
                type: 'search',
                mirna: mirna,
                term: term,
                sort_by: sort_by,
                predicted_by: predicted_by,
                publication_filter: publication_filter,
                page: page,
                limit: limit
            })
            .done(function (data) {
                var page_txt = $('#page_txt');
                var page_count_lbl = $('#page_count_lbl');
                var select_all_cb = $('#select_all_cb');

                if (data.success) {
                    page = data.page;
                    page_count = data.page_count;
                    target_count = data.target_count;

                    page_txt.val(page);
                    page_count_lbl.text(page_count);
                    $('#total_count_lbl').text(target_count);
                    $('#term_lbl').html(term.length ? '"' + term + '"' : '');
                    $('#results_body').html(data.html);
                    setTimeout(function () {
                        $('#results_body').find('input[type=checkbox]').each(function (index, element) {
                            if ($.inArray(element.value, selected) != -1) {
                                $(element).prop('checked', true);
                            }
                        });
                    }, 50);

                    if (page_count == 0) {
                        page_txt.val('0');
                        page_count_lbl.text('0');
                    }

                    if (page_count > 1) {
                        if (page != 1) {
                            $('#first_btn').prop('disabled', false);
                            $('#prev_btn').prop('disabled', false);
                        }
                        if (page != page_count) {
                            $('#next_btn').prop('disabled', false);
                            $('#last_btn').prop('disabled', false);
                        }
                        page_txt.prop('disabled', false);
                    }
                    if (page_count > 0) {
                        $('.download').find('input, button, select').prop('disabled', false);
                        $('#clear_results_btn').prop('disabled', false);
                        $('#limit_select').prop('disabled', false);
                        select_all_cb.prop('disabled', false);
                        $('#sort_by_select').prop('disabled', false);
                    }
                    select_all_cb.prop('disabled', false);
                }
                else {
                    $('#results_body').html('<tr><td colspan="5"><h4>No results found</h4></td></tr>');
                    page_txt.val('0');
                    page_count_lbl.text('0)');
                }
            })
            .fail(function (error) {
                window.location.href = "error.php";
            })
            .always(function () {
                $('#search_controls').find('input, button, select').prop('disabled', false);
                $('#predicted_by_select').prop('disabled', false);
                $('#publication_filter_select').prop('disabled', false);
            });
    }
});
