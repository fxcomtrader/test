const Promise = require("bluebird")
const _ = require('lodash')
const golos = require('steem')

golos.config.set('websocket','wss://ws.golos.io');
golos.config.set('address_prefix','GLS');
golos.config.set('chain_id','782a3039b478c839e4cb0c941ff4eaeb7df40bdd68bd441afd444b9da763de12');

//----------------Данные робота (обязательно)--------------------
var account='XXXXXX'; //<< сюда (вместо X) вписываем аккаунт робота который будет апвоутить посты по вызову пользователя
var k='XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'; //<< сюда (вместо X) вписываем приватный постинг ключ аккаунта робота
var percent=10000; //<< процент силы голосования (10000 = 100% | 100 = 1%)
//-------------------------------------------------

// фикс обработки несуществующих блоков
let trig = {
    existBlock:true
}

// получение глобальных динамических данных
const dynamicSnap = new Promise((resolve, reject) => {
    golos.api.getDynamicGlobalProperties((err, res) => {
        if (err) {
        console.log(err)
        }
        else {
            resolve(res)
        }
    })
})

// получение номера последнего блока
const FIRSTBLOCK = n => n.head_block_number

// достаем операции из транзакций
const OPS = (ops) => {
    return _.flatten(ops.transactions.map(tx => tx.operations))
}
// фильтруем операции
const OPSFILTER = (operation) => {
const [type, data] = operation

// если размещён комментарий, то идём дальше
    if (type === 'comment' && data.title==='') {

//----------------- Назначаем пользователя для отклика робота--------		
		if(data.author=='XXXXXXXXXX'){ //<< Сюда (вместо X) вписываем свой аккаунт на ГОЛОСе. Робот будет реагировать только на вызов этого пользователя
//--------------------------------------------------------------------

// если в комментарии прозвучала ключевая фраза (с начала комментария, индекса 0 до 8) идём дальше
			if (data.body.substring(0,8)==='curator!') { //<< фраза на которую будет реагировать робот
				$author=data.author; //определяем автора комментария
				$permlink=data.permlink; //определяем пермлинк комментария       
				parentAuthorAns=data.parent_author; //определяем автора родительского комментария (или поста)
				parentPermlinkAns=data.parent_permlink;//определяем пермлинк родительского комментария (или поста)
				authorprmlnk=point($author);//убираем точку из аккаунта
				permlinkcomm='re-'+authorprmlnk+'-'+$permlink;//формируем пермлинк ответного комментария робота
				t=""; //формируем титры (название) ответного комментария робота (пустое значение для комментариев)
				jsonMetadata=data.json_metadata;//дублируем метадату json для ответного комментария робота
				
function point($author){
	let str = '';//присваиваем пустое начальное значение возвращаемой переменной
if($author.indexOf(".")!=-1) {
	  ip = $author.indexOf(".");
	  iend = $author.length;
	  str = $author.substring(0,ip)+$author.substring(ip+1,iend);	  
} else if($author.indexOf(".")==-1) str=$author;
	 return str;//возвращаем значение функции
}
				
//запрашиваем данные по контенту к которому оставлен комментарий    
				golos.api.getContent(parentAuthorAns,parentPermlinkAns, function(err, result){
					tlt=result.title; //определяем титры (назвние) контента
					ath=result.author; //определяем автора контента
					path=result.parent_author; //определяем автора родителя контента
					avotes=result.active_votes;//определяем пользователей проголосовавших за контент
					onvot = vt (); //определяем голос робота (голосовал или нет)

// функция поиска голоса робота за контент
function vt (){
		let str =''; //присваиваем пустое начальное значение возвращаемой переменной
		for(let i = 0; i < avotes.length; i++) { //запускаем цикл поиска в массиве пользователей проголосовавших за контент
			if( avotes[i].voter == account){ // если находим робота
				str='1'; //возвращаемой переменной присваиваем значение '1'
				break; //останавливаем цикл
			} else str='0';//если робота среди проголосовавших нет, то присваиваем перменной значение '0'
		}
	return str; //возвращаем значение функции
};
  
//----------------Апвотинг и сообшения робота--------------------
//если титры(название) контента не пустое значение (это пост)
//и автор родительского комментария(поста) является автором контента
//и автор родитель контента пуст
//и нет робота среди проголосовавших за контент

if(tlt!="" && parentAuthorAns==ath && path=="" && onvot=='0'){
	golos.broadcast.vote(k, account, parentAuthorAns, parentPermlinkAns, percent, function(err, result) {console.log(err, result); });  //голосуем за пост
	post_body="<html><p>Ок, @"+$author+'!</p><p> Я проголосовал за пост: <a href="https://golos.io/@'+ath+"/"+parentPermlinkAns+'">'+tlt+'</a></p></html>'; //формируем тело ответного комментария
	setTimeout(function() { golos.broadcast.comment(k,$author,$permlink,account,permlinkcomm,t,post_body,jsonMetadata,function(err, result) {console.log(err, result); });}, 22000);
	}
//или если робот голосовал за контент ранее
else if(tlt!="" && parentAuthorAns==ath && path=="" && onvot=='1'){
	post_body="<html><p>@"+$author+', я уже голосовал за этот пост.</p></html>'; //формируем тело комментария
	setTimeout(function() { golos.broadcast.comment(k,$author,$permlink,account,permlinkcomm,t,post_body,jsonMetadata,function(err, result) {console.log(err, result); });}, 22000);
	}
//---------------------------------------------------------------
				});
			}               
		}
	}
}

// получение данных каждого блока
const SENDBLOCK = currentblock => {
    golos.api.getBlock(currentblock, (err, result) => {
        if (err) {
            console.log(err)
        } 
        else if (result === null){
            // или если блок не существует активируем триггер 
                    trig.existBlock = false
                }
        else {
            // или блок существует и не было ошибки - отправляем блок в функцию фильтра операций
            OPS(result)
            .forEach(OPSFILTER)
            trig.existBlock = true
        }
    })
}
// определяем стартовый блок на начало работы скрипта
// каждые 3 секунды увеличивае номер блока на 1
const NEXTBLOCKS = firstblock => {
    let currentblock = firstblock
    setInterval(() => {
        // Увеличиваем только если предыдущий блок был корректно обработан
        if(trig.existBlock){
                    currentblock++
                }
        SENDBLOCK(currentblock)
    }, 3000)
}
// запускаем основные функции через обещания (promises)
dynamicSnap
    .then(FIRSTBLOCK)
    .then(NEXTBLOCKS)
    .catch(e => console.log(e));
