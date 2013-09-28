var log4js = require('log4js');
var path = require('path');
var async = require('async');
var widgetSdk = require('wx_widget_sdk');
var webot = require('weixin-robot');

var _clientId = "5245790aad1f453aae73a2a1"
var _clientKey = "10856caf8733f3466ebc7c9198dead0b"
var _gourpId = "52457954ad1f453aae73a2a3"



var widgetIns = widgetSdk.create({
			clientId:_clientId,
			clientKey:_clientKey,
			widgetHost:'http://127.0.0.1:8080'
		})

var middle = function(req, res, next){
	if(!req.body.appuserid && !req.query.appuserid) {
			return res.json({err:1,data:"appuserid无效"});
	}
	next()
}


var init = function(app){

	app.post('/reg', middle, function(req,res){
		
		if(req.body.mobile && !/^\d{11,11}$/.test(req.body.mobile)){
			return res.json({err:1,data:"手机号无效"});
		}
		var uobj = {
				name:req.body.name||'',
				appuserid:req.body.appuserid||req.query.appuserid,
				mobile:req.body.mobile || '',
				agent:req.headers["user-agent"],
				regip:req.ip
		}
		widgetIns.registUser(uobj,function(err,body){
			if(err) return res.json({err:1,data:"注册失败"});
			res.json(body);
		});
	})

	app.get('/user',middle,function(req,res){
		widgetIns.getUserInfo(req.query.appuserid, function(err,body){
			if(err) return res.json({err:1,data:"用户信息获取失败"});
			res.json(body);
		})
	})

	app.get('/getvote',middle,function(req,res){
		widgetIns.getVote(_gourpId, function(err,body){
			if(err) return res.json({err:1,data:"获取投票信息失败"});
			res.json(body);
		})
	})

	app.post('/vote',middle,function(req,res){
		if(!/^\w{24,24}$/.test(req.body.voteid)){
			return res.json({err:1,data:"投票id无效"});
		}
		widgetIns.createVote(req.body.appuserid||req.query.appuserid, req.body.voteid, req.ip, function(err,body){
			if(err) return res.json({err:1,data:"投票失败"});
			res.json(body);
		})
	})

	app.get('/votestatus',middle,function(req,res){
		widgetIns.getUserVoteByGroup(req.query.appuserid, _gourpId, function(err,body){
			if(err) return res.json({err:1,data:"获取投票状态失败"});
			res.json(body);
		})
	})

	app.get('/votepage', function(req, res){
		res.sendfile(path.join(__dirname,'..','/static/pages/grid.html'))
	})



	webot.set('hi', '你好');

	webot.set('投票', {
	  pattern: function(info) {
	  	console.log(info.text)
	    return info.text == "投票";
	  },
	  handler: function(info,next) {
		var req = info.req;

	  	widgetIns.getUserInfo(info.sp, function(err,body){

			if(err) return next(null, '投票页面加载失败');
			if(body.err){//如果没找到用户
				var uobj = {
					name:'weixin',
					appuserid:info.sp,
					agent:req.headers["user-agent"],
					regip:req.ip
				}
				widgetIns.registUser(uobj,function(err,body){

					if(err || body.err) return next(null, '投票页面加载失败!');
					next(null, 'http://127.0.0.1:8080/votepage?appuserid='+info.sp)
				});
				return;
			}
			next(null, 'http://127.0.0.1:8080/votepage?appuserid='+info.sp)
		})
	  }
	});

	webot.watch(app, { token: 'abc123', path: '/wechat' });

	var webot2 = new webot.Webot();
		webot2.set({
		  '/hi/i': 'Hello',
		  '/who (are|r) (you|u)/i': 'I\'m a robot.'
		});
		webot2.watch(app, {
		  token: 'token2',
		  path: '/wechat_en', // 这个path不能为之前已经监听过的path的子目录
		});


// 接管消息请求
/*
	app.all('*',function(req,res){
		res.statusCode = 404;
		res.sendfile(path.join(__dirname,'..','/static/404.html'));
	})
*/
	return app;
}

module.exports = init;