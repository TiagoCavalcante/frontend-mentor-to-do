/*
 * HTML5Sortable package
 * https://github.com/lukasoppermann/html5sortable
 *
 * Maintained by Lukas Oppermann <lukas@vea.re>
 *
 * Released under the MIT license.
 * 
 * Modified by Tiago Cavalcante Trindade <tiagotrindade111@gmail.com> (https://github.com/TiagoCavalcanteTrindade)
 */

function addData(element, key, value) {
	if (value === undefined) {
		return element && element.h5s && element.h5s.data && element.h5s.data[key];
	}
	else {
		element.h5s = element.h5s || {};
		element.h5s.data = element.h5s.data || {};
		element.h5s.data[key] = value;
	}
}
var stores = new Map();
function Store() {
	this._config = new Map();
	this._placeholder = undefined;
	this._data = new Map();
}
Object.defineProperty(Store.prototype, 'config', {
	get: function () {
		var config = {};
		this._config.forEach(function (value, key) {
			config[key] = value;
		});
		return config;
	},
	set: function (config) {
		var mergedConfig = Object.assign({}, config);
		this._config = new Map(Object.entries(mergedConfig));
	}
});
Store.prototype.setConfig = function (key, value) {
	this._config.set(key, value);
};
Store.prototype.getConfig = function (key) {
	return this._config.get(key);
};
Object.defineProperty(Store.prototype, 'placeholder', {
	get: function () {
		return this._placeholder;
	},
	set: function (placeholder) {
		this._placeholder = placeholder;
	}
});
Store.prototype.setData = function (key, value) {
	this._data.set(key, value);
};
Store.prototype.getData = function (key) {
	return this._data.get(key);
};
Store.prototype.deleteData = function (key) {
	return this._data.delete(key);
};
var store = (sortableElement) => {
	if (!stores.has(sortableElement))
		stores.set(sortableElement, new Store());

	return stores.get(sortableElement);
};

function addEventListener(element, eventName, callback) {
	if (element instanceof Array) {
		for (var i = 0; i < element.length; ++i) {
			addEventListener(element[i], eventName, callback);
		}
		return;
	}
	element.addEventListener(eventName, callback);
	store(element).setData('event' + eventName, callback);
}
function removeEventListener(element, eventName) {
	if (element instanceof Array) {
		for (var i = 0; i < element.length; ++i) {
			removeEventListener(element[i], eventName);
		}
		return;
	}
	element.removeEventListener(eventName, store(element).getData('event' + eventName));
	store(element).deleteData('event' + eventName);
}

function addAttribute(element, attribute, value) {
	if (element instanceof Array) {
		for (var i = 0; i < element.length; ++i) {
			addAttribute(element[i], attribute, value);
		}
		return;
	}
	element.setAttribute(attribute, value);
}

var _debounce = (func) => {
	var timeout;
	return function () {
		var args = [];
		for (var _i = 0; _i < arguments.length; _i++) {
			args[_i] = arguments[_i];
		}
		clearTimeout(timeout);
		timeout = setTimeout(function () {
			func.apply(void 0, args);
		}, 0);
	};
};

var _index = (element, elementList) => Array.from(elementList).indexOf(element);

var isInDom = (element) => element.parentNode !== null;

var insertNode = (referenceNode, newElement, position) => {
	referenceNode.parentElement.insertBefore(newElement, (position === 'before' ? referenceNode : referenceNode.nextElementSibling));
};
var insertBefore = (target, element) => insertNode(target, element, 'before');
var insertAfter = (target, element) => insertNode(target, element, 'after');

var _makePlaceholder = () => {
	var _a;

	var placeholder = document.createElement('li');
	(_a = placeholder.classList).add.apply(_a, ['sortable-placeholder']);

	return placeholder;
};

var _getElementHeight = (element) => {
	return ['height', 'padding-top', 'padding-bottom']
		.map((key) => parseInt(window.getComputedStyle(element).getPropertyValue(key), 10))
		.reduce((sum, value) => sum + value);
};

var _getElementWidth = (element) => ['width', 'padding-left', 'padding-right']
	.map((key) => parseInt(window.getComputedStyle(element).getPropertyValue(key), 10))
	.reduce((sum, value) => sum + value);

var getEventTarget = (event) => (event.composedPath && event.composedPath()[0]) || event.target;

