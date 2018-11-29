/* eslint-disable */
// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://epicmafia.com/game/*
// @exclude      https://epicmafia.com/game/new/*
// @grant        none
// ==/UserScript==

//
//
//

// ==/UserScript==

(function() {
    'use strict';

    var interval = setInterval(() => {
        if(window.angular) {
            if(!angular.element(document.getElementById('speak')).scope()) {
                angular.reloadWithDebugInfo()
            }
            clearInterval(interval);
        }
    }, 100);

    const speak = $('#speak');
    const scope = angular.element('#speak').scope();
    if(!scope) return;

    const send_msg = scope.send_msg;

    const emotes = Object.keys(Object.assign({}, window.lobby_emotes, window.catch_emotes));

    const input_chat = $('form[name="input_chat"]');
    input_chat.prepend('<input autocomplete="off" autofocus="" id="async_typebox" name="message" type="text">');

    const async_typebox = $('#async_typebox');

    async_typebox.css({
        'margin-top': '4px',
        border: '1px solid #aaa',
        'font-size': '1.1em',
        color: '#666',
        width: '14em',
        'border-radius': '3px',
        padding: '3px'
    });

    $('#typebox').hide();

    let queue = [];
    let running = false;
    const run_chat_queue = function() {
        if(!running && queue.length) {
            let str = queue.shift();
            $('#typebox').val(str);
            send_msg();
            running = true;
            let interval = setInterval(() => {
                if(queue.length) {
                    let str = queue.shift();
                    $('#typebox').val(str);
                    send_msg();
                } else {
                    clearInterval(interval);
                    running = false;
                }
            }, 2500);
        }

    }

    const chat = function(input) {
        let words = input.split(' ');
        let str = '';
        while(words.length !== 0) {
            if(str.length + words[0].length < 125) {
                str += ' ' + words.shift();
            } else {
                queue.push(str);
                str = words[0].slice(0, 125);
                words[0] = words[0].slice(125);
            }
        }
        if(str.length) {
            queue.push(str);
        }
        run_chat_queue();
    }

    const new_send_msg = function() {
        const words = $('#async_typebox').val().split(' ').map(word => {
            if(word.match(/(.*)([a-zA-Z])(.*)*/g) && word[0] !== '@' && !emotes.includes(word)) {
                let first = true;
                for(let ii = 0; ii < word.length; ii++) {
                    if(first && word[ii].match(/[a-zA-Z]/)) {
                        first = false
                        word = word.slice(0, ii+1) + '\u0000' + word.slice(ii+1)
                        ii++;
                    } else if(!word[ii].match(/[a-zA-Z]/)) {
                        first = true
                    }
                }
            }
            return word;
        });
        $('#async_typebox').val('');
        chat(words.join(' '));
    }

    async_typebox.keypress(function(event) {
        if (event.which == 13) {
            event.preventDefault();
            new_send_msg(event);
        }
    });

    scope.send_msg = new_send_msg;

})();
