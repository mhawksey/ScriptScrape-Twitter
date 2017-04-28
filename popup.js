$( document ).ready(function() {
    $("#search_harvest")
		.on("click", function(){
			$("#data-holder")
				.html("Starting...");
			chrome.extension.sendMessage({instruction: "GetURL"},
				function (response) {
				});
		});
		
	$("#stop_button")
		.on("click", function(){
			$("#data-holder")
				.html("Stopping...");
			chrome.extension.sendMessage({instruction: "stop"},
				function (response) {
				});
		});
	
	$("#authenticate_button")
		.on("click", function(){
			console.log("authenticating");
			$(this).prop('disabled',true);
			getAuthTokenInteractive();
		});
	
	$("#send_button")
		.on("click", function(){
			/*$("#data-holder")
				.html("Stopping...");*/
		console.log("send data to TAGS...");
		$(this).prop('disabled',true);
		$('#tags-holder').addClass('loading');
		sendDataToTAGS();
		
		});
	getAuthTokenSilent();
	
});

chrome.extension.onMessage.addListener( 
	function(request,sender,sendResponse){
		switch (request.instruction){
			case "update":
				$("#data-holder")
				.html(request.tweets);
				break;
			case "date":
				var a = new Date(request.date * 1000);
				var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
				var year = a.getFullYear();
				var month = months[a.getMonth()];
				var date = a.getDate();
				var hour = a.getHours();
				var min = a.getMinutes();
				var sec = a.getSeconds();
				var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;

				$("#date-holder")
					.html("Time reached: " + time);
				break;
			case "status":
				$("#status-holder")
					.html("Status: " + request.message);
				break;
			case "complete":
				$("#enable-send-div").css('display','inline');
				break;
		}
	}
);

var SCRIPT_ID = '19Vt41N_8bY0QcW2M7o7bFRTiQh5Gz5j01ZN8M5_9lKKPQh_3xynYyfvu';

/**
 * Get users access_token.
 *
 * @param {object} options
 *   @value {boolean} interactive - If user is not authorized ext, should auth UI be displayed.
 *   @value {function} callback - Async function to receive getAuthToken result.
 */
function getAuthToken(options) {
    chrome.identity.getAuthToken({ 'interactive': options.interactive }, options.callback);
}

/**
 * Get users access_token in background with now UI prompts.
 */
function getAuthTokenSilent() {
    getAuthToken({
        'interactive': false,
        'callback': getAuthTokenSilentCallback,
    });
}

/**
 * Handle response from authorization server.
 *
 * @param {Object} authResult Authorization result.
 */
function getAuthTokenSilentCallback(token) {
    // Catch chrome error if user is not authorized.
	var authorizeDiv = document.getElementById('authorize-div');
	var sendDiv = document.getElementById('send-div');
    if (chrome.runtime.lastError) {
        console.log("no auth"); 
		authorizeDiv.style.display = 'inline';
    } else {
        console.log("auth"); 
		authorizeDiv.style.display = 'none';
		sendDiv.style.display = 'inline';
    }
}

/**
 * Get users access_token or show authorize UI if access has not been granted.
 */
function getAuthTokenInteractive() {
    getAuthToken({
        'interactive': true,
        'callback': getAuthTokenInteractiveCallback,
    });
}

/**
 * User finished authorizing, start getting Gmail count.
 *
 * @param {string} token - Current users access_token.
 */
function getAuthTokenInteractiveCallback(token) {
    // Catch chrome error if user is not authorized.
    if (chrome.runtime.lastError) {
        getAuthTokenInteractive();
    } else {
		getAuthTokenSilentCallback(token);
    }
}

/**
 * Send data to create new TAGS sheet.
 *
 * 
 *
 * @param {string} token - Current users access_token.
 */
function sendDataToTAGSCallback(token) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {command: "getIds"}, function(requestBody) {
            post({
					'url': 'https://script.googleapis.com/v1/scripts/' + SCRIPT_ID + ':run',
					'callback': updateTAGSStatusCallback,
					'token': token,
					'request': {'function': 'setData',
								'parameters': requestBody}
				});
        });
    });
    
}

/**
 * Get users access_token in background with now UI prompts.
 */
function sendDataToTAGS() {
    getAuthToken({
        'interactive': false,
        'callback': sendDataToTAGSCallback,
    });
}

function updateTAGSStatusCallback(resp){
	console.log(resp);
	if (resp.response.result.status == "ok"){
		var info = "Open <a href='"+resp.response.result.doc+"' target='_blank'><strong>this sheet</strong></a> and select <strong>TAGS &gt; Build archive from tweet IDs</strong> from the dropdown menu";
	} else {
		var info = "Something went wrong"
		console.log(resp.response.result.status);
	}
	$('#tags-holder').removeClass('loading').html(info);
}

/**
 * Make an authenticated HTTP POST request.
 *
 * @param {object} options
 *   @value {string} url - URL to make the request to. Must be whitelisted in manifest.json
 *   @value {object} request - Execution API request object
 *   @value {string} token - Google access_token to authenticate request with.
 *   @value {function} callback - Function to receive response.
 */
function post(options) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			// JSON response assumed. Other APIs may have different responses.
			options.callback(JSON.parse(xhr.responseText));
		} else if(xhr.readyState === 4 && xhr.status !== 200) {
			console.log('post', xhr.readyState, xhr.status, xhr.responseText);
			$('#tags-holder').removeClass('loading').html(xhr.responseText);
		}
	};
	xhr.open("POST", options.url, true);
	// Set standard Google APIs authentication header.
	xhr.setRequestHeader('Authorization', 'Bearer ' + options.token);
	xhr.send(JSON.stringify(options.request));
}