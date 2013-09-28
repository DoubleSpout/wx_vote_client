var log4js = require('log4js');
var path = require('path');
var async = require('async');
var widgetSdk = require('wx_widget_sdk');

var _clientId = "5245790aad1f453aae73a2a1"
var _clientKey = "10856caf8733f3466ebc7c9198dead0b"
var _gourpId = "52457954ad1f453aae73a2a3"
var _host = "http://127.0.0.1:8080"


var widgetIns = widgetSdk.create({
			clientId:_clientId,
			clientKey:_clientKey,
			widgetHost:_host
		})

var middle = function(req, res, next){
	if(!req.body.appuserid && !req.query.appuserid) {
			return res.json({err:"appuserid无效",data:null});
	}
	next()
}


var init = function(app){

	app.post('/reg', middle, function(req,res){
		
		if(req.body.mobile && !/^\d{11,11}$/.test(req.body.mobile)){
			return res.json({err:"手机号无效",data:null});
		}
		var uobj = {
				name:req.body.name||'',
				appuserid:req.body.appuserid||req.query.appuserid,
				mobile:req.body.mobile || '',
				regip:req.ip
		}
		widgetIns.registUser(uobj,function(err,body){
			if(err) return res.json({err:"注册失败",data:err});
			res.json(body);
		});
	})

	app.get('/user',middle,function(req,res){
		widgetIns.getUserInfo(req.query.appuserid, function(err,body){
			if(err) return res.json({err:"用户信息获取失败",data:err});
			res.json(body);
		})
	})

	app.get('/getvote',middle,function(req,res){
		widgetIns.getVote(_gourpId, function(err,body){
			if(err) return res.json({err:"获取投票信息失败",data:err});
			res.json(body);
		})
	})

	app.post('/vote',middle,function(req,res){
		if(!/^\w{24,24}$/.test(req.body.voteid)){
			return res.json({err:"投票id无效",data:err});
		}
		widgetIns.createVote(req.body.appuserid||req.query.appuserid, req.body.voteid, req.ip, function(err,body){
			if(err) return res.json({err:"投票失败",data:err});
			res.json(body);
		})
	})

	app.get('/votestatus',middle,function(req,res){
		widgetIns.getUserVoteByGroup(req.query.appuserid, _gourpId, function(err,body){
			if(err) return res.json({err:"获取投票状态失败",data:err});
			res.json(body);
		})
	})

	app.get('/', function(req, res){
		res.redirect('/static/pages/grid.html')
	})

	app.all('*',function(req,res){
		res.statusCode = 404;
		res.sendfile(path.join(__dirname,'..','/static/404.html'));
	})
	return app;
}

module.exports = init;