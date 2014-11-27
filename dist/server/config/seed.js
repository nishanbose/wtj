/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

// var Thing = require('../api/thing/thing.model');
var User = require('../api/user/user.model');
var Category = require('../api/category/category.model');
var List = require('../api/list/list.model');
var tracer = require('tracer').console({ level: 'warn' });

/*
 Thing.find().remove(function() {
  Thing.create({
    name : 'Development Tools',
    info : 'Integration with popular tools such as Bower, Grunt, Karma, Mocha, JSHint, Node Inspector, Livereload, Protractor, Jade, Stylus, Sass, CoffeeScript, and Less.'
  }, {
    name : 'Server and Client integration',
    info : 'Built with a powerful and fun stack: MongoDB, Express, AngularJS, and Node.'
  }, {
    name : 'Smart Build System',
    info : 'Build system ignores `spec` files, allowing you to keep tests alongside code. Automatic injection of scripts and styles into your index.html'
  },  {
    name : 'Modular Structure',
    info : 'Best practice client and server structures allow for more code reusability and maximum scalability'
  },  {
    name : 'Optimized Build',
    info : 'Build process packs up your templates as a single JavaScript payload, minifies your scripts/css/images, and rewrites asset names for caching.'
  },{
    name : 'Deployment Ready',
    info : 'Easily deploy your app to Heroku or Openshift with the heroku and openshift subgenerators'
  });
});
*/

exports.createUsers = function(n, callback) {
  User.find().remove(function() {
    var user_params = [{
      provider: 'local',
      role: 'admin',
      name: 'Admin',
      email: 'admin@admin.com',
      password: 'admin',
      active: true
    }];
    for (var i=1 ; i <= n ; ++i) {
      user_params.push({
        provider: 'local',
        role: 'user',
        name: 'Test User ' + Number(i+100),
        email: 'test:i@test.com'.replace(/:i/, Number(i+100)),
        password: 'test',
        active: true
      });
    }
    User.create(user_params, function(err) {
      if (err) tracer.info(err ? err : 'finished populating users');
      var results = Array.prototype.slice.call(arguments, 1);
      callback(err, results);
    });
  });
};

exports.createCategories = function(n, callback) {
  Category.find().remove(function() {
    var cat_params = [];
    for (var i=1 ; i <= n ; ++i) {
      cat_params.push({
        provider: 'local',
        name: 'Category ' + i,
        about: 'Category :i description goes here.'.replace(/:i/, i)
      });
    }
    Category.create(cat_params, function(err) {
      tracer.info(err ? err : 'finished populating categories');
      var results = Array.prototype.slice.call(arguments, 1);
      callback(err, results);
    });
  });
};

// Return n random items from array
var pickRandom = function(ar, n) {
  var result = [];
  for (var i=0 ; i < n ; ++i) {
    var r = Math.floor(Math.random() * ar.length);
    result.push(ar[r]);
  }
  return result;
}

exports.createLists = function(n, callback) {
  List.find().remove(function() {
    var list_params = [];
    var items = [];
    for (var i=1 ; i <= 12 ; ++i) {
      items.push('item ' + i)
    }
    for (var k=1 ; k <= 12 ; ++k) {
      list_params.push({
        provider: 'local',
        title: 'List ' + k,
        about: 'List :k description goes here.'.replace(/:k/, k),
        items: items
      });
    }
    List.create(list_params, function(err) {
      tracer.info(err ? err : 'finished populating lists');
      var results = Array.prototype.slice.call(arguments, 1);
      callback(err, results);
    });
  });
};

exports.assignListCategoriesAndAuthors = function(lists, cats, users, callback) {
  // console.log('assignListCategories(), :lists lists, :cats cats'
  // .replace(/:lists/, lists.length)
  // .replace(/:cats/, cats.length));
  var promises = [];
  lists.forEach(function(list) {
    list.categories = pickRandom(cats, 3).map(function(cat) { return cat._id });
    list.author = pickRandom(users, 1)[0];
    promises.push(function(cb) {
      list.save(function(err) {
        if (err) { tracer.error(err); }
        callback(err);
      });
    });
  });
  
  var async = require('async');
  async.series(promises, function(err) {
    if (err) {
      tracer.error(err);
      tracer.error(new Error().stack);
    } else {
      tracer.info('Finished assigning users and categories to lists.');
    }
    callback(err, Array.prototype.slice.call(arguments, 1));
  });
};
