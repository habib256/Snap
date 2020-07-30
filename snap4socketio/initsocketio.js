// Socket.io Initialization for Snap!
// GPL2 - VERHILLE A - gist974@gmail.com
// ******************************************
var done = false;

function initialize (callback) {
    var socketScript = document.createElement('script');
    socketScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.slim.js';
    socketScript.onload = loadSocketIO;
    document.head.appendChild(socketScript);

    function loadSocketIO () {
        var schemeScript = document.createElement('script');
        schemeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.slim.js';
        schemeScript.onload = finish;
        document.head.appendChild(schemeScript);
    }

    function finish () {
        makeGlobalObject();
        callback();
    }
}

function makeGlobalObject () {
    window.bigNumbers = {
        originalEvaluate: InputSlotMorph.prototype.evaluate,
        originalChangeVar: VariableFrame.prototype.changeVar,
        originalPrims: {
            reportBasicSum: Process.prototype.reportBasicSum,
            reportBasicDifference: Process.prototype.reportBasicDifference,
            reportBasicProduct: Process.prototype.reportBasicProduct,
            reportBasicQuotient: Process.prototype.reportBasicQuotient,
            reportBasicPower: Process.prototype.reportBasicPower,
            reportBasicModulus: Process.prototype.reportBasicModulus,
            reportBasicRandom: Process.prototype.reportBasicRandom,
            reportBasicLessThan: Process.prototype.reportBasicLessThan,
            reportBasicGreaterThan: Process.prototype.reportBasicGreaterThan,
            reportEquals: Process.prototype.reportEquals,
            reportIsIdentical: Process.prototype.reportIsIdentical,
            reportMonadic: Process.prototype.reportMonadic
        }
    };
}

