var express = require('express');
const phantom = require('phantom');
var http  = require('http');
var bodyParser = require('body-parser');
const request = require('sync-request');
const https = require('https');
const req = require('request');
var app = express();

//코요에서 사용되는 URL 목록
var shorts = "https://api.bitfinex.com/v2/stats1/pos.size:1m:tBTCUSD:short/last";
var longs = "https://api.bitfinex.com/v2/stats1/pos.size:1m:tBTCUSD:long/last";
var coinpan = "https://coinpan.com/files/currency/update.json";
var marketcap = "https://api.coinmarketcap.com/v1/ticker/?convert=KRW&limit=2000";
var domin = "https://api.coinmarketcap.com/v1/global/";
var bitcoin = "https://api.coinmarketcap.com/v1/ticker/bitcoin/";
var exchange = "https://www.coinhills.com/ko/market/exchange/";
var roiInfo = "https://tokenstats.io/api/v1/tokens/"; // + 코인이름
var ethketcap = "https://api.coinmarketcap.com/v1/ticker/?convert=ETH&limit=2000";



app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.get('/keyboard', function(req,res) {
    var data ={
    'type': 'text'
    };
    res.json(data);
    });
    
app.post('/message', function(req,res){

    var msg = req.body.content;
    console.log('전달받은 메세지 : '+msg);
    var send = {}; //전달할 데이터

    try{
    if(msg == '마진' || msg =='ㅁㅈ'){
        var longD = request('GET', longs);
        var shortD = request('GET', shorts);
        var longBody = JSON.parse(longD.getBody());
        var shortBody = JSON.parse(shortD.getBody());
        var longData = pointCut(longBody.toString().replace(']','').split(',')[1]);
        var shortData = pointCut(shortBody.toString().replace(']','').split(',')[1]);

        var all = parseFloat(parseFloat(shortData) + parseFloat(longData));
        var longP = pointCut(parseFloat((longData/all)*100));
        var shortP = pointCut(parseFloat((shortData/all)*100));

        send = {
            'message' : {
                'text' : "BTC(Bitfinex) 마진\n롱 : "+thousandComma(longData)+"("+longP+"%)\n숏 : "+thousandComma(shortData)+"("+shortP+"%)"
            }
        }
    }else if(msg.startsWith('김프') || msg.startsWith('ㄱㅍ')){
        var coinName = "BTC";
        if(msg=="김프"||msg=="ㄱㅍ"){ 
        }else{
          coinName = msg.replace("ㄱㅍ ","").replace("김프 ","").toUpperCase();  
        }

        var coinpanD = request('GET', coinpan);
        var coinData = JSON.parse(coinpanD.getBody());
    
            var getDataName = coinData.prices.upbit[coinName];
			var getBittrex = coinData.prices.bittrex[coinName];
            var upbit = thousandComma(pointCut(getDataName.now_price));
            var upbitUsd = thousandComma(pointCut(getDataName.now_price_usd));
			var bittrexUsd = '';
				try{
					bittrexUsd = thousandComma(pointCut(getBittrex.now_price_usd));
				}catch(e){}
            var upkimchi = thousandComma(pointCut(getDataName.korea_premium));
            var uppercent = pointCut(getDataName.korea_premium_percent);
	
			if(bittrexUsd != ''){
                send = {
                    'message' : {
                        'text' : coinName+"\nBittrex : $"+bittrexUsd+"\nUpbit : ₩"+upbit+"($"+upbitUsd+")\n김프 : " +uppercent+"%"
                    }
                }
			}else{
                send = {
                    'message' : {
                        'text' : coinName+"\nUpbit : ₩"+upbit+"($"+upbitUsd+")\n김프 : " +uppercent+"%"
                    }
                }

			}
    }else if(msg == '비트' || msg == 'ㅂㅌ'){
        var coinName = "BTC";
        var coinpanD = request('GET', coinpan);
        var coinData = JSON.parse(coinpanD.getBody());

			var getUpbit = thousandComma(pointCut(coinData.prices.upbit.BTC.now_price));
			var getBifinex = thousandComma(pointCut(coinData.prices.bitfinex.BTC.now_price_usd));
			var getBithumb = thousandComma(pointCut(coinData.prices.bithumb.BTC.now_price));
			var getBinance = thousandComma(pointCut(coinData.prices.binance.BTC.now_price_usd));
			var getBitflyer = thousandComma(pointCut(coinData.prices.bitflyer.BTC.now_price_usd));
			
            var uppercent = pointCut(coinData.prices.upbit.BTC.korea_premium_percent);
            var bithumbpercent = pointCut(coinData.prices.bithumb.BTC.korea_premium_percent);
    
            send = {
                'message' : {
                    'text' : "Bitcoin(BTC) 실시간 가격\n빗파 : $"+getBifinex+"\n업빗 : ₩"+getUpbit+"("+uppercent+"%)\n빗썸 : ₩"+getBithumb+"("+bithumbpercent+"%)\n바낸 : $"+getBinance+"\n빗플 : $"+getBitflyer+""
                }
            }
    }else if(msg.startsWith("호재")){
        msg = msg.replace("호재 ","");
         var coinDatas =  request('GET', marketcap);
         var coinData = JSON.parse(coinDatas.getBody()); 
         var name = [];
         var testData = "";
         for(var i=0;i<coinData.length;i++){
            if(msg.toUpperCase() == coinData[i].symbol){
                 name.push((coinData[i].name).replace(" ","+"));   
            }
        }//for
            var foundStr = 'card__date\">';
            var parsingHTML = "https://coinmarketcal.com/?form%5Bcoin%5D%5B%5D="+name[0]+"+%28"+msg.toUpperCase()+"%29";
                
            var coinHTML = request('GET', parsingHTML);
            var coinData = coinHTML.getBody().toString().split(foundStr);
            var pickData = '';
            var cd='';
             for(var i=1;i<coinData.length;i++){
                cd = coinData[i].split("card__title\">");
                pickData += cd[0].split("<\/h5>")[0] +": "+cd[1].split('<\/h5>')[0].replace("&amp;","&")+"\n";
             }
             pickData = pickData.replace(/"/gi,"");
             
             if(pickData != ''){
                testData +=  msg.toUpperCase()+"("+name[0].replace("+"," ")+") 호재정리\n"+pickData;
            }else{  
                    testData +=  msg.toUpperCase()+"("+name[0].replace("+"," ")+")은(는) 아직 호재가 없어요 ㅠ_ㅠ";
            }
            send = {
                'message' : {
                    'text' : testData
                }
            }     
         
           
       }else if(msg=="도미"||msg=="시총"||msg=="ㄷㅁ"||msg=="ㅅㅊ"){
        var dominanceD = request('GET', domin);
        var domiData = JSON.parse(dominanceD.getBody());
        var bitcoinD = request('GET', bitcoin);
        var bitcoinReal = JSON.parse(bitcoinD.getBody());
      
          var dd = domiData.bitcoin_percentage_of_market_cap+"%";
          var cap = "$"+thousandComma(pointCut(domiData.total_market_cap_usd));
          var bitcoinPrice = "$"+thousandComma(pointCut(bitcoinReal[0].price_usd));
          var bitcoinchange = bitcoinReal[0].percent_change_24h+"%";
          var marketCapBtc = "$"+thousandComma(parseInt(bitcoinReal[0].market_cap_usd));
          var volume = "$"+thousandComma(parseInt(bitcoinReal[0]["24h_volume_usd"]));
         
          send = {
            'message' : {
                'text' : "BTC(Bitcoin)\n가격 : "+bitcoinPrice+"("+bitcoinchange+")\nVol : "+volume+"\nCap : "+marketCapBtc+"\n\n도미 : "+dd+"\n시총 : "+cap
            }
           }
                
    }else if(msg.startsWith("거래소")||msg.startsWith("ㄱㄹㅅ")){
           msg = msg.replace("거래소 ","").replace("ㄱㄹㅅ ","");
           var testData = "";
           var coinDatas =  request('GET',marketcap);
           var coinData = JSON.parse(coinDatas.getBody()); 
           var name = [];
           for(var i=0;i<coinData.length;i++){
              if(msg.toUpperCase() == coinData[i].symbol){
                name.push(coinData[i].id);
           }
          }//for
          
          var foundStr = /href=\"\/exchanges\/(.?)*\/\">/g;
         
			for(var j=0;j<name.length;j++){
                if(j>0){
                    testData += "\n";
                }
				var parsingHTML = "https://coinmarketcap.com/currencies/"+name[j]+"/#markets";
                var parsing =  request('GET',parsingHTML);
                var exchangeHTML = parsing.getBody().toString(); 
				var dataArray = exchangeHTML.toString().match(/href=\"\/exchanges\/(.?)*\/\">/g);
				var exchangeData = "";
		  
			   dataArray = uniqArr(dataArray);
		   
			   dataArray.splice(0,1);
			  for(var i=0;i<dataArray.length;i++){
				exchangeData += dataArray[i].replace("href=\"/exchanges/","").replace("/\">","")+"\n";
			   }
			
			   if(dataArray.length!=0){  //데이터 있으면 출력
                 testData +=  msg.toUpperCase()+"("+name[j]+",총 "+dataArray.length+"건)\n"+exchangeData;
			   }
            }
            send = {
                'message' : {
                    'text' :   testData
                }
            }
    }else if(msg=='메뉴얼'){
        send = {
            'message' : {
                'text' :   "코인요정 메뉴얼(행복)\n심볼 : 달러, 사토시, 한화 \n거래소 심볼 : 상장된 거래소 목록 (거래소 볼륨순)\n김프 심볼: 업비트 기준 김프\n도미(시총) : 도미넌스, 시총\n비트 : 거래소별 실시간 비트가격\n마진 : 현재 빗파 롱, 숏 개수\nROI 심볼 : 코인 ICO 수익률\n호재 심볼 : 코인별 이벤트"
            }
        }
    }else if(msg.toUpperCase().startsWith("ROI")){
        var coinName = msg.replace("roi ","").replace("ROI ","").replace("Roi ","").toUpperCase();
        var testData = "";
					try{
					var coinDatas = request('GET',marketcap);
					var coinData = JSON.parse(coinDatas.getBody()); 
					var name= [];
					
					for(var i=0;i<coinData.length;i++){
						if(coinName == coinData[i].symbol){
							name.push(coinData[i].id);
						}
					}
					
					for(var j=0;j<name.length;j++){
						var roiInfo = "https://tokenstats.io/api/v1/tokens/"+name[j]+"";
					
						var roiArray = request('GET',roiInfo);
						var roiData = JSON.parse(roiArray.getBody()); 
						var roiEth = ((roiData.roi_eth!= null) ? (parseInt(parseFloat(roiData.roi_eth)*100))+"%" : "noData");
						var roiBtc = ((roiData.roi_btc != null) ? (parseInt(parseFloat(roiData.roi_btc)*100))+"%" : "noData");
						var roiUsd = ((roiData.roi_usd != null) ? (parseInt(parseFloat(roiData.roi_usd)*100))+"%" : "noData");
												
						if(roiUsd != "noData"){
                            testData +=	coinName+"("+name[j]+") ICO 수익률\nUSD : "+roiUsd+"\nBTC : "+roiBtc+"\nETH : "+roiEth ;
						}else if((roiUsd=="noData"&&name[j]!="")){
							testData +=	 coinName+"("+name[j]+") ICO 수익률 데이터가 없습니다."
						}
					}
					}catch(e){
					}
    }else{
        var coin = request('GET', marketcap);
        var coinArray = JSON.parse(coin.getBody());
        var reply = "";
        for(var i = 0; i<coinArray.length; i++){
           
            if(coinArray[i].symbol == msg.toUpperCase()){ //array symbol 대문자 msg 비교
               var coinKRW = thousandComma(pointCut(coinArray[i].price_krw));
               var coinUSD = thousandComma(pointCut(coinArray[i].price_usd));
               var coinMKC = thousandComma(parseInt(coinArray[i].market_cap_usd));
               var vol = thousandComma(parseInt(coinArray[i]["24h_volume_usd"]));
               
               if(reply!=""){
                   reply += "\n\n";
               }
               
               reply  += coinArray[i].name+"("+coinArray[i].rank+"위)\n $"+coinUSD;
               
               if(coinArray[i].percent_change_24h!=null){
                   reply += "("+coinArray[i].percent_change_24h+"%)\n" +"   "+coinArray[i].price_btc+"btc\n ₩"+coinKRW+"\nVol $"+vol;
               }else{
                   reply += "\n   "+coinArray[i].price_btc+"btc\n ₩"+coinKRW+"\nVol $"+vol;
               }

               if(coinMKC!='NaN'){
                  reply += "\nCap $"+coinMKC;
               }
             }
           }
           send = {
            'message' : {
                'text' : reply
            }
            }
    }//else

    if(send.message == ""||send.message == null){
        send = {
            'message' : {
                'text' : "해당하는 명령어가 없습니다! 메뉴얼을 입력하여 명령어를 확인해주세요."
            }
        }
    }
    
    res.json(send);
    }catch(e){
        console.error(e);
    }
});

function pointCut(text){
    var pointCutData = parseFloat(text).toFixed(3);   
    
    return pointCutData;
}
function httpTest(httpURL){
    http.get(httpURL, function(res) {
     if(res.statusCode == '404'){ // <======= Here's the status code
     }else{
        return res.body;
    }
   }).on('error', function(e) {
         console.error(e);
   });
}
function thousandComma(text){
    if(text != null){

   if((text*100)%100==0){
       text = parseInt(text);
   }
   
   var commaData = text.toString().replace(/\B(?=(\d{3})+(?!\d))/g,",");
   
   return commaData;}
 else{return 0;}
}
function uniqArr(arr) {
    var chk = [];
    for (var i = 0; i < arr.length; i++) {
        if (chk.length == 0) {
            chk.push(arr[i]);
        } else {
            var flg = true;
            for (var j = 0; j < chk.length; j++) {
                if (chk[j] == arr[i]) {
                    flg = false;
                    break;
                }
            }
            if (flg) {
                chk.push(arr[i]);
            }
        }
    }
    return chk;
}

http.createServer(app).listen(9090,function(){
    console.log('서버 실행중...');
});