const test = require('tape');
const fromEvent = require('./index');

test('it converts from (fake) DOM node events', (t) => {
  t.plan(14);
  const elem = {
    added: false,
    id: null,

    addEventListener: (name, listener) => {
      t.equals(name, 'click', 'addEventListener for click');
      this.added = true;
      let i = 0;
      this.id = setInterval(() => listener((++i)*10));
    },

    removeEventListener: (name, listener) => {
      t.equals(name, 'click', 'removeEventListener for click');
      this.added = false;
      clearInterval(this.id);
    }
  }

  const source = fromEvent(elem, 'click');

  const downwardsExpectedType = [
    [0, 'function'],
    [1, 'number'],
    [1, 'number'],
    [1, 'number']
  ];

  const downwardsExpected = [10, 20, 30];

  function makeSink(type, data) {
    let talkback;
    return (type, data) => {
      const et = downwardsExpectedType.shift();
      t.equals(type, et[0], 'downwards type is expected: ' + et[0]);
      t.equals(typeof data, et[1], 'downwards data type is expected: ' + et[1]);
      if (type === 0) {
        talkback = data;
      }
      if (type === 1) {
        const e = downwardsExpected.shift();
        t.equals(data, e, 'downwards data is expected: ' + e);
      }
      if (downwardsExpected.length === 0) {
        talkback(2);
      }
    };
  }

  const sink = makeSink();
  source(0, sink);

  setTimeout(() => {
    t.pass('nothing else happens after dispose()');
    t.end();
  }, 700);
});

