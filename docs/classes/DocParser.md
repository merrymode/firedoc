
# firedoc 1.9.2

Fireball is the game engine for the future.

### `DocParser` Class



Module: [firedoc](../modules/firedoc.md)






### Index

##### Properties

  - [`TAGLIST`](#property-taglist) `Array` A list of known tags.  This populates a member variable
during initialization, and will be updated if additional
digesters are added.



##### Methods

  - [`stringlog`](#method-stringlog) Parses the JSON data and formats it into a nice log string for
filename and line number: `/file/name.js:123`
  - [`defineReadonly`](#method-definereadonly) Define the readonly properties





### Details


#### Properties


##### TAGLIST

> A list of known tags.  This populates a member variable
during initialization, and will be updated if additional
digesters are added.

| meta | description |
|------|-------------|
| Type | <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array" class="crosslink external" target="_blank">Array</a> |
| Defined | [lib/ast.js:52](../files/lib_ast.js.md#l52) |






<!-- Method Block -->
#### Methods


##### stringlog

Parses the JSON data and formats it into a nice log string for
filename and line number: `/file/name.js:123`

| meta | description |
|------|-------------|
| Defined | [lib/utils.js:418](../files/lib_utils.js.md#l418) |
| Return 		 | <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String" class="crosslink external" target="_blank">String</a> 

###### Parameters
- data <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object" class="crosslink external" target="_blank">Object</a> The data block from the parser


##### defineReadonly

Define the readonly properties

| meta | description |
|------|-------------|
| Defined | [lib/utils.js:446](../files/lib_utils.js.md#l446) |




