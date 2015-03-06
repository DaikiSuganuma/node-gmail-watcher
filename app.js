/**
 * App
 */
'use strict';

var inbox = require('inbox'); // @see https://github.com/pipedrive/inbox
var async = require('async');
var spawn = require('child_process').spawn;
var MailParser = require("mailparser").MailParser;
var config = require('./config');

var imap = inbox.createConnection(false, 'imap.gmail.com', {
  secureConnection: true,
  auth: config.mailAuth
});

// Connect
imap.on('connect', function() {
  console.log(' ---- connected');


  //
  // Get Mailbox List
  //
  return getMailboxes.call(imap, function(err, list) {
    // Error
    if (err) {
      throw err;
    }

    if (!Array.isArray(list)) {
      console.log(' !!! Failed getting mailbox list !!! ');
      return false;
    }

    console.log('');
    console.log(' --- Mailbox List--- ');
    console.log(list);

    list.forEach(function(item) {
      if (config.mailBoxes.indexOf(item.type) >= 0) {
        // Open and Watching Mailbox
        openMailbox.call(imap, item);
      }
    });
  });
});

// Connect
imap.connect();




/**
 * Get Mail Box List
 *
 * @param {Function} next
 */
function getMailboxes(next) {
  var imap = this;
  var list = [];

  // Get Mailboxes
  // @see https://github.com/pipedrive/inbox
  return imap.listMailboxes(function(err, mailboxes) {
    if (err) {
      return next(err);
    }

    // Check whether it has children.
    return async.map(mailboxes, function(item, next) {
      if (item.hasChildren) {
        return item.listChildren(function(err, children){
          if (Array.isArray(children)) {
            list = list.concat(children);
          }

          return next();
        });
      }

      list.push(item);

      return next();
    }, function(err) {
      return next(err, list);
    });
  });
}


/**
 * Open Mail Box
 *
 * @param {Object} mailbox
 */
function openMailbox(mailbox) {
  var imap = this;

  console.log('');
  console.log(' --- Watching mailbox --- ');
  console.log(mailbox);

  // Open
  return imap.openMailbox(mailbox, function(err) {
    if (err) {
      throw err;
    }

    // Bind Event for new mail
    imap.on('new', handleNewEmail);
  });
}


/**
 * Handle New Email
 *
 * @param {Object} data
 * @param {Number} data.UID
 */
function handleNewEmail(data) {
  var imap = this;
  var date, text, process;

  date = new Date(data.date);
  text = date.getFullYear();
  text += '/' + (date.getMonth() + 1);
  text += '/' + date.getDate();
  text += ' ' + date.getHours() + ':' + date.getMinutes();
  console.log(' ---- ', text, data.title);
  console.log(data);

  // Get Email Data
  return getEmailData.call(imap, data.UID, function(email) {
    console.log(email);


    //
    // Execute Command
    //
    console.log('');
    console.log(' --- Execute command ---');
    console.log(config.command + ' ' + config.commandArgs.join(' '));
    process = spawn(config.command, config.commandArgs);

    // Output Console
    process.stdin.write(JSON.stringify(email));

    // End Signal
    process.stdin.end();


    //
    // Catch exec result
    //
    process.stdout.on('data', function (data) {
      console.log('stdout', data);
    });
    process.stderr.on('data', function (data) {
      console.log('stderr', data);
    });

    // Finished
    process.on('exit', function(code) {
      console.log(' --- command finished: ' + code);
      // Delete email or something if you need
    });
  });
}


/**
 * Get Email Content
 *
 * @param {Number} uid
 * @param {Function} next
 */
function getEmailData(uid, next) {
  var imap = this;
  var mailparser = new MailParser();

  // Pipe to mailparser
  // @see https://github.com/andris9/mailparser
  imap.createMessageStream(uid).pipe(mailparser);
  mailparser.on('end', next);
}
