"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
       * Returns true if the object matches the (@polyn/immutable).immutable signature
       * @param {any} input - the value to test
       */


      var isImmutable = function isImmutable(input) {
        var proto = Object.getPrototypeOf(input);
        return is.object(input) && (is.function(input.isPolynImmutable) || is.function(proto && proto.isPolynImmutable));
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
       * Creates a new, mutable object from the given, `that`
       * @curried
       * @param {any} that - the object being patched
       * @param {any} options - whether or not to remove functions
       */


      var _toObject = function toObject(that, options) {
        var shallowClone = Object.assign({}, that);
        var output = {};

        var _removeFunctions$opti = _objectSpread(_objectSpread({}, {
          removeFunctions: false
        }), options),
            removeFunctions = _removeFunctions$opti.removeFunctions;

        Object.keys(shallowClone).forEach(function (key) {
          if (shallowClone[key] && typeof shallowClone[key].toObject === 'function') {
            output[key] = shallowClone[key].toObject(options);
          } else if (is.array(shallowClone[key])) {
            output[key] = Object.assign([], shallowClone[key]);
          } else if (is.object(shallowClone[key])) {
            output[key] = Object.assign({}, shallowClone[key]);
          } else if (is.function(shallowClone[key]) && removeFunctions === true) {// do nothing
          } else {
            output[key] = shallowClone[key];
          }
        });
        return output;
      };

      var push = function push(arr) {
        return function () {
          for (var _len = arguments.length, newEntry = new Array(_len), _key = 0; _key < _len; _key++) {
            newEntry[_key] = arguments[_key];
          }

          return [].concat(_toConsumableArray(arr), newEntry);
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
        return function () {
          for (var _len2 = arguments.length, newEntry = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            newEntry[_key2] = arguments[_key2];
          }

          return [].concat(newEntry, _toConsumableArray(arr));
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

      var copy = function copy(arr) {
        return function () {
          return _toConsumableArray(arr);
        };
      };

      var slice = function slice(arr) {
        return function () {
          return arr.slice.apply(arr, arguments);
        };
      };

      var splice = function splice(arr) {
        return function (start, deleteCount) {
          for (var _len3 = arguments.length, items = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
            items[_key3 - 2] = arguments[_key3];
          }

          return [].concat(_toConsumableArray(arr.slice(0, start)), items, _toConsumableArray(arr.slice(start + deleteCount)));
        };
      };

      var remove = function remove(arr) {
        return function (index) {
          return arr.slice(0, index).concat(arr.slice(index + 1));
        };
      };

      function PolynImmutable(config) {
        config = _objectSpread(_objectSpread({}, {
          Validator: Validator
        }), config);
        /**
         * Creates a Validator (@polyn/blueprint by default) and returns a
         * function for creating new instances of objects that get validated
         * against the given schema. All of the properties on the returned
         * value are immutable
         * @curried
         * @param {string|blueprint} name - the name of the immutable, or an existing blueprint
         * @param {object} schema - the blueprint schema
         */

        var immutable = function immutable(name, schema, options) {
          var validator = new config.Validator(name, schema);

          var _functionsOnPrototype = _objectSpread(_objectSpread({}, {
            functionsOnPrototype: false
          }), options),
              functionsOnPrototype = _functionsOnPrototype.functionsOnPrototype; // NOTE the classes, and freezeArray are in here, so their
          // prototypes don't cross-contaminate

          /**
           * Freezes an array, and all of the array's values, recursively
           * @param {array} input - the array to freeze
           */


          var freezeArray = function freezeArray(input) {
            return Object.freeze(input.map(function (val) {
              if (is.array(val)) {
                return freezeArray(val);
              } else if (is.object(val) && !isImmutable(val)) {
                return new Immutable(val);
              } else {
                return val;
              }
            }));
          };
          /**
           * Freezes an object, and all of it's values, recursively
           * @param {object} input - the object to freeze
           */


          var Immutable = /*#__PURE__*/function () {
            function Immutable(input) {
              var _this = this;

              _classCallCheck(this, Immutable);

              Object.keys(input).forEach(function (key) {
                if (is.array(input[key])) {
                  _this[key] = freezeArray(input[key]);
                } else if (is.object(input[key]) && !isImmutable(input[key])) {
                  _this[key] = new Immutable(input[key]);
                } else if (functionsOnPrototype && is.function(input[key])) {
                  Immutable.prototype[key] = input[key];
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
              value: function toObject(options) {
                return _toObject(this, options);
              }
            }, {
              key: "isPolynImmutable",
              value: function isPolynImmutable() {
                return true;
              }
            }]);

            return Immutable;
          }();
          /**
           * Validates, and then freezes an object, and all of it's values, recursively
           * @param {object} input - the object to freeze
           */


          var ValidatedImmutable = /*#__PURE__*/function (_Immutable) {
            _inherits(ValidatedImmutable, _Immutable);

            var _super = _createSuper(ValidatedImmutable);

            function ValidatedImmutable(input) {
              var _this2;

              _classCallCheck(this, ValidatedImmutable);

              var result = validator.validate(input);
              _this2 = _super.call(this, result && result.value || input);

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

        return {
          immutable: immutable
        };
      }

      return {
        immutable: new PolynImmutable().immutable,
        PolynImmutable: PolynImmutable,
        patch: _patch,
        makeMutableClone: _toObject,
        array: function array(arr) {
          return {
            push: push(arr),
            pop: pop(arr),
            shift: shift(arr),
            unshift: unshift(arr),
            sort: sort(arr),
            reverse: reverse(arr),
            splice: splice(arr),
            slice: slice(arr),
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