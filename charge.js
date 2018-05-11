const vox = require('steem')
vox.api.setOptions({ url: 'https://vox.community:9000' });
vox.config.set('chain_id','6d7a99c29fa3b33c4aec02f6f84917eff284b6e7712c607e2ee98b87296ce57a');
//---
var account='investigator';//аккаунт на котором смотрим Voting Power
	
vox.api.getAccounts([account], function(err, result){
	var power = result[0].voting_power;//Voting Power последнего апа
	var votetime = Date.parse(result[0].last_vote_time);//время последнего апа

  vox.api.getDynamicGlobalProperties(function(err, result) {  
	var curtime = Date.parse(result.time);//время последнего известного блока чейна
	var volume =(power+((curtime-votetime)/1000)*0.11574);//расчет текущей Voting Power
	var charge;	//перемнная для приёма volume и вывода в консоль
	if(volume>=10000)charge=100.00;
	else charge=+(volume/100).toFixed(2); //округление значения volume до второго знака
	var estimate = (10000-volume)/0.11574;//время в секундах до полной регенерации Voting Power
  
var timeFormat = (function (){//функция конвертация времени в формат ЧЧ:ММ:СС
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

var time = timeFormat(estimate*1000)//переменная времени в формате ЧЧ:ММ:СС
var full;//перемнная для приёма time и вывода в консоль
if (estimate<86400 && estimate>2 )full = time;
else if (estimate>=86400)full = "сутки";
else if (estimate<3)full = "00:00:00";

console.log('Текущая VotePower: '+charge+'%','\nПолная регенерация через '+full);//выводим в консоль Voting Power и период восстановления
	});
	
});

//---