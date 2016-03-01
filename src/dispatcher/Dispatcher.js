import Promise from 'es6-promise'
import assign from 'object-assign'

var callbacks = [];
var promises = [];

export default class Dispatcher {

  /**
   * Register a Store's callback so that it may be invoked by an action.
   * @param {function} callback The callback to be registered.
   * @return {number} The index of the callback within the _callbacks array.
   */
  register(callback) {
    callbacks.push(callback);
    return callbacks.length - 1; // index
  }

  /**
   * dispatch
   * @param  {object} payload The data from the action.
   */
  dispatch(payload) {
    // First create array of promises for callbacks to reference.
    var resolves = [];
    var rejects = [];
    promises = callbacks.map(function(_, i) {
      return new Promise(function(resolve, reject) {
        resolves[i] = resolve;
        rejects[i] = reject;
      });
    });
    // Dispatch to callbacks and resolve/reject promises.
    callbacks.forEach(function(callback, i) {
      // Callback can return an obj, to resolve, or a promise, to chain.
      // See waitFor() for why this might be useful.
      Promise.resolve(callback(payload)).then(function() {
        resolves[i](payload);
      }, function() {
        rejects[i](new Error('Dispatcher callback unsuccessful'));
      });
    });
    promises = [];
  }
}
