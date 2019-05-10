"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

// Node, or global
;

(function (root) {
  // eslint-disable-line no-extra-semi
  'use strict';

  var module = {
    factories: {}
  };
  Object.defineProperty(module, 'exports', {
    get: function get() {
      return null;
    },
    set: function set(val) {
      module.factories[val.name] = val.factory;
    },
    // this property should show up when this object's property names are enumerated
    enumerable: true,
    // this property may not be deleted
    configurable: false
  });
  module.exports = {
    name: 'immutable',
    factory: function factory(Blueprint) {
      'use strict';

      var is = Blueprint.is,
          blueprint = Blueprint.blueprint;
      /**
       * Returns true if the object matches the (@polyn/blueprint).blueprint signature
       * @param {any} input - the value to test
       */

      var isBlueprint = function isBlueprint(input) {
        return is.object(input) && is.string(input.name) && is.function(input.validate) && is.object(input.schema);
      };
      /**
       * The default validator uses @polyn/blueprint for vaidation
       * This can be overrided, to use things like ajv and JSON Schemas
       * @param {string} name - the name of the model
       * @param {object} schema - the blueprint schema
       */


      function Validator(name, schema) {
        var bp;

        if (isBlueprint(name)) {
          // a blueprint was passed as the first argument
          bp = name;
        } else {
          bp = blueprint(name, schema);
        }

        if (bp.err) {
          throw bp.err;
        }

        return {
          validate: function validate(input) {
            var validationResult = bp.validate(input);

            if (validationResult.err) {
              throw validationResult.err;
            }

            return validationResult;
          }
        };
      }
      /**
       * Freezes an array, and all of the array's values, recursively
       * @param {array} input - the array to freeze
       */


      var freezeArray = function freezeArray(input) {
        return Object.freeze(input.map(function (val) {
          if (is.array(val)) {
            return freezeArray(val);
          } else if (is.object(val)) {
            return new Immutable(val);
          } else {
            return val;
          }
        }));
      };
      /**
       * Creates a new object from the given, `that`, and overwrites properties
       * on it with the given, `input`
       * @curried
       * @param {any} that - the object being patched
       * @param {any} input - the properties being written
       */


      var _patch = function patch(that) {
        return function (input) {
          var output = Object.assign({}, that);
          Object.keys(input).forEach(function (key) {
            if (is.array(input[key])) {
              output[key] = input[key];
            } else if (is.object(input[key])) {
              output[key] = _patch(output[key])(input[key]);
            } else {
              output[key] = input[key];
            }
          });
          return output;
        };
      };
      /**
       * Creates a new object from the given, `that`, and overwrites properties
       * on it with the given, `input`
       * @curried
       * @param {any} that - the object being patched
       * @param {any} input - the properties being written
       */


      var _toObject = function toObject(that) {
        var shallowClone = Object.assign({}, that);
        var output = {};
        Object.keys(shallowClone).forEach(function (key) {
          if (typeof shallowClone[key].toObject === 'function') {
            output[key] = shallowClone[key].toObject();
          } else if (is.array(shallowClone[key])) {
            output[key] = Object.assign([], shallowClone[key]);
          } else if (is.object(shallowClone[key])) {
            output[key] = Object.assign({}, shallowClone[key]);
          } else {
            output[key] = shallowClone[key];
          }
        });
        return output;
      };

      var push = function push(arr) {
        return function (newEntry) {
          return [].concat(_toConsumableArray(arr), [newEntry]);
        };
      };

      var pop = function pop(arr) {
        return function () {
          return arr.slice(0, -1);
        };
      };

      var shift = function shift(arr) {
        return function () {
          return arr.slice(1);
        };
      };

      var unshift = function unshift(arr) {
        return function (newEntry) {
          return [newEntry].concat(_toConsumableArray(arr));
        };
      };

      var sort = function sort(arr) {
        return function (compareFunction) {
          return _toConsumableArray(arr).sort(compareFunction);
        };
      };

      var reverse = function reverse(arr) {
        return function () {
          return _toConsumableArray(arr).reverse();
        };
      };

      var splice = function splice(arr) {
        return function (start, deleteCount) {
          for (var _len = arguments.length, items = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
            items[_key - 2] = arguments[_key];
          }

          return [].concat(_toConsumableArray(arr.slice(0, start)), items, _toConsumableArray(arr.slice(start + deleteCount)));
        };
      };

      var remove = function remove(arr) {
        return function (index) {
          return arr.slice(0, index).concat(arr.slice(index + 1));
        };
      };

      var copy = function copy(arr) {
        return function () {
          return _toConsumableArray(arr);
        };
      };
      /**
       * Freezes an object, and all of it's values, recursively
       * @param {object} input - the object to freeze
       */


      var Immutable =
      /*#__PURE__*/
      function () {
        function Immutable(input) {
          var _this = this;

          _classCallCheck(this, Immutable);

          Object.keys(input).forEach(function (key) {
            if (is.array(input[key])) {
              _this[key] = freezeArray(input[key]);
            } else if (is.object(input[key])) {
              _this[key] = new Immutable(input[key]);
            } else {
              _this[key] = input[key];
            }
          });

          if ((this instanceof Immutable ? this.constructor : void 0) === Immutable) {
            Object.freeze(this);
          }
        }

        _createClass(Immutable, [{
          key: "toObject",
          value: function toObject() {
            return _toObject(this);
          }
        }]);

        return Immutable;
      }();

      function ImmutableInstance(config) {
        config = _objectSpread({}, {
          Validator: Validator
        }, config);
        /**
         * Creates a Validator (@polyn/blueprint by default) and returns a
         * function for creating new instances of objects that get validated
         * against the given schema. All of the properties on the returned
         * value are immutable
         * @curried
         * @param {string|blueprint} name - the name of the immutable, or an existing blueprint
         * @param {object} schema - the blueprint schema
         */

        return function (name, schema) {
          var validator = new config.Validator(name, schema);
          /**
           * Validates, and then freezes an object, and all of it's values, recursively
           * @param {object} input - the object to freeze
           */

          var ValidatedImmutable =
          /*#__PURE__*/
          function (_Immutable) {
            _inherits(ValidatedImmutable, _Immutable);

            function ValidatedImmutable(input) {
              var _this2;

              _classCallCheck(this, ValidatedImmutable);

              var result = validator.validate(input);
              _this2 = _possibleConstructorReturn(this, _getPrototypeOf(ValidatedImmutable).call(this, result && result.value || input));

              if ((this instanceof ValidatedImmutable ? this.constructor : void 0) === ValidatedImmutable) {
                Object.freeze(_assertThisInitialized(_this2));
              }

              return _this2;
            }

            _createClass(ValidatedImmutable, [{
              key: "patch",
              value: function patch(input) {
                return new ValidatedImmutable(_patch(this)(input));
              }
            }, {
              key: "getSchema",
              value: function getSchema() {
                return schema;
              }
            }]);

            return ValidatedImmutable;
          }(Immutable);

          return ValidatedImmutable;
        };
      }

      return {
        immutable: new ImmutableInstance(),
        Immutable: ImmutableInstance,
        patch: _patch,
        array: function array(arr) {
          return {
            push: push(arr),
            pop: pop(arr),
            shift: shift(arr),
            unshift: unshift(arr),
            sort: sort(arr),
            reverse: reverse(arr),
            splice: splice(arr),
            remove: remove(arr),
            copy: copy(arr)
          };
        }
      };
    }
  };
  root.polyn = root.polyn || {};

  if (!root.polyn.blueprint) {
    throw new Error('@polyn/immutable requires @polyn/blueprint to be included before it');
  }

  var immutable = module.factories.immutable(root.polyn.blueprint);
  root.polyn.immutable = Object.freeze(_objectSpread({}, immutable)); // we don't need these anymore

  delete module.factories;
})(window);