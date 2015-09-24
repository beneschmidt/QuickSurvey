'use strict';



module.exports = function(grunt) {

  // load tasks from plugins
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-contrib-watch');

  var os=require('os');
  var ifaces=os.networkInterfaces();
  var lookupIpAddress = null;

  Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;

    ifaces[ifname].forEach(function (iface) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }

      if (alias >= 1) {
        // this single interface has multiple ipv4 addresses
        console.log("Start server on host (multiple though): "+iface.address);
        lookupIpAddress = iface.address;
      } else {
        // this interface has only one ipv4 adress
        console.log("Start server on host: "+iface.address);
        lookupIpAddress = iface.address;
      }
    });
  });

  // url config
  var urlConfig = {
    protocol : 'http',
    host : lookupIpAddress?lookupIpAddress:'localhost',
    port : '8877',
    urlPath : '/QuickSurvey'
  }

  // config
  grunt.initConfig({
    watch: {
      express: {
        files: ['**/*.js'],
        tasks: ['express:prod'],
        options: {
          spawn: false
        }
      }
    },
    open: {
      prod: {
        path: urlConfig.protocol + '://' + urlConfig.host + ':' + urlConfig.port + urlConfig.urlPath
      }
    },
    express: {
      options: {
        // Override defaults here, see more at: https://npmjs.org/package/grunt-express-server
        args: [urlConfig.protocol, urlConfig.host, urlConfig.port, urlConfig.urlPath]
      },
      prod: {
        options: {
          script: 'static_server.js',
          delay: 100
        }
      }
      // add more servers here...
    }
  });

  // events
  grunt.event.on('watch', function(action, filepath, target) {
    grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
  });

  // tasks
  grunt.registerTask('server:prod', ['express:prod', 'open:prod', 'watch']);
  grunt.registerTask('server', ['server:prod']); // alias for "server:prod", since there are no other servers (yet)
  grunt.registerTask('default', ['server:prod']); // default points to 'server' task

};
