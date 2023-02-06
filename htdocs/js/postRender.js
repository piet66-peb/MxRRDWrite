function modulePostRender(control) {
    /*jshint strict: false */
    /*globals $ */

    console.log('postRender.js start');

    /* determine os */
    /* ============ */

    /* set defaults for all input fields */
    /* ================================= */
    var defaults = {server_host:            'localhost',
                    server_port:            '5001',
                    server_username:        'username',
                    server_password:        'secret',
                    sensors_metric:         'level',
                    rrd_poll_period:        'taken from rrd database (step parameter)',
                    rrd_least_poll_period:  10,
    };  
    /* walk through all input fields: */
    $(":input").each(function(){
        var id = $(this).attr('id');
        if (id && id.indexOf('alpaca') === 0) {
            var val = $(this).val();
            var name = $(this).attr('name');
            if (!val) {
                var new_value = defaults[name];
                if (new_value !== undefined) {
                    console.log(id+': '+name+' > '+new_value);
                    $(this).val(new_value);
                }
            }
            if (name === 'rrd_poll_period') {
                $(this).context.readOnly = true;
            }
        }
    });

    /* set background colors */
    /* ===================== */

    $(".objectClass").css( "background-color", "#f8f8f8" );
    $(".objectClass").css('border-width', '5');
    $(".sensorsArray").css( "background-color", "#f8f8f8" );
    $(".sensorsArray").css('border-width', '5');

    console.log('postRender.js end');
} /* modulePostRender */