function loadBlocks () {
    var fn = SchemeNumber.fn;
    var originalPrims = window.bigNumbers.originalPrims;
    if (useBigNums) {
        InputSlotMorph.prototype.evaluate = function () {
            var contents = this.contents();
            if (this.constant) {
                return this.constant;
            }
            if (this.isNumeric) {
                return parseNumber(contents.text || '0');
            }
            return contents.text;
        };
        VariableFrame.prototype.changeVar = function (name, delta, sender) {
            var frame = this.find(name),
                value,
                newValue;
            if (frame) {
                value = parseNumber(frame.vars[name].value);
                newValue = Number.isNaN(value) ? delta : fn['+'](value, parseNumber(delta));
                if (sender instanceof SpriteMorph &&
                        (frame.owner instanceof SpriteMorph) &&
                        (sender !== frame.owner)) {
                    sender.shadowVar(name, newValue);
                } else {
                    frame.vars[name].value = newValue;
                }

            }
        };
        Object.assign(Process.prototype, {
            reportBasicSum: function (a, b) {
                a = parseNumber(a);
                b = parseNumber(b);
                if (Number.isNaN(a) || Number.isNaN(b)) return NaN;
                return fn['+'](a, b);
            },
            reportBasicDifference: function (a, b) {
                a = parseNumber(a);
                b = parseNumber(b);
                if (Number.isNaN(a) || Number.isNaN(b)) return NaN;
                return fn['-'](a, b);
            },
            reportBasicProduct: function (a, b) {
                a = parseNumber(a);
                b = parseNumber(b);
                if (Number.isNaN(a) || Number.isNaN(b)) return NaN;
                return fn['*'](a, b);
            },
            reportBasicQuotient: function (a, b) {
                a = parseNumber(a);
                b = parseNumber(b);
                if (fn['='](b, '0') && !fn['='](a, '0')) {
                      return (fn['<'](a, '0') ? SchemeNumber('-inf.0') : SchemeNumber('+inf.0'))
                };
                if (Number.isNaN(a) || Number.isNaN(b) || fn['='](b, '0')) return NaN;
                return fn['/'](a, b);
            },
            reportBasicPower: function (a, b) {
                a = parseNumber(a);
                b = parseNumber(b);
                if (Number.isNaN(a) || Number.isNaN(b)) return NaN;
                return fn['expt'](a, b);
            },
            reportBasicModulus: function (a, b) {
                a = parseNumber(a);
                b = parseNumber(b);
                if (Number.isNaN(a) || Number.isNaN(b)) return NaN;
                var result = fn.mod(a, b);
                if (fn['<'](b, '0') && fn['>'](result, '0')) {
                    result = fn['+'](result, b);
                }
                return result;
            },
            reportBasicRandom: function (min, max) {
                var floor = parseNumber(min),
                    ceil = parseNumber(max);
                if (Number.isNaN(floor) || Number.isNaN(ceil)) return NaN;
                if (!fn['='](fn.mod(floor, '1'), '0') || !fn['='](fn.mod(ceil, '1'), '0')) {
                    // One of the numbers isn't whole. Include the decimal.
                    return fn['+'](
                        fn['*'](
                            Math.random(),
                            fn['-'](ceil, floor)
                        ),
                        floor
                    );
                }
                return fn.floor(
                    fn['+'](
                        fn['*'](
                            Math.random(),
                            fn['+'](
                                fn['-'](ceil, floor),
                                '1'
                            )
                        ),
                        floor
                    )
                );
            },
            reportBasicLessThan: function (a, b) {
                a = parseNumber(a);
                b = parseNumber(b);
                if (Number.isNaN(a) || Number.isNaN(b)) return NaN;
                return fn['<'](a, b);
            },
            reportBasicGreaterThan: function (a, b) {
                a = parseNumber(a);
                b = parseNumber(b);
                if (Number.isNaN(a) || Number.isNaN(b)) return NaN;
                return fn['>'](a, b);
            },
            reportEqual: function (a, b) {
                x = parseNumber(a);
                y = parseNumber(b);
                if (Number.isNaN(x) || Number.isNaN(y)) return snapEquals(a, b);
                return fn['='](x, y);
            },
            reportIsIdentical: function (a, b) {
                x = parseNumber(a);
                y = parseNumber(b);
                if (Number.isNaN(x) || Number.isNaN(y)) return originalPrims.reportIsIdentical(a, b);
                return fn['='](x, y);
            },
            reportMonadic: function (fname, n) {
                if (this.enableHyperOps) {
                    if (n instanceof List) {
                        return n.map(each => this.reportMonadic(fname, each));
                    }
                }

                n = parseNumber(n);
                if (Number.isNaN(n)) return NaN;

                switch (Process.prototype.inputOption(fname)) {
                case 'abs':
                    return fn.abs(n);
                case 'neg':
                    return fn['-'](n);
                case 'ceiling':
                    return fn.ceiling(n);
                case 'floor':
                    return fn.floor(n);
                case 'sqrt':
                    return sqrt(n);
                case 'sin':
                    return fn.sin(radians(n));
                case 'cos':
                    return fn.cos(radians(n));
                case 'tan':
                    return fn.tan(radians(n));
                case 'asin':
                    return degrees(fn.asin(n));
                case 'acos':
                    return degrees(fn.acos(n));
                case 'atan':
                    return degrees(fn.atan(n));
                case 'ln':
                    return fn.log(n);
                case 'log':
                    return fn.log(n, '10');
                case 'lg':
                    return fn.log(n, '2');
                case 'e^':
                    return fn.exp(n);
                case '10^':
                    return fn.expt('10', n);
                case '2^':
                    return fn.expt('2', n);
                default:
                    return SchemeNumber('0');
                }
            }
        });
    } else {
        InputSlotMorph.prototype.evaluate = window.bigNumbers.originalEvaluate;
        VariableFrame.prototype.changeVar = window.bigNumbers.originalChangeVar;
        Object.assign(Process.prototype, originalPrims);
    }
    done = true;
}

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

function sqrt (n) {
    var fn = SchemeNumber.fn;

    if (!fn['exact?'](n) || !fn['rational?'](n) || fn['<'](n,'0')) return fn.sqrt(n);

    var rootNumerator = fn['exact-integer-sqrt'](fn.numerator(n));
    if (!fn['='](rootNumerator[1], '0')) return fn.sqrt(n);

    var rootDenominator = fn['exact-integer-sqrt'](fn.denominator(n));
    if (!fn['='](rootDenominator[1], '0')) return fn.sqrt(n);

    return fn['/'](rootNumerator[0], rootDenominator[0]);
}

function isDone () {
    return done;
}

if (window.bigNumbers) {
    loadBlocks();
} else {
    initialize(loadBlocks);
}

//return isDone;