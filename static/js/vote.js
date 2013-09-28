var Get_QueryString_Plus = function(url){
   var no_q = 1,
      now_url = url && (url.split('?')[1] || no_q) || document.location.search.slice(1) || no_q;
  if(now_url === no_q) return false;
        var q_array = now_url.split('&'),
       q_o = {},
       v_array; 
        for(var i=0;i<q_array.length;i++){
              v_array = q_array[i].split('=');
       q_o[v_array[0]] = v_array[1];
        };
        return q_o;
    }

$(function(){
	var TEMPLATE = '<li id="{voteid}"><a href="{voteimg}" rel="lightbox"><img src="{voteimg}" width="80" height="100"></a>'+
                   '<p><span>{votetitle}</span></br><span name="votenum"><b name="num">{votenum}</b>票</span>'+
            	   '<i name="vote" class="icon-thumbs-up icon-3x pull-right" data-toggle="modal" data="{voteid}" href="#myModal"></i>'+
          		   '</p></li>'
	
	var appuserid = Get_QueryString_Plus().appuserid || '123456';
	var genUrl = function(url){
		return url+'?appuserid='+appuserid
	}
	var init = function(cb){
		$.get(genUrl('/getvote'),{r:Math.random()}, function(d){
			if(d.err) return alert(d.err)
			var array = d.data.data;
			var str = '';
			for(var i=0; i<array.length; i++){
				str += TEMPLATE.replace(/{voteid}/g, array[i]["_id"])
							   .replace(/{voteimg}/g, array[i]["imgUrl"])
							   .replace(/{votetitle}/g, array[i]["title"])
							   .replace(/{votenum}/g, array[i]["count"])
			}
			$('#tiles').html(str)				
			cb && cb()
		},'json')	
	}
	
	var isVoted = false;
	var get_vote_status = function(cb){
		$.get(genUrl('/votestatus'),{r:Math.random()}, function(d){
			if(d.err) return alert(d.data)
			var array = d.data;
			for(var i=0; i<array.length;i++){
				$('#'+array[i]["voteId"]).find('.icon-thumbs-up').addClass('sel');	
				isVoted = true;
			}
			cb && cb()	
		},'json')	
	}
	
	
	var voteid;
	$('#tiles').delegate('i[name="vote"]', 'click', function(){
		if(isVoted) return false
		voteid = $(this).attr('data');
	})

	var hasvote = false;
	$('#submit_vote').click(function(){
		if(hasvote) return false;
		hasvote = true;
		$.post(genUrl('/vote'), {"voteid":voteid}, function(d){
			if(d.err){
				hasvote = false;
				$('#submit_close').trigger('click');
				return alert(d.data)
			}
				var $b = $('#'+voteid).find('b[name="num"]')
				var n = ~~($b.text());
				$b.html(n+1)
				$('#submit_close').trigger('click');
				hasvote = false;

			
		}, 'json')	
		return false;
	})
	
	var binding = function(){
		$('#tiles').imagesLoaded(function() {
	        // Prepare layout options.
	        var options = {
	          autoResize: true, // This will auto-update the layout when the browser window is resized.
	          container: $('#main'), // Optional, used for some extra CSS styling
	          offset: 15, // Optional, the distance between grid items
	          outerOffset: 10, // Optional, the distance to the containers border
	          itemWidth: 90 // Optional, the width of a grid item
	        };

	        // Get a reference to your grid items.
	        var handler = $('#tiles li');

	        // Call the layout function.
	        handler.wookmark(options);

	        // Init lightbox
	        $('a', handler).colorbox({
	          rel: 'lightbox'
	        });
    	})
	}

	init(function(){
		get_vote_status(binding)
	});
})