var dragging;
var _removeItemEvents = (items) => {
	removeEventListener(items, 'dragstart');
	removeEventListener(items, 'dragend');
	removeEventListener(items, 'dragover');
	removeEventListener(items, 'drop');
};
function findSortable(event) {
	return event.composedPath().find((el) => el.isSortable);
}
function findDragElement(sortableElement, element) {
	var items = Array.from(sortableElement.children);
	var itemlist = items.filter((ele) => ele.contains(element) || (ele.shadowRoot && ele.shadowRoot.contains(element)));
	return itemlist.length > 0 ? itemlist[0] : element;
}
var _enableSortable = (sortableElement) => {
	var items = Array.from(sortableElement.children);
	addData(sortableElement, '_disabled', 'false');
	addAttribute(items, 'draggable', 'true');
};
var _reloadSortable = (sortableElement) => {
	var items = Array.from(sortableElement.children);
	addData(sortableElement, '_disabled', 'false');
	_removeItemEvents(items);
	removeEventListener(sortableElement, 'dragover');
	removeEventListener(sortableElement, 'drop');
};
sortable = () => {
	sortableElements = document.querySelectorAll('ul');
	sortableElements = Array.prototype.slice.call(sortableElements);
	sortableElements.forEach((sortableElement) => {
		var options = store(sortableElement).config;
		store(sortableElement).config = options;
		addData(sortableElement, 'opts', options);
		sortableElement.isSortable = true;
		_reloadSortable(sortableElement);
		var listItems = Array.from(sortableElement.children);
		store(sortableElement).placeholder = _makePlaceholder();
		addData(sortableElement, 'items', options.items);
		_enableSortable(sortableElement);
		addAttribute(listItems, 'role', 'option');
		addAttribute(listItems, 'aria-grabbed', 'false');
		addEventListener(sortableElement, 'dragstart', (e) => {
			var target = getEventTarget(e);
			e.stopImmediatePropagation();
			dragging = findDragElement(findSortable(e), target);
			addAttribute(dragging, 'aria-grabbed', 'true');
		});
		addEventListener(sortableElement, 'dragend', (e) => {
			addAttribute(dragging, 'aria-grabbed', 'false');
			dragging.style.display = dragging.oldDisplay;
			delete dragging.oldDisplay;
			var visiblePlaceholder = Array.from(stores.values()).map((data) => data.placeholder)
				.filter((placeholder) => placeholder instanceof HTMLElement)
				.filter(isInDom)[0];
			if (visiblePlaceholder) {
				visiblePlaceholder.remove();
			}
			dragging = null;

			// update toDos
			Array.from(document.getElementById('to_dos').children).forEach((element, index) => {
				toDos[index] = {
					complete: element.children[0].checked,
					text: element.children[1].value
				};

				localStorage.toDos = JSON.stringify(toDos);
			});

			document.getElementById('new_to_do').focus();
		});
		addEventListener(sortableElement, 'drop', (e) => {
			e.preventDefault();
			e.stopPropagation();
			addData(dragging, 'dropped', 'true');
			var visiblePlaceholder = Array.from(stores.values()).map((data) => data.placeholder)
				.filter((placeholder) => placeholder instanceof HTMLElement)[0];
			insertAfter(visiblePlaceholder, dragging);
			visiblePlaceholder.remove();

		});
		var debouncedDragOverEnter = _debounce((sortableElement, element, pageY) => {
			if (dragging.oldDisplay === undefined)
				dragging.oldDisplay = dragging.style.display;
			if (dragging.style.display !== 'none')
				dragging.style.display = 'none';
			var placeAfter = false;
			try {
				var elementMiddleVertical = element.getClientRects()[0].top + window.pageYOffset + element.offsetHeight / 2;
				placeAfter = (pageY >= elementMiddleVertical);
			}
			catch (e) {
				placeAfter = true;
			}
			if (placeAfter)
				insertAfter(element, store(sortableElement).placeholder);
			else
				insertBefore(element, store(sortableElement).placeholder);
			Array.from(stores.values())
				.filter((data) => data.placeholder !== undefined);
		});
		var onDragOverEnter = (e) => {
			var element = e.target;
			var sortableElement = findSortable(e);
			element = findDragElement(sortableElement, element);
			e.preventDefault();
			e.stopPropagation();
			debouncedDragOverEnter(sortableElement, element, e.pageY);
		};
		addEventListener(listItems.concat(sortableElement), 'dragover', onDragOverEnter);
	});
};

sortable();