/*** MxRRDWrite V1.2.1 2023-02-28 Z-Way HA module *********************************/

//h-------------------------------------------------------------------------------
//h
//h Name:         index.js
//h Type:         Index file for MxRRDWrite.
//h Project:      Z-Way HA
//h Usage:        
//h Remark:       
//h Result:       
//h Examples:     
//h Outline:      
//h Resources:    MxBaseModule
//h Issues:       
//h Authors:      peb piet66
//h Version:      V1.2.1 2023-02-28/peb
//v History:      V1.0.0 2022-12-06/peb first version
//v               V1.2.1 2023-02-27/peb [x]expected 12 data source readings (got 11)
//v                                        (Niveau missing)
//v                                        inserted 'U' for missing value
//v               [x]fixed
//v               [*]reworked, changed
//v               [-]removed
//v               [+]added
//h Copyright:    (C) piet66 2022
//h License:      http://opensource.org/licenses/MIT
//h 
//h-------------------------------------------------------------------------------

/*jshint esversion: 5 */
/*globals inherits, _module:true, MxBaseModule, http */
'use strict';

//h-------------------------------------------------------------------------------
//h
//h Name:         MxRRDWrite
//h Purpose:      class definition, inheritance.
//h
//h-------------------------------------------------------------------------------
function MxRRDWrite(id, controller) {
    // Call superconstructor first (AutomationModule)
    MxRRDWrite.super_.call(this, id, controller);

    this.MODULE = 'index.js';
    this.VERSION = 'V1.2.1';
    this.WRITTEN = '2023-02-28/peb';

    this.host = undefined;
    this.port = undefined;
    this.username = undefined;
    this.password = undefined;
    this.database_name = undefined;
    this.sensors = undefined;
    this.least_poll_period = undefined;

    //this.last = undefined;
    this.next = undefined;
    this.step = undefined;
	this.timer_repeat_fetch = undefined;
	this.timer_next_run = undefined;
    this.url_fetch = undefined;
    this.url_update = undefined;
}
inherits(MxRRDWrite, MxBaseModule);
_module = MxRRDWrite;

//h-------------------------------------------------------------------------------
//h
//h Name:         init
//h Purpose:      module initialization.
//h
//h-------------------------------------------------------------------------------
MxRRDWrite.prototype.init = function(config) {
    MxRRDWrite.super_.prototype.init.call(this, config);
    var self = this;
}; //init

MxRRDWrite.prototype.init0 = function() {
    var self = this;

    //b get parameters
    //----------------
    self.host = (self.config.server.host || '').trim();
    self.port = (self.config.server.port || '').trim();
    self.username = (self.config.server.username || '').trim();
    self.password = (self.config.server.password || '').trim();
    self.database_name = (self.config.rrd.database_name || '').trim();
    self.least_poll_period = self.config.rrd.least_poll_period || 0;

    self.log('host', self.host);
    self.log('port', self.port);
    self.log('username', self.username);
    self.log('password', self.password);
    self.log('database_name', self.database_name);
    self.log('least_poll_period', self.least_poll_period);

    self.sensors = [];
    self.config.sensors.forEach( function(sensor) {
        if (sensor && sensor.id) {
            var item = {id: sensor.id,
                        metric: sensor.metric || 'level',
                        arithmetic: sensor.arithmetic};
            self.sensors.push(item);
            self.log(item);
        }
    });

    // for check ip address for validity:
    // ipv4 + ipv6 combined:
    var regexExp = /(?:^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$)|(?:^(?:(?:[a-fA-F\d]{1,4}:){7}(?:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){5}(?::(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,2}|:)|(?:[a-fA-F\d]{1,4}:){4}(?:(?::[a-fA-F\d]{1,4}){0,1}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,3}|:)|(?:[a-fA-F\d]{1,4}:){3}(?:(?::[a-fA-F\d]{1,4}){0,2}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,4}|:)|(?:[a-fA-F\d]{1,4}:){2}(?:(?::[a-fA-F\d]{1,4}){0,3}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,5}|:)|(?:[a-fA-F\d]{1,4}:){1}(?:(?::[a-fA-F\d]{1,4}){0,4}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,6}|:)|(?::(?:(?::[a-fA-F\d]{1,4}){0,5}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,7}|:)))(?:%[0-9a-zA-Z]{1,})?$)/gm;      
    
    //b check configuration
    //---------------------
    var err;
    if (self.sensors.length === 0) {
        err = 'no sensor defined';
    } else
    if (!self.host) {
        err = 'no db server defined';
    } else
    if (self.host.indexOf('.') >= 0 && !regexExp.test(self.host)) {
        err = 'server ip is invalid';
    } else
    if (!self.port) {
        err = 'no server port defined';
    } else
    if (!self.username) {
        err = 'no username defined';
    } else
    if (!self.password) {
        err = 'no password defined';
    } else
    if (!self.database_name) {
        err = 'no database defined';
    }
    if (err) {
        self.notifyError(err);
        throw err;
    }

    //b build devices array
    //---------------------
    self.devicesArray = [];
    _.each(self.sensors, function(sensor, index) {
        self.devicesArray.push(sensor.id);
    });
    self.log('self.devicesArray', self.devicesArray);

    //b wait till all devices are ready (=>initExec)
    //----------------------------------------------
    self.waitDevicesReady(self.devicesArray);
}; //init1

