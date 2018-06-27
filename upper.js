var steem = require('steem');
steem.api.setOptions({ url: 'https://vox.community/ws' });
steem.config.set('chain_id','88a13f63de69c3a927594e07d991691c20e4cf1f34f83ae9bd26441db42a8acd');

var account='ваш аккаунт без @';
var wif = 'ваш приватный постинг ключ';
var link='https://vox.community/ru--voks/@investigator/bot-v-pomosh';//ссылка на пост под которым робот разместит комментарии. Меняйие на свою
var interlived='1';//интервал запроса в блокчейн в минутах
var timerId = setInterval(function() {
steem.api.getAccounts([account], function(err, result){
	var power = result[0].voting_power;
	var votetime = Date.parse(result[0].last_vote_time);

  steem.api.getDynamicGlobalProperties(function(err, result) {  
	var curtime = Date.parse(result.time);
	var volume =(power+((curtime-votetime)/1000)*0.11574);
	var charge;
	if(volume>=10000){
	charge=100.00;
	posting();
	}
	else charge=+(volume/100).toFixed(2);
	var estimate = (10000-volume)/0.11574;
  
var timeFormat = (function (){
    function num(val){
        val = Math.floor(val);
        return val<10?'0'+val:val;
    }
    return function (ms){
        var sec = ms/1000;
        var hours = sec/3600%24;
        var minutes = sec/60%60;
        var seconds = sec%60;
        return num(hours)+":"+num(minutes)+":"+num(seconds);
    };
})();

var time = timeFormat(estimate*1000)
var full;
if (estimate<86400 && estimate>2 )full = time;
else if (estimate>=86400)full = "сутки";
else if (estimate<3)full = "00:00:00";

console.log('Уровень заряда VP: '+charge+'% | 100% по истечении: '+full);
	});	
});

}, +interlived*60000);

function posting(){
var dt_now = Math.round(Date.now()/1000);
var parent_author=link.split('@')[1].split('/')[0]; 
var parent_permlink=link.split('@')[1].split('/')[1];
var author=account; 
var permlink='re-'+parent_author+'-'+parent_permlink+dt_now;
var post_body='test';//текст комментария или пробел
var title ='';
var jsonMetadata = {};
var percent=10000;	
steem.broadcast.comment(wif,parent_author,parent_permlink,author,permlink,title,post_body,jsonMetadata,function(err, result) {
if(err){console.log(err); } else {
console.log('Последний комментарий опубликован: '+new Date());
}
});
steem.broadcast.vote(wif, account, author, permlink, percent, function(err, result) {
if(err){console.log(err); }  else {
  console.log('Апвоут поставлен: '+new Date());
  }
});
};