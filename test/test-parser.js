
const _ = require('underscore');
const path = require('path');
const assert = require('assert');
const parser = require('../lib/docparser');
const builder = require('../lib/builder');
const Firedoc = require('../lib/firedoc').Firedoc;

describe('firedoc.parser', function () {

  describe('basic', function () {
    var src = path.join(__dirname, './targets/basic');
    var doc = new Firedoc({'paths': [src], cwd: src, withSrc: true});
    var ast, ctx;
    before(function (next) {
      doc.walk(next);
    });
    before(function () {
      ast = parser.parse('js', doc.filemap, doc.dirmap);
    });
    it('should check project', function () {
      assert.deepEqual(ast.project, {
        'name': 'test',
        'description': 'test',
        'logo': 'https://github.com/fireball-x/firedoc'
      });
      assert.equal('js', ast.syntaxType);
    });
    it('should check files', function () {
      _.each(ast.files, function (file, name) {
        assert.equal('test/targets/basic/index.js', name);
        assert.equal('test/targets/basic/index.js', file.name);
        assert.ok(file.code);
      });
    });
    it('should check modules', function () {
      _.each(ast.modules, function (mod, name) {
        assert.equal('exampleModule', name);
        assert.equal('exampleModule', mod.name);
        assert.equal('module', mod.tag);
        assert.equal('test/targets/basic/index.js', mod.file);
        assert.equal(2, mod.line);
        assert.equal('modules', mod.type);
        assert.equal('yorkiefixer@gmail.com', mod.author);
      });
    });
    it('should check classes', function () {
      _.each(ast.classes, function (clazz, name) {
        assert.equal('ExampleClass', name);
        assert.equal('ExampleClass', clazz.name);
        assert.equal('test/targets/basic/index.js', clazz.file);
        assert.equal(2, clazz.line);
        assert.equal('classes', clazz.type);
      });
    });
    it('should check members', function () {
      _.each(ast.members, function (member) {
        assert.equal('test/targets/basic/index.js', member.file);
        assert.equal(12, member.line);
        assert.equal('method', member.itemtype);
        assert.equal('method1', member.name);
        assert.equal('ExampleClass', member.clazz);
        assert.equal('exampleModule', member.module);
        assert.equal(false, member.isGlobal);
        assert.deepEqual([
          { 
            name: 'num', 
            description: 'The Number', 
            type: 'Number' 
          }
        ], member.params);
      });
    });
    it('should check inherited members', function () {
      assert.deepEqual([], ast.inheritedMembers);
    });
    it('should compile the ast', function (next) {
      ctx = builder.compile(ast, doc.options, next);
      ctx.on('index', function (locals, html) {
        assert.equal(locals.project, require('./targets/basic/package.json'));
        assert.equal(locals.layout, 'main');
        assert.ok(locals.i18n);
        var class1 = locals.classes[0];
        assert.ok(class1.globals);
        assert.ok(class1.i18n);
        assert.equal(class1.description, '<p>Module Description</p>\n');
        assert.equal(class1.foundAt, '../files/test_targets_basic_index.js.html#l2');
        assert.equal(class1.namespace, 'exampleModule.ExampleClass');
        assert.deepEqual(class1.project, {
          name: 'test',
          description: 'test',
          logo: 'https://github.com/fireball-x/firedoc',
          root: path.join(__dirname, '../out'),
          base: path.join(__dirname, '../out'),
          assets: path.join(__dirname, '../out/assets'),
        });
        var mod1 = locals.modules[0];
        assert.ok(mod1.globals);
        assert.ok(mod1.i18n);
        assert.equal(mod1.description, '<p>Module Description</p>\n');
        assert.equal(mod1.foundAt, '../files/test_targets_basic_index.js.html#l2');
        assert.equal(mod1.namespace, 'exampleModule');
        assert.deepEqual(mod1.classes, [class1]);
        assert.deepEqual(mod1.properties, []);
        assert.deepEqual(mod1.attributes, []);
        assert.deepEqual(mod1.methods, []);
        assert.deepEqual(mod1.events, []);
      });
      ctx.on('apimeta', function (apimeta) {
        assert.ok(apimeta.enums);
        assert.ok(apimeta.classes);
        assert.ok(apimeta.modules);
      });
      ctx.on('file', function (locals) {
        assert.ok(locals.name);
        assert.ok(locals.code);
        assert.ok(locals.path);
        assert.ok(locals.i18n);
        assert.ok(locals.globals);
      });
      ctx.on('module', function (locals) {
        assert.ok(locals.name);
        assert.ok(locals.assets);
        assert.ok(locals.classes);
        assert.ok(locals.submodules);
        assert.ok(locals.fors);
        assert.ok(locals.file);
        assert.ok(locals.line);
        assert.ok(locals.description);
        assert.ok(locals.foundAt);
        assert.ok(locals.members);
        assert.ok(locals.project);
        assert.ok(locals.i18n);
        assert.ok(locals.namespace);
        assert.ok(locals.properties);
        assert.ok(locals.attributes);
        assert.ok(locals.methods);
        assert.ok(locals.events);
        assert.ok(locals.globals);
        assert.equal(locals.type, 'modules');
      });
      ctx.on('class', function (locals) {
        assert.ok(locals.assets);
        assert.ok(locals.cwd);
        assert.ok(locals.name);
        assert.ok(locals.shortname);
        assert.ok(locals.members);
        assert.ok(locals.members.inherited);
        assert.ok(locals.members.methods);
        assert.ok(locals.plugins);
        assert.ok(locals.pluginFor);
        assert.ok(locals.module === 'exampleModule');
        assert.ok(locals.submodule === null);
        assert.ok(locals.namespace);
        assert.ok(locals.isEnum === false);
        assert.ok(locals.type === 'classes');
        assert.ok(locals.file);
        assert.ok(locals.line);
        assert.ok(locals.description);
        assert.ok(locals.foundAt);
        assert.ok(locals.project);
        assert.ok(locals.globals);
        assert.ok(locals.i18n);
        assert.ok(locals.inheritance);
      });
    });
  });

  describe('modules', function () {
    var src = path.join(__dirname, './targets/module');
    var doc = new Firedoc({'paths': [src]});
    var ast;
    before(function (next) {
      doc.walk(next);
    });
    before(function () {
      ast = parser.parse('js', doc.filemap, doc.dirmap);
    });
    var submodule1, submodule2;
    it('should check files and codes', function () {
      assert.equal(6, _.keys(ast.files).length);
      assert.equal(6, _.keys(ast.codes).length);
    });
    it('should check mod1', function () {
      var mod1 = ast.modules.mod1;
      assert.equal('class1', mod1.classes.class1.name);
      assert.equal('test/targets/module/mod1.js', mod1.file);
      assert.equal(2, mod1.line);
      assert.equal('mod1', mod1.name);
      assert.equal('mod1', mod1.mainName);
      assert.equal('main', mod1.tag);
      assert.equal('main', mod1.itemtype);
      assert.equal('Module Description 1', mod1.description);
      assert.ok(mod1.submodules.submod1);
      assert.ok(mod1.submodules.submod2);
      submodule1 = mod1.submodules.submod1;
      submodule2 = mod1.submodules.submod2;
    });
    it('should check mod2', function () {
      var mod2 = ast.modules.mod2;
      assert.equal('mod2', mod2.name);
      assert.equal('mod2', mod2.mainName);
      assert.equal('main', mod2.tag);
      assert.equal('main', mod2.itemtype);
      assert.equal('Module Description 2', mod2.description);
    });
    it('should check submodules', function () {
      assert.deepEqual(submodule1, ast.modules.submod1);
      assert.deepEqual(submodule2, ast.modules.submod2);
      assert.equal('test/targets/module/submod1.js', ast.modules.submod1.file);
    });
    it('should check direct methods', function () {
      assert.equal('Direct method', ast.members[0].description);
      assert.equal('method', ast.members[0].itemtype);
      assert.equal('directMethod', ast.members[0].name);
      assert.equal('', ast.members[0].clazz);
      assert.equal('mod1', ast.members[0].module);
      assert.equal(true, ast.members[0].isGlobal);
      assert.deepEqual(
        { 
          description: '', 
          type: 'String' 
        },
        ast.members[0].return
      );
    });
    it('should compile the ast', function (next) {
      builder.compile(ast, doc.options, next);
    });
  });

  describe('classes', function () {
    var src = path.join(__dirname, './targets/class');
    var doc = new Firedoc({'paths': [src]});
    var ast;
    before(function (next) {
      doc.walk(next);
    });
    before(function () {
      ast = parser.parse('js', doc.filemap, doc.dirmap);
    });
    it('should check undefined module', function () {
      assert.ok(ast.modules.undefinedmodule);
    });
    it('should check class1', function () {
      var class1 = ast.classes.ClazzExample;
      assert.equal('ClazzExample', class1.name);
      assert.equal('undefinedmodule', class1.module);
      assert.equal(false, class1.isEnum);
      assert.equal('classes', class1.type);
      assert.equal('Class description', class1.description);
    });
    it('should check class2', function () {
      var class2 = ast.classes.SecondClazz;
      assert.equal('SecondClazz', class2.name);
      assert.equal('undefinedmodule', class2.module);
      assert.equal(false, class2.isEnum);
      assert.equal('classes', class2.type);
      assert.equal('The second class', class2.description);
    });
    it('should check enum', function () {
      var enumEx = ast.classes.EnumEx;
      assert.equal('EnumEx', enumEx.name);
      assert.equal(true, enumEx.isEnum);
      assert.equal('enums', enumEx.type);
      assert.equal('The enum description [example](undefinedmodule.ClazzExample.method1)', enumEx.description);
    });
    it('should check members', function () {
      var members = ast.members;
      assert.equal('property', members[0].itemtype);
      assert.equal('ClazzExample', members[0].clazz);
      assert.equal('undefinedmodule', members[0].module);
      assert.equal('The prop 1', members[0].description);
      assert.equal('property', members[1].itemtype);
      assert.equal('ClazzExample', members[1].clazz);
      assert.equal('undefinedmodule', members[1].module);
      assert.equal('The name2', members[1].description);
      assert.equal('method1 description', members[2].description);
      assert.equal('method1', members[2].name);
      assert.deepEqual(
        [ 
          {
            name: 'name', 
            description: '', 
            type: 'String'
          }
        ],
        members[2].params
      );
      assert.deepEqual(
        {
          description: '', 
          type: 'String|Number'
        },
        members[2].return
      );
      assert.equal('method2 description 2', members[4].description);
      assert.equal('method2_with_description', members[4].name);
      assert.deepEqual(
        [ 
          {
            name: 'name',
            description: 'The name description',
            type: 'String' 
          } 
        ],
        members[4].params
      );
      assert.deepEqual(
        { 
          description: 'The return value', 
          type: 'String' 
        },
        members[4].return
      );
    });
    it('should check inheritedMembers', function () {
      assert.deepEqual([
        [ 
          'ClazzExample',
          'SecondClazz'
        ],
        [
          'ClazzExample',
          'ThirdClazz'
        ]
      ], ast.inheritedMembers);
    });
    it('should compile the ast', function (next) {
      var ctx = builder.compile(ast, doc.options, next);
      ctx.on('class', function (locals) {
        if (locals.name === 'SecondClazz') {
          var method1 = _.findWhere(locals.members, {'name': 'method1'});
          assert.ok(method1.overwrittenFrom);
          var method2 = _.findWhere(locals.members, {'name': 'method2'});
          assert.ok(method2.extendedFrom);
        }
      });
      ctx.on('enum', function (locals) {
        assert.equal(locals.name, 'EnumEx');
        assert.equal(locals.namespace, 'undefinedmodule.EnumEx');
        assert.equal(locals.description, '<p>The enum description <a href="classes/ClazzExample.html#method_method1">example</a></p>\n');
      });
    });
  });

  describe('members', function () {
    var src = path.join(__dirname, './targets/members');
    var doc = new Firedoc({'paths': [src]});
    var ast;
    before(function (next) {
      doc.walk(next);
    });
    before(function () {
      ast = parser.parse('js', doc.filemap, doc.dirmap);
    });
    it('should check members', function () {
      var example1 = ast.members[0];
      assert.equal(15, example1.line);
      assert.equal('example_optional', example1.name);
      assert.equal(true, example1.isConstructor);
      assert.deepEqual([
        '```js\nexample\n\n```'
      ], example1.example);
      assert.deepEqual([
        {
          name: 'x',
          description: 'The default value is 10(test)',
          type: 'Number',
          optional: true,
          optdefault: '10'
        },
        { 
          name: 'y',
          description: '',
          type: 'Object',
          optional: true,
          optdefault: '{}' 
        },
        { 
          name: 'z',
          description: '',
          type: 'Array',
          optional: true,
          optdefault: '[]' 
        },
        {
          name: 'callback',
          description: 'common callback',
          type: 'commoncall',
          props: [
            {
              'description': 'The error as first argument',
              'type': 'Error',
              'name': 'err'
            },
            {
              'description': 'The returned object',
              'type': 'Object',
              'name': 'obj'
            }
          ]
        }
      ], example1.params);

      var example2 = ast.members[1];
      assert.equal(example2.access, 'public');
      assert.deepEqual([ 
        '```Not found for the example path: test/examples/ex0.js',
        '```js\n// this is an example js for test\nvar foo = bar;\n```' 
      ], example2.example);
      assert.deepEqual([
        {
          name: 'o',
          description: '',
          type: 'Object',
          props: [
            { 
              name: 'x', 
              description: '', 
              type: 'Number' 
            },
            { 
              name: 'y',
              description: '',
              type: 'Object',
              optional: true,
              optdefault: '{}',
              props: [
                {
                  name: 'a',
                  description: '',
                  type: 'Boolean'
                }
              ]
            }
          ]
        }
      ], example2.params);

      var example3 = ast.members[2];
      assert.equal(example3.final, '');
      assert.equal(example3.deprecated, true);
      assert.equal(example3.deprecationMessage, 'this is just deprecated');

      var example4 = ast.members[3];
      assert.equal(example4.name, 'md_link_in_method_params_desc');
      assert.equal(example4.params[0].type, 'Object');
      assert.equal(example4.params[0].optional, true);
      assert.equal(example4.params[0].name, 'webContents');
      assert.equal(example4.params[0].description, 'A [WebContents](https://github.com/atom/electron/blob/master/docs/api/browser-window.md#class-webcontents) object');

      var example5 = ast.members[4];
      assert.ok(example5.example);
    });
    it('should compile the ast', function (next) {
      var ctx = builder.compile(ast, doc.options, next);
      ctx.on('module', function (locals) {
        var example4 = locals.members[3];
        assert.equal(example4.methodDisplay, 'md_link_in_method_params_desc(webContents)');
        assert.equal(example4.name, 'md_link_in_method_params_desc');
        assert.equal(example4.params[0].description, '<p>A <a href="https://github.com/atom/electron/blob/master/docs/api/browser-window.md#class-webcontents">WebContents</a> object</p>\n');
        var example5 = locals.members[4];
        assert.ok(/(&#39|&amp|&quot);/.test(example5.example) === false);
      });
    });
  });
  
  describe('process', function () {
    var src = path.join(__dirname, './targets/process');
    var doc = new Firedoc({'paths': [src]});
    var ast;
    before(function (next) {
      doc.walk(next);
    });
    before(function () {
      ast = parser.parse('js', doc.filemap, doc.dirmap);
    });
    it('should check module', function () {
      var mod1 = ast.modules.mod1;
      assert.deepEqual(mod1.process, ['core']);
    });
    it('should check class', function () {
      var cls1 = ast.classes.cls1;
      assert.deepEqual(cls1.process, ['page']);
      var cls2 = ast.classes.cls2;
      assert.deepEqual(cls2.process, ['core']);
    });
    it('should check members', function () {
      var dm1 = _.findWhere(ast.members, {'name': 'dm1'});
      assert.deepEqual(dm1.process, ['core']);
      var dm2 = _.findWhere(ast.members, {'name': 'dm2'});
      assert.deepEqual(dm2.process, ['page']);
      var md1InCls1 = _.findWhere(ast.members, {'name': 'md1', 'clazz': 'cls1'});
      assert.deepEqual(md1InCls1.process, ['page']);
      var md2InCls1 = _.findWhere(ast.members, {'name': 'md2', 'clazz': 'cls1'});
      assert.deepEqual(md2InCls1.process, ['core']);
      var md1InCls2 = _.findWhere(ast.members, {'name': 'md1', 'clazz': 'cls2'});
      assert.deepEqual(md1InCls2.process, ['core']);
    });
  });

});