//h-------------------------------------------------------------------------------
//h
//h Name:         initExec
//h Purpose:      module kickoff.
//h
//h-------------------------------------------------------------------------------
MxRRDWrite.prototype.initExec = function() {
    var self = this;

    //b add device title to sensors array
    //-----------------------------------
    self.sensors.forEach( function (sensor) {
        var vDev = self.controller.devices.get(sensor.id);
        sensor.title = vDev.get("metrics:" + sensor.title);
    });

    self.url_update = 'http://'+self.host+':'+self.port+'/'+self.database_name+'/update';
    self.url_fetch = 'http://'+self.host+':'+self.port+'/'+self.database_name+
                     '/fetch?l=0&times=no';

    //b get configuration data from database for start (=>get_rrd_parameters)
    //-----------------------------------------------------------------------
    self.get_rrd_parameters();
}; //initExec

//h-------------------------------------------------------------------------------
//h
//h Name:         get_rrd_parameters
//h Purpose:      reads step + next from rrd database in a loop till success
//h
//h-------------------------------------------------------------------------------
MxRRDWrite.prototype.get_rrd_parameters = function() {
    var self = this;

    self.ajax_get(
        self.url_fetch, 
        function(response) {
            self.next = response.data[0][1];
            self.step = response.data[0][2];
            if (typeof self.next === 'number' &&
                typeof self.step === 'number') {
                self.step = Math.max(self.step, self.least_poll_period);
                self.set_next_timer();
            } else {
                var err = self.next+', '+self.step+' are no numbers';
                self.notifyError(err);
                throw err;
            }
        }, 
        function (response) {
            self.timer_repeat_fetch = setTimeout(function () {
            self.timer_repeat_fetch = undefined;
            self.get_rrd_parameters();
        }, 1000 * 10 * 60);
        }
    );
}; //get_rrd_parameters

//h-------------------------------------------------------------------------------
//h
//h Name:         set_next_timer
//h Purpose:      sets timer for next read/ write
//h
//h-------------------------------------------------------------------------------
MxRRDWrite.prototype.set_next_timer = function() {
    var self = this;

    self.log('self.next', self.next, self.userTime(self.next));
    self.log('self.step', self.step, 'seconds');

    var now = Math.floor(Date.now()/1000); //secs
    self.log('now', now, self.userTime(now));
    var sleep = self.next - now;
    self.log('sleep', sleep, 'seconds', sleep/60, 'minutes');

    //b start data collection after n seconds
    //---------------------------------------
    if (sleep > 1) {
        self.timer_next_run = setTimeout(function () {
            self.timer_next_run = undefined;
            self.collect_values();
        }, 1000 * sleep);
    } else {
        self.collect_values();
    }
}; //set_next_timer

//h-------------------------------------------------------------------------------
//h
//h Name:         stop
//h Purpose:      module stop.
//h
//h-------------------------------------------------------------------------------
MxRRDWrite.prototype.stop = function() {
    var self = this;

    if (self.timer_next_run) {
        clearTimeout(self.timer_next_run);
        self.timer_next_run = undefined;
    }
    if (self.timer_repeat_fetch) {
        clearTimeout(self.timer_repeat_fetch);
        self.timer_repeat_fetch = undefined;
    }

    MxRRDWrite.super_.prototype.stop.call(this);
}; //stop

