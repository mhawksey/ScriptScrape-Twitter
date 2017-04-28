chrome.extension.onMessage.addListener( 
	function(request,sender,sendResponse){
		console.log(request.instruction);
		switch (request.instruction){
			case "GetURL":
				chrome.tabs.getSelected(null, function(tab) {
					chrome.tabs.sendMessage(tab.id, {command: "parse", tab: tab.id}, function(response) {
						chrome.extension.sendMessage({command: response},
							function (response) {

							}); 
					});
				});
				break;
			case "stop":
				chrome.tabs.getSelected(null, function(tab) {
					chrome.tabs.sendMessage(tab.id, {command: "stop", tab: tab.id}, function(response) {
						chrome.extension.sendMessage({command: response},
							function (response) {

							}); 
					});
				});
				break;
			case "authenticate":
				chrome.tabs.getSelected(null, function(tab) {
					chrome.tabs.sendMessage(tab.id, {command: "authenticate", tab: tab.id}, function(response) {
						chrome.extension.sendMessage({command: response},
							function (response) {

							}); 
					});
				});
				break;
		}
	}
);   

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	  switch(request.instruction){
		  case "refresh":
			chrome.tabs.getSelected(null, function(tab) {
				chrome.tabs.sendMessage(tab.id, {command: "update", updateText: request.tweets}, function(response) {
					chrome.extension.sendMessage({command: response},
						function (response) {
					
						}); 
				});
			});
			break;
		  case "date":
			chrome.tabs.getSelected(null, function(tab) {
				chrome.tabs.sendMessage(tab.id, {command: "date", date: request.date}, function(response) {
					chrome.extension.sendMessage({command: response},
						function (response) {
							
						}); 
				});	
			});
			break;
		  case "status":
			chrome.tabs.getSelected(null, function(tab) {
				chrome.tabs.sendMessage(tab.id, {command: "status", message: request.message}, function(response) {
					chrome.extension.sendMessage({command: response},
						function (response) {
							
						}); 

				});
			});
			break;
	  }  
  }); 