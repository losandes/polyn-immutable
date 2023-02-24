// Node, or global
;(function (root) { // eslint-disable-line no-extra-semi
  'use strict'

  const module = { factories: {} }

  Object.defineProperty(module, 'exports', {
    get: function () {
      return null
    },
    set: function (val) {
      module.factories[val.name] = val.factory
    },
    // this property should show up when this object's property names are enumerated
    enumerable: true,
    // this property may not be deleted
    configurable: false,
  })

  // MODULES_HERE

  root.polyn = root.polyn || {}

  if (!root.polyn.blueprint) {
    throw new Error('@polyn/immutable requires @polyn/blueprint to be included before it')
  }

  const immutable = module.factories.immutable(root.polyn.blueprint)

  root.polyn.immutable = Object.freeze({
    ...immutable,
  })

  // we don't need these anymore
  delete module.factories
}(window))
