/**
 * Config
 */
'use strict';


//
// Expose
//
module.exports = {
  mailAuth: {
    user: 'hoge@gmai.com',
    pass: 'password'
  },
  mailBoxes: ['All Mail'], // "Inbox" | "All Mail" | "Trash" | "Sent" | "Junk" ...
  command: 'php',
  commandArgs: ['test/test.php']
};
