chrome.runtime.onMessage.addListener(
	 
	function(request, sender, sendResponse) {	
		switch(request.command) {
			case "parse":
				tab = request.tab;
				scroll_document();
				break;
			case "stop":
				console.log("stopping");
				stop = true;
				break;
			case "getIds":
				console.log("sending Ids")
				sendResponse({'data': output_tags,'searchTerm': search_string});
				break;
			case "authenticate":
				break;
			
		}
		
	}   
		
);

var stop = false;
var stream_length = 0;
var counter = 0;
var tweets = 0;
var last_parse = false;
var tab = 0;
var scroll_try = 0;
var output_tags = [];
var search_string = "";

function scroll_document(){

	if(!stop){

		console.log("document " + $(document).height());

	if($(".back-to-top:visible").length!=1){
		$("html, body").animate({ scrollTop: 0 }, 1);
		$("html, body").animate({ scrollTop: $(document).height() }, 1);
		if($(".stream-items").children().length>100){
			scroll_try = 0;

			parse_document();						
		}else{
			console.log("scroll try");
			scroll_try++;
			chrome.runtime.sendMessage({instruction: "status", message: "Scrolling... " + $(".stream-items").children().length + " tweets available. " + 100 + " needed to process. Scrollling attempt : " + scroll_try}, function(response) {
				});
			setTimeout(scroll_document,1000);	
		}
			
		}else{
			
			if($(".stream-items").children().length<100){
				
				$("html, body").animate({ scrollTop: 0 }, 1);
				$("html, body").animate({ scrollTop: $(document).height() }, 1);
				scroll_try++;
			
				chrome.runtime.sendMessage({instruction: "status", message: "Scrolling... " + $(".stream-items").children().length + " tweets available. " + 100 + " needed to process. Scrollling attempt : " + scroll_try}, function(response) {
					});
				setTimeout(scroll_document,1000);
			
	}else{
		
				if(scroll_try>20){
			
		chrome.runtime.sendMessage({instruction: "status", message: "Out of tweets..."}, function(response) {
				});
		stop = true;

		parse_document();
		
				}else{
				
					$("html, body").animate({ scrollTop: 0 }, 1);
					$("html, body").animate({ scrollTop: $(document).height() }, 1);
					
					scroll_try++;
					chrome.runtime.sendMessage({instruction: "status", message: "Scrolling... " + $(".stream-items").children().length + " tweets available. " + 100 + " needed to process. Scrollling attempt : " + scroll_try}, function(response) {
					});
					setTimeout(scroll_document,1000);
				
				}
				
			}
			
		}
		
	}else{
	
		chrome.runtime.sendMessage({instruction: "status", message: "Stopped"}, function(response) {
					});
		
	}
	
}

function GetURLParameter(sParam){

    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');

    for (var i = 0; i < sURLVariables.length; i++){

		var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam){
            return sParameterName[1];
        }

    }

}

function parse_document(){	
		

	setTimeout(get_data,2000);
		
}
		
function get_data(){

	console.log("getting data");

	chrome.runtime.sendMessage({instruction: "status", message: "Processing data..."}, function(response) {
		});

	output = "name,handle,conversation,time,content,replies,retweets,favourites\n";	
	output_tags.push(["id_str"]);
	search_string = $('#search-query').val();
	
	$("li.js-stream-item.stream-item.stream-item")
		.each(function(index,value){
			id = $(value).attr("data-item-id");
			output_tags.push([id]);
	});

	$(".stream-items .original-tweet .content")
		.each(
		
			function(index,value){
			
				name = $(value)
					.children()
					.first()
					.children()
					.first()
					.children()
					.first()
					.next()
					.text();
					
				handle = $(value)
					.children()
					.first()
					.children()
					.first()
					.attr("href").substring(1);

				image = $(value)
					.children()
					.first()
					.children()
					.first()
					.children()

					.first()
					.attr("src");
					
				conversation = $(value)
					.children()
					.first()
					.children()
					.first()
					.next()
					.children()
					.first()
					.attr("data-conversation-id");	
			
				url = "twitter.com" + $(value)
					.children()
					.first()
					.children()
					.first()
					.next()
					.children()
					.first()
					.attr("href");
					
				unix = $(value)
					.children()
					.first()
					.children()
					.first()
					.next()
					.children()
					.first()
					.children()
					.first()
					.attr("data-time");	
	
				content = $(value)
					.children()
					.first()
					.next()
					.text();
					
				if($(value).children().first().next().hasClass("u-hiddenVisually")){

					content = $(value).children().first().next().next().text();
					content = content + " QUOTE TWEET " +  $(value).children().last().prev().children().last().children().last().children().first().children().first().text();

				}	

				replies = $(value)
					.children()
					.last()
					.children()
					.last()
					.children()
					.first()
					.children()
					.last()
					.children()
					.last()
					.children()
					.first()
					.children()
					.first()
					.text();
					
				if(replies==""){
					replies = 0;
				}	
					
				retweets = $(value)
					.children()
					.last()
					.children()
					.last()
					.children()
					.first()
					.next()
					.children()
					.last()
					.children()
					.last()
					.children()
					.first()
					.children()
					.first()
					.text();	
					
				if(retweets==""){
					retweets = 0;
				}			

				favourites = $(value)
					.children()
					.last()
					.children()
					.last()
					.children()
					.first()
					.next()
					.next()
					.children()
					.last()
					.children()
					.last()
					.children()
					.first()
					.children()
					.first()
					.text();	
					
				if(favourites==""){
					favourites = 0;
				}	
				
				retweeters = "";

				/*
				$(value)
					.children()
					.first()
					.next()
					.next()
					.children()
					.first()
					.children()
					.first()
					.next()
					.next()
					.children()
					.first()
					.children()
					.last()
					.children()
					.each(
						function(index,value){
							retweeters += $(value).attr("href").substring(1) + " (" + $(value).attr("original-title") + ") ";
						}
					);
				*/
				
				tweets++;
	
				output = output + url + "," + name + "," + handle + "," + conversation + "," + unix + "," + content.split('"').join('""').split("\t").join(" ").split("\n").join(" ").split("\r").join(" ") + "," + replies + "," + retweets + "," + favourites + "\n";
				
			}						
	
		);
		
		chrome.runtime.sendMessage({instruction: "date", date: unix}, function(response) {
		});
		
		chrome.runtime.sendMessage({instruction: "update", tweets: tweets + " tweets processed"}, function(response) {
		});		
	
	hashtag = GetURLParameter("q");	
	
	if(counter!=0){
		list = output.split("\n");
		list.pop();
		output = list.join("\n");
	}
		
	var blob = new Blob([output], {type: "text/plain;charset=utf-8"});	
	saveAs(blob, hashtag + "-" + counter++ + "-download.csv");
	console.log(output_tags);
	
	$(".stream-items li:not(:last-child)")
		.remove();
		
	$("html, body").animate({ scrollTop: 0 }, 1);	
	
	if(stop){
		console.log("stopping");
		chrome.runtime.sendMessage({instruction: "update", tweets: "Harvest stopped"}, function(response) {
		});		
		chrome.runtime.sendMessage({instruction: "status", message: "Completed"}, function(response) {
		});	
		chrome.runtime.sendMessage({instruction: "complete"}, function(response) {
		});
	}else{
	
		setTimeout(scroll_document,1000);
		
	}
	
}