//h-------------------------------------------------------------------------------
//h
//h Name:         collect_values
//h Purpose:      collect and send sensor values.
//h
//h-------------------------------------------------------------------------------
MxRRDWrite.prototype.collect_values = function() {
    var self = this;
    self.log('collect_values');

    //b for all sensors
    //-----------------
    var valuestring, sensor_value, errtext;
    for (var i = 0; i < self.sensors.length; i++) {
        sensor_value = undefined;
        errtext = undefined;
        var sensor = self.sensors[i];
        var vDev = self.controller.devices.get(sensor.id);
        self.log('i', i, 'sensor.id', sensor.id);

        //b read current sensor value
        //---------------------------
        try {
            if (sensor.metric === 'updateTime') {
                sensor_value = vDev.get("updateTime");
            } else {
                sensor_value = vDev.get("metrics:" + sensor.metric);
            }
        } catch (err) {
            self.notifyError(err);
            errtext = ["read sensor value", sensor.id, sensor.metric, sensor.title].join(', ');
            self.notifyError(errtext);
            sensor_value = 'U';
        }

        //b execute arithmetics
        //---------------------
        if (sensor_value !== 'U' && sensor.arithmetic) {
            var x = sensor_value;
            try {
                /*jshint evil: true */
                sensor_value = eval(sensor.arithmetic);
                /*jshint evil: false */
            } catch (err) { //err = empty object
                //self.notifyError(err);
                errtext = ["eval sensor value", sensor.id, sensor.arithmetic, 
                           sensor.title].join(', ');
                self.notifyError(errtext);
                sensor_value = 'U';
            }
        }

        //b check for valid value
        //-----------------------
        if (sensor_value === undefined || sensor_value !== 'U') {
            if (sensor_value === undefined) {
                errtext = ['sensor value is undefined', sensor.id, sensor.metric, 
                           sensor.title].join(', ');
                self.notifyError(errtext);
                sensor_value = 'U';
            } else
            if (typeof(sensor_value) === 'string' && sensor_value.trim() === '') {
                errtext = ['sensor value is empty', sensor.id, sensor.metric, 
                           sensor.title].join(', ');
                self.notifyError(errtext);
                sensor_value = 'U';
            } else
            if (sensor_value === 'on') {
                sensor_value = 1;
            } else 
            if (sensor_value === 'off') {
                sensor_value = 0;
            } else  {
                var sv = sensor_value;
                sensor_value = Number(sensor_value);
                if (isNaN(sensor_value)) {
                    errtext = ['sensor value "'+sv+'" is not a number', sensor.id, 
                               sensor.metric, sensor.title].join(', ');
                    self.notifyError(errtext);
                    sensor_value = 'U';
                }
            }
        }

        //b add value to value string
        //---------------------------
        if (valuestring !== undefined) {
            valuestring += ':'+sensor_value;
        } else {
            valuestring = sensor_value;
        }
        self.log('valuestring', valuestring, 'sensor_value', sensor_value);
    } //sensors.forEach

    //b send data to database
    //-----------------------
    if (valuestring !== undefined) {
        var ts = self.next;
        self.log('ts', ts, self.userTime(ts));
        var query_string = '?ts='+ts+'&values='+valuestring;
        self.ajax_post(self.url_update+query_string, 'empty by intention',
                                                     'data written', 
                                                     'RRDTool_API update response');
    } else {
        errtext = '!!!! no sensor values read !!!!';
        self.notifyError(errtext);
    }

    //b compute delay for next timer run
    //----------------------------------
    self.next = self.next + self.step;
    self.set_next_timer();
}; //collect_values

