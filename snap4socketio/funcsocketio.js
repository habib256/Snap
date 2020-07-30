// Socket.io Snap! Function Connector
// function Javascript (function, number){}
// GPL2 - VERHILLE A - gist974@gmail.com
// ******************************************


function parseNumber (n) {
    var fn = SchemeNumber.fn;
    if (!fn['number?'](n)) {
        n = '' + n;
        try {
            return parseENotation(n) || SchemeNumber(n);
        } catch (err) {
            return NaN;
        }
    }
    return n;
}

function parseENotation (n) {
    var fn = SchemeNumber.fn;

    var numbers = n.match(/^(-?\d+\.?\d*|-?\.\d+)e(-?\d+)$/i);
    if (!numbers) return null;

    var coefficient = numbers[1];
    var exponent = numbers[2];
    return fn['*'](
        coefficient,
        fn.expt('10', exponent)
    );
}
var fn=SchemeNumber.fn,
      number=parseNumber(num);

switch (which) {
  case 'number?':
  case 'complex?':
    return (fn['number?'](number));
  case 'real?':
    return (fn['real?'](number) || fn['real-valued?'](number));
  case 'rational?':
    return (fn['rational?'](number) || (fn['='](number, fn.rationalize(number, parseNumber('1.0e-5')))));
  case 'integer?':
    return (fn['integer?'](number) || fn['integer-valued?'](number));
  case 'exact?':
  case 'inexact?':
  case 'finite?':
  case 'infinite?':
  case 'nan?':
  case 'real-part':
  case 'imag-part':
    return (fn[which](number));
  case 'magnitude':
    return (fn.magnitude(number));
  case 'angle':
    return (fn.angle(number));
  case 'numerator':
    return (fn.numerator(number));
  case 'denominator':
    return (fn.denominator(number));
  case 'exact':
    return (fn.exact(number));
case 'inexact':
    return (fn.inexact(number));
}