// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.com/#x15.4.4.18
if ( !Array.prototype.forEach ) {
  Array.prototype.forEach = function( callback, thisArg ) {

    var T, k;

    if ( this == null ) {
      throw new TypeError( " this is null or not defined" );
    }

    // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0; // Hack to convert O.length to a UInt32

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if ( {}.toString.call(callback) != "[object Function]" ) {
      throw new TypeError( callback + " is not a function" );
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if ( thisArg ) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while( k < len ) {

      var kValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then

      if ( k in O ) {

        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
        kValue = O[ k ];

        // ii. Call the Call internal method of callback with T as the this value and
        // argument list containing kValue, k, and O.
        callback.call( T, kValue, k, O );
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined
  };
}

var rt_track;
if (!rt_track) {
    let www_domain = "www.rentracks.jp";  
    let me_domain = "www.rentracks.me";
    rt_track = function () {
        if (!(this instanceof rt_track)) {
            return new rt_track();
        }

        this.click_ID = "";
        this.tracktagURL = "";
        this.price = 0;
        this.quantity = 1;
        this.reward = -1;
        this.invoice = -1;
        this.cname = "";
        this.cemail = "";
        this.ctel = "";
        this.cinfo = "";

        this.sid = 0;
        this.pid = 0;
        this.ckcode = "";
        
        this.cemailh = "";
        this.ctelh = "";

        this.mktagurl = function () {
            var pttype = document.location.protocol;
            if (!(pttype === "http:" || pttype === "https:"))
                return;
            var query = "?sid=" + String(this.sid) +
                    "&pid=" + String(this.pid) +
                    "&price=" + String(this.price) +
                    "&quantity=" + String(this.quantity) +
                    "&reward=" + String(this.reward);
            if (this.invoice > 0 || this.invoice === 0) {
                query = query + "&invoice=" + String(this.invoice);
            }
            if (this.cname.length > 0) {
                query = query + "&cname=" + this.cname;
            }
            if (this.cemail.length > 0) {
                query = query + "&cemail=" + this.cemail;
            }
            if (this.ctel.length > 0) {
                query = query + "&ctel=" + this.ctel;
            }
            if (this.cinfo.length > 0) {
                query = query + "&cinfo=" + this.cinfo;
            }
            if (this.cemailh.length > 0) {
                query = query + "&cemailh=" + this.cemailh;
            }
            if (this.ctelh.length > 0) {
                query = query + "&ctelh=" + this.ctelh;
            }
            if (this.ckcode.length > 0) {
                query = query + "&_rt_ck=" + this.ckcode;
            } else {
                query = query + "&_rt_ck=1";
            }
            return pttype + "//" + www_domain + "/secure/e.gifx" + query;
        };
    };
    rt_track.gck = function (key) {
        var cks_dt = document.cookie.split(';');
        var ck_dt = "";
        cks_dt.forEach(function (value) {
            var ck_value = value.replace(" ", "");
            if (ck_value.indexOf(key + "=") === 0) {
                ck_dt = ck_value.replace(key + "=", "");
                return ck_dt;
            }
        });
        return ck_dt;
    };
    rt_track.sck = function (key, val, domain, path, lifetime) {
        if (lifetime) {
            var expires = (new Date((new Date).getTime() + lifetime)).toUTCString();
        }
        var cookie_attribute = 'https:' == location.protocol ? '; SameSite=None; Secure' : '';
        document.cookie = key + "=" + val + (domain ? "; domain=" + domain : "") + (path ? "; path=" + path : "") + (expires ? "; expires=" + expires : "") + cookie_attribute;
        //console.log("RT0000: " + key + "=" + val + (domain ? "; domain=" + domain : "") + (path ? "; path=" + path : "") + (expires ? "; expires=" + expires : "") + cookie_attribute);
    };
    rt_track.sck2 = function (key, val, domain, path, lifeseconds) {
        var cookie_attribute = 'https:' == location.protocol ? '; SameSite=None; Secure' : '';
        document.cookie = key + "=" + val + (domain ? "; domain=" + domain : "") + (path ? "; path=" + path : "") + (lifeseconds ? "; max-age=" + lifeseconds : "") + cookie_attribute;
    };
    rt_track.gqy = function (key) {
        var url = window.location.search;
        var querys_dt = url.slice(1).split('&');
        var query_dt = "";
        querys_dt.forEach(function (value) {
            var ck_value = value.replace(" ", "");
            if (ck_value.indexOf(key + "=") === 0) {
                query_dt = ck_value.replace(key + "=", "");
                return query_dt;
            }
        });
        return query_dt;
    };
    rt_track.setLocalStorage = function(key, value, lifetime){
        var expire = lifetime === undefined ? false: (new Date).getTime() + lifetime; //msec
        var data = {
            expire: expire,
            value:  value
        }
        localStorage.setItem(key, JSON.stringify(data));
        //console.log('RT0001: ' + value + ' ' + lifetime);

    };
    rt_track.getLocalStorage = function(key){
        var ls = localStorage[key];
        if (ls === undefined) {
            return '';
        }
        ls = JSON.parse(ls);
        if (ls.expire === false || ls.expire > (new Date).getTime()) {
            //console.log('RT0002:' + ls.value);
            return ls.value;
        } else {
            localStorage.removeItem(key);
            return '';
        }
    };
    rt_track.strackck = function () {
        if (_rt.sid > 0) {
            var key = "_rt_ck_" + String(_rt.sid);
            var domainname = document.domain;
            var domainparts = domainname.split('.');
            var path = "/";
            var domain = "";
            var second_item = ['co', 'ne', 'or', 'ad', 'gr', 'ac', 'lg', 'ed', 'jpn', 'in', 'jp', 'org', 'me', 'biz', 'net', 'com', 'cn', 'info', 'idv', 'nom', 'ind', 'gen', 'firm', 'l', 'p', 'tokyo', 'cleaning'];
            if (domainparts.length === 2) {
                domain = "." + domainname;
            } else if (domainparts.length === 3) {
                if (second_item.indexOf(domainparts[1]) === -1) {
                    domain = domainname.slice(domainparts[0].length);
                } else {
                    domain = "." + domainname;
                }
            } else if (domainparts.length > 3) {
                domain = domainname.slice(domainparts[0].length);
            }
            var lifetime = 5184000000;
            var value = String(_rt.sid) + '.' + _rt.click_ID;
            if('cn' != rt_track.gqy("_rt_ck_t")){
                rt_track.sck(key, value, domain, path, lifetime);
            }
            var ua = navigator.userAgent;
            rt_track.setLocalStorage(key, value, lifetime);
        }
    };
    rt_track.rt_tracktag = function () {

        var ua = navigator.userAgent;
        var normalITPProcessed = '';

        _rt.ckcode = rt_track.gck("_rt_ck_" + String(_rt.sid));

        //if (_rt.sid > 0 && _rt.pid > 0 && _rt.ckcode.length > 0 ) {
        if (_rt.sid > 0 && _rt.pid > 0) {
            _rt.tracktagURL = _rt.mktagurl();
            var key = "_rt_ck_" + String(_rt.sid);
            var path = "/", lifetime = 600;
            var domainname = document.domain;
            var domainparts = domainname.split('.');
            var domain = "";
            var second_item = ['co', 'ne', 'or', 'ad', 'gr', 'ac', 'lg', 'ed', 'jpn', 'in', 'jp', 'org', 'me', 'biz', 'net', 'com', 'cn', 'info', 'idv', 'nom', 'ind', 'gen', 'firm', 'l', 'p', 'tokyo', 'cleaning'];
            if (domainparts.length === 2) {
                domain = "." + domainname;
            } else if (domainparts.length === 3) {
                if (second_item.indexOf(domainparts[1]) === -1) {
                    domain = domainname.slice(domainparts[0].length);
                } else {
                    domain = "." + domainname;
                }
            } else if (domainparts.length > 3) {
                domain = domainname.slice(domainparts[0].length);
            }
            if(_rt.ckcode.length > 0){
                var value = _rt.ckcode;
                rt_track.sck2(key, value, domain, path, lifetime);
                var itp_tag = document.createElement("itp_tag");
                itp_tag.innerHTML = '<img src="' + _rt.tracktagURL + '&method=cc' + '" width="1" height="1">';
                document.body.appendChild(itp_tag);
                //console.log('RT0003: ' + _rt.tracktagURL);
                normalITPProcessed = 'done';
                localStorage.removeItem(key);
            }
        }

        //サーバーCookie処理
        if (_rt.sid > 0 && _rt.pid > 0) { //1st Partyの_rt_ckの有無に関係なく実行する。cvcで通常ITP処理で成果が上がっている場合はwww.rentracks.meのcookieの削除のみを実施する
            var itp_iframe_tag = document.createElement("itp_iframe_tag");
            itp_iframe_tag.innerHTML = '<iframe src="https://' + me_domain + '/cvc.php?sid=' + String(_rt.sid) + '&pid=' + String(_rt.pid) + '&price=' + String(_rt.price) + '&reward=' + String(_rt.reward) + '&cname=' + _rt.cname + '&ctel=' + _rt.ctel + '&cemail=' + _rt.cemail + '&ctelh=' + _rt.ctelh + '&cemailh=' + _rt.cemailh + '&cinfo=' + _rt.cinfo + '&normalitpprocessed=' + normalITPProcessed + '" width="1" height="1" frameborder="0">';
            document.body.appendChild(itp_iframe_tag);
        }
       
		//Local Storage
		if (_rt.sid > 0 && _rt.pid > 0 && !_rt.ckcode.length > 0) { //1st Partyの_rt_ckが存在しない場合のみ実行される。cvc.phpでの成果発生は検知できないため、cvc.phpと同時に処理が実行される
			_rt.ckcode = rt_track.getLocalStorage(key);
			if (_rt.ckcode) {
				_rt.tracktagURL = _rt.mktagurl();
				var itp_localstorage_tag = document.createElement("itp_tag");
				itp_localstorage_tag.innerHTML = '<img src="' + _rt.tracktagURL + '&_rt_itp=2.1ls&method=ls" width="1" height="1">';
				document.body.appendChild(itp_localstorage_tag);
				rt_track.setLocalStorage(key, _rt.ckcode, 10 * 60 * 1000);
			} else {
				localStorage.removeItem(key);
				//CNAME
				//console.log('https://'+ www_domain+'/adx/cname_api.php?pid=' + _rt.pid);
				var fqdn = '';
				var cnok = -1;
				var sid = _rt.sid;
				var pid = _rt.pid;
				var price = _rt.price;
				var reward = _rt.reward;
				var cname = _rt.cname;
				var ctel = _rt.ctel;
				var cemail = _rt.cemail;
				var cinfo = _rt.cinfo;
				var ctelh = _rt.ctelh;
				var cemailh = _rt.cemailh;
    		    var xhr = new XMLHttpRequest();
    		    xhr.open('get', 'https://' + www_domain + '/adx/cname_api.php?pid=' + _rt.pid);
				xhr.onreadystatechange = function () {
					if ((xhr.readyState === 4) && (xhr.status === 200)) {
            			var res = JSON.parse(xhr.response);
            			var subdomain = res.cname_subdomain;
            			if (subdomain) {
              				//console.log(subdomain + domain);
              				fqdn = subdomain + domain;
              				cnok = 1;
              				var itp_iframe_tag_cn = document.createElement("itp_iframe_tag_cn");
              				itp_iframe_tag_cn.innerHTML = '<iframe src="https://' + fqdn + '/cvcname.php?sid=' + String(sid) + '&pid=' + String(pid) + '&price=' + String(price) + '&reward=' + String(reward) + '&cname=' + cname + '&ctel=' + ctel + '&cemail=' + cemail + '&cinfo=' + cinfo + '&ctelh=' + ctelh + '&cemailh=' + cemailh + '&domain=' + domain + '&subdomain=' + subdomain + '&normalitpprocessed=' + normalITPProcessed + '&cnok=' + cnok + '" width="1" height="1" frameborder="0">';
              				document.body.appendChild(itp_iframe_tag_cn);
            			} else { //値が返ってこなかった場合は現在アクセスしているページのFQDNで試す
              				//nothing
    	        		}
        	  		} else {
            			if (xhr.status !== 200) { //通信に失敗した場合も現在アクセスしているページのFQDNで試す
              				//nothing
            			}
          			}
        		};
        		xhr.send(null);
      		}
    	}	
  	};
}



//LP
var _rt = new rt_track();
var qdts = rt_track.gqy("_rt_ck").split('.');
if (qdts.length === 2) {
    _rt.sid = qdts[0];
    _rt.click_ID = qdts[1];
    if (_rt.click_ID.length > 0) {
        rt_track.strackck();
    }
} else {
	//_rt_ck指定がない場合に実施する
	//ダイレクト計測用の引数チェック(ダイレクト計測用もしくは通常のパラメータ指定があれば処理を実施）
	if (rt_track.gqy('_ridx') || (rt_track.gqy('idx') && rt_track.gqy('dna'))){
		var xhrcr = new XMLHttpRequest();
		xhrcr.open("GET", 'https://www.rentracks.jp/adx/rthrough.html?' + window.location.href.split("?")[1], true);
		xhrcr.onreadystatechange = function(){
			if ((xhrcr.readyState === 4) && (xhrcr.status === 200)) {
				const rt_json = JSON.parse(xhrcr.responseText);
				if (rt_json.set_json === 'OK') {
					var js_param = rt_json._rt_ck.split('.');
					if (js_param.length === 2) {
						_rt.sid = js_param[0];
						_rt.click_ID = js_param[1];
						if (_rt.click_ID.length > 0) {
							rt_track.strackck();
						}
					}
				}
			}
		};
		xhrcr.send(null);
	}
}

function rt_tracktag() {
    rt_track.rt_tracktag();
}