//h-------------------------------------------------------------------------------
//h
//h Name:         ajax_post
//h Purpose:      
//h
//h-------------------------------------------------------------------------------
MxRRDWrite.prototype.ajax_post = function(url, data, success, failure) {
    var self = this;

    if (arguments.length < 4) {
        self.error('ajax_post', 'wrong number of arguments '+arguments.length+' < 4');
    }

    function failureF(response, err_text) {
        if (!response.status) {
            self.notifyError(url+' communication fault');
            if (typeof failure === 'function') {
                failure({status: 503});
            } else {
                self.notifyConnectionFault(failure);
                return;
            } 
        } else
        if (response.status < 100 ||
            response.status === 500 ||      //!!!!!!!!!!!!!!!! unendliche schleife ?????????????
            response.status === 900 && 
            (response.statusText.indexOf('database is locked') >= 0 ||
             err_text.indexOf('database is locked') >= 0)) {
            self.notifyConnectionFault(url+' '+response.status+' '+
                                       response.statusText+' '+err_text);
            if (typeof failure === 'function') {
                failure(response);
            } else {
                self.notifyConnectionFault(failure);
                return;
            }
        } else
        if (typeof failure === 'string') {
            self.notifyError(url+' '+response.status+' '+response.statusText+' '+err_text);
            self.notifyError(failure);
            throw failure;
        } else
        if (typeof failure === 'function') {
            self.warn(url, response.status, response.statusText, err_text);
            failure(response);
        }
    }

    function successF(response, dataSentLength) {
        if (typeof success === 'string') {
            self.log(success);
        } else
        if (typeof success === 'function') {
            success(response, dataSentLength);
        }
    }

    self.log('ajax_post_url', url);
    self.log('ajax_post_data', data);
    var request = {
        url:     url,
        method:  'POST',
        auth: {
            "login":    self.username,
            "password": self.password
        },
        data:    data,
        async:   true,
        success: function(response) {
                    self.connection_failed = false;
                    successF(response);
                 },
        error:   function(response) {
                    self.log('response', response);
                    var err_text = '';
                    if (response.data) {
                        err_text = response.data;
                    }
                    failureF(response, err_text);
                 }
    };
    //self.log('request', request);
    http.request(request);
}; //ajax_post

//h-------------------------------------------------------------------------------
//h
//h Name:         ajax_get
//h Purpose:      
//h
//h-------------------------------------------------------------------------------
MxRRDWrite.prototype.ajax_get = function(url, success, failure) {
    var self = this;

    if (arguments.length < 3) {
        self.error('ajax_get', 'wrong number of arguments '+arguments.length+' < 3');
    }

    function failureF(response, err_text) {
        if (!response.status) {
            self.notifyConnectionFault(url+' communication fault');
            if (typeof failure === 'function') {
                failure({status: 503});
            } else {
                self.notifyConnectionFault(failure);
                return;
            } 
        } else
        if (response.status < 100 ||
            response.status === 500 ||
            response.status === 900 && 
            (response.statusText.indexOf('database is locked') >= 0 ||
             err_text.indexOf('database is locked') >= 0)) {
            self.notifyConnectionFault(url+' '+response.status+' '+response.statusText+' '+err_text);
            if (typeof failure === 'function') {
                failure(response);
            } else {
                self.notifyConnectionFault(failure);
                return;
            }
        } else
        if (typeof failure === 'string') {
            self.notifyError('<br>'+failure+
                             '<br>'+url+
                             '<br>'+response.status+' '+response.statusText+
                             '<br>'+err_text);
            throw failure;
        } else
        if (typeof failure === 'function') {
            self.warn(url, response.status, response.statusText, err_text);
            failure(response);
        }
    }

    function successF(response) {
        if (typeof success === 'string') {
            self.log(success);
        } else
        if (typeof success === 'function') {
            success(response);
        }
    }

    self.log('ajax_get url', url);
    var request = {
        url:     url,
        method:  'GET',
        auth: {
            "login":    self.username,
            "password": self.password
        },
        async:   true,
        success: function(response) {
                    self.connection_failed = false;
                    //self.log('response', response);
                    successF(response);
                 },
        error:   function(response) {
                    self.log('response', response);
                    var err_text = '';
                    if (response.data) {
                        err_text = response.data;
                    }
                    failureF(response, err_text);
                 }
    };
    //self.log('request', request);
    http.request(request);
}; //ajax_get

//h-------------------------------------------------------------------------------
//h
//h Name:         notifyConnectionFault
//h Purpose:      suppress repeated connection fault message
//h
//h-------------------------------------------------------------------------------
MxRRDWrite.prototype.notifyConnectionFault = function(text) {
    var self = this;

    if (!self.connection_failed) {
        self.connection_failed = true;
        self.notifyWarn(text);
    }
}; //notifyConnectionFault
