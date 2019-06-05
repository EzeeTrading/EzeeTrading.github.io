( function (w) {
	var UpstoxButton = {};
	// var upstoxTradesConfig = {};
	var childWindow = {};
	var currentOrderList = "";
	var user = {};
	var popoutUrl = 'https://pro.upstox.com/trade/';

	var TradeButton = function (buttonName) {
		this.addOrder = function (order) {
			UpstoxButton.addOrderToButton(buttonName, order);
		}.bind(this);

		this.removeOrder = function (order) {
			UpstoxButton.removeFromButton(buttonName, order);
		}.bind(this);
	}




	// On document ready, add click listeners for the static buttons
	document.addEventListener('DOMContentLoaded', onStartUp, false);

	function onStartUp () {
		addTradebuttonListeners();
	}

	function addTradebuttonListeners () {
		var _btns = document.querySelectorAll("upstox-tradebutton, [upstox-tradebutton]");
		for (var i = 0; i < _btns.length; i++) {
			addClick(_btns[i])
		}
	}

	function addClick (element) {
		element.addEventListener("click", function (evt) {
			evt.preventDefault();

			// Fetching trades for the clicked button using the button-name attribute
			var _currentBtn = this.attributes['button-name'].value;
			currentOrderList = upstoxTradesConfig['button-name'][_currentBtn];

			// Close the previous window if it is open
			if (childWindow && childWindow.closed === false)
				childWindow.close();

			// Open the publisher page
			var _randPopoutUrl = popoutUrl + '?s=' + (Math.random().toString()).slice(2);
			childWindow = window.open(_randPopoutUrl, '_blank', 'width=850,height=560,left=200,top=100');
			
			console.log(this)
		});
	}


	// Adding window event listener for communicating with child window
	// The child sends a message 'getOrderList' once it is loaded and ready to receive
	// currentOrderList is send to the child upon receiving of this message
	window.addEventListener('message', function(e) {
		ProcessChildMessage(e.data); // e.data holds the message
	} , false);

	function ProcessChildMessage(message) {
		var _msg = {};
		switch (message) {
			case 'getOrderList':
				_msg = {
					type: 'getOrderList',
					data: currentOrderList
				}
				childWindow.postMessage(JSON.stringify(_msg), "*");
				break;
			case 'getApiKey':
				_msg = {
					type: 'getApiKey',
					data: upstoxTradesConfig.apiKey
				}
				childWindow.postMessage(JSON.stringify(_msg), "*");
				break;
			case 'getLoginKey':
				_msg = {
					type: 'getLoginKey',
					lka: false
				}

				if (user) {
					_msg.data = user;
					_msg.lka = true;
				} 

				childWindow.postMessage(JSON.stringify(_msg), "*");
				break;
		}
	}




	function buttonExists (buttonName) {
		return Object.keys(upstoxTradesConfig['button-name']).indexOf(buttonName) > -1
	}

	function orderExists (buttonName, order) {
		//TODO
		return false;
	}




	UpstoxButton.createButton = function (buttonName, type) {
		if (!type) {
			type = "tradebutton";
		}

		if (!buttonExists(buttonName)) {
			upstoxTradesConfig['button-name'][buttonName] = [];
			var _btnHandle;
			if (type == "tradebutton")
				_btnHandle = "upstox-tradebutton[button-name="+buttonName+"]";
			else 
				_btnHandle = "[upstox-tradebutton][button-name="+buttonName+"]";

			addClick( document.querySelector(_btnHandle) )

			return new TradeButton(buttonName);
		} else {
			return false;
		}
	}

	UpstoxButton.buttonExists = buttonExists; 

	UpstoxButton.addOrderToButton = function (buttonName, order) {
		var _returnStatus = false;
		if (buttonExists(buttonName)) {
			if (!orderExists(buttonName, order)) {
				//TODO: order format check
				upstoxTradesConfig['button-name'][buttonName].push(order);
				_returnStatus = true;
			}
		} else {
			//TODO: Handle button does not exist
		}

		return _returnStatus;
	}

	UpstoxButton.removeAllOrdersFromButton = function (buttonName) {
		var _returnStatus = false;
		if (buttonExists(buttonName)) {
			upstoxTradesConfig['button-name'][buttonName] = [];
			_returnStatus = true;
		}
		return _returnStatus;
	}

	UpstoxButton.getAllActiveButtons = function () {
		//TODO
		return true;
	}

	UpstoxButton.setUserDetails = function (uid, lk) {
		user.uid = uid;
		user.lk = lk;
	}

	UpstoxButton.removeUserDetails = function () {
		user = {};
	}

	UpstoxButton.getButtonAsURL = function (buttonName) {
		var _orderSubURL, _url, _orders;
		var orderParams = [ 
			"exchange", "series", "token", "symbol", "quantity", "price",
			"side", "complexity", "position", "tif", "orderType", "triggerPrice",
			"stoploss", "target", "trailingTicks", "discQuantity", "amo"
		];

		if (buttonExists(buttonName)) {
			_orders = upstoxTradesConfig["button-name"][buttonName].slice();

			if (_orders.length == 1) {
				_orderSubURL = "place";
				orderParams.forEach ( function (param) {
					if (_orders[0][param])
						_orderSubURL += '&' + param + '=' + _orders[0][param];
				})
			} else if (_orders.length > 1) {
				_orderSubURL = "orders=" + _orders.map( function (order) {
					return orderParams.map( function (param) {
						return order[param] || '-';
					}).join("|")
				}).join("||");
			}

			_url = popoutUrl + "?" + _orderSubURL;
			return _url;
		} else {
			return false;
		}
	}


	;( function tradeButtonStyleLoader() {
		//Precaching images by downloading them right away
		var _preloadImg1 = new Image();
		_preloadImg1.src = "https://s3.ap-south-1.amazonaws.com/tradebutton/buy.png";
		var _preloadImg2 = new Image(); 
		_preloadImg2.src = "https://s3.ap-south-1.amazonaws.com/tradebutton/sell.png";
		var _preloadImg3 = new Image(); 
		_preloadImg3.src = "https://s3.ap-south-1.amazonaws.com/tradebutton/trade.png";

		var _css = 
			'upstox-tradebutton {' +
				'display: block;' +
				'width: 150px;' +
				'height: 40px;' +
				'margin: 5px;' +
				'cursor:pointer;' +
			'} upstox-tradebutton:hover {' +
				'opacity: 0.9' +
			'} upstox-tradebutton[buy] {' +
				'background-image: url("https://s3.ap-south-1.amazonaws.com/tradebutton/buy.png");' +
			'} upstox-tradebutton[sell] {' +
				'background-image: url("https://s3.ap-south-1.amazonaws.com/tradebutton/sell.png");' +
			'} upstox-tradebutton[trade] {' +
				'background-image: url("https://s3.ap-south-1.amazonaws.com/tradebutton/trade.png");' +
			'};'
		var _head = document.head || document.getElementsByTagName('head')[0];
		var _style = document.createElement('style');

		_style.type = 'text/css';
		if (_style.styleSheet) {
			_style.styleSheet.cssText = _css;
		} else {
			_style.appendChild(document.createTextNode(_css));
		}

		_head.appendChild(_style);
	})();



	w.UpstoxButton = UpstoxButton;

})(window);
