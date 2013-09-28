$(function(){
	var TEMPLATE = '<li id="{voteid}"><a href="{$voteimg}" rel="lightbox"><img src="{voteimg}" width="80" height="100"></a>'+
                   '<p><span>{votetitle}</span></br><span name="votenum"><b name="num">{votenum}</b>票</span>'+
            	   '<i name="vote" class="icon-thumbs-up icon-3x pull-right" data-toggle="modal" data="{voteid}" href="#myModal"></i>'+
          		   '</p></li>'
	
	var appuserid = '123456';
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
	
	var get_vote_status = function(cb){
		$.get(genUrl('/votestatus'),{r:Math.random()}, function(d){
			if(d.err) return alert(d.err)
			var array = d.data;
			for(var i=0; i<array.length;i++){
				$('#'+array[i]["voteId"]).find('.icon-thumbs-up').addClass('sel');	
			}
			cb && cb()	
		},'json')	
	}
	
	
	var voteid;
	$('#tiles').delegate('i[name="vote"]', 'click', function(){
		voteid = $(this).attr('data');
	})

	var hasvote = false;
	$('#submit_vote').click(function(){
		if(hasvote) return false;
		hasvote = true;
		$.post(genUrl('/vote'), {"voteid":voteid}, function(d){
			if(d.err){
				hasvote = false;
				return alert('投票失败')
			}
				var $b = $('#'+voteid).find('b[name="num"]')
				var n = ~~($b.text());
				$b.html(n+1)
				$('#submit_close').trigger('click');
				hasvote = false;

			
		}, 'json')	
		return false;
	})
	
	init(get_vote_status);
})