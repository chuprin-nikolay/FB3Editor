addEventListener("message",function(b){var a=b.data,c;c=self._worker||new W();self._worker=c;if(!a){c.init()}else{c.message(a)}},false);function W(){return{data:null,init:function(){var a=this;a.data=true;a.post()},message:function(b){var a=this;a.data=b;a.data.countResponse=0;a.data.countRequest=0;a.data.countAsyncRequest=0;a.loadResource()},post:function(){var b=this,a;a={masterName:"loadResources",data:b.data};self.postMessage(a)},loadResource:function(){var c=this,d=c.data,f=d.countRequest,e=d.resourcesData,b,a;if(d.countRequest===e.length){return}if(d.countAsyncRequest<d.maxAsyncRequests){d.countRequest++;d.countAsyncRequest++;b=d.resourcesData[f];a=b.url?b.url:d.urlRes+"?art="+d.art+"&image="+b._Id;b.url=a;c.send(a);c.loadResource()}},send:function(a){var b=this,c=b.data,e=c.resourcesData,d;a=a+"&_d="+new Date().getTime();d=b.getXmlHttp();d.open("GET",a,true);d.indexResource=c.countRequest-1;if(Uint8Array){d.responseType="arraybuffer"}else{if(d.overrideMimeType){d.overrideMimeType("text/plain; charset=x-user-defined")}}d.onreadystatechange=function(){if(d.readyState==4){c.response=d.response;c.status=d.status;c.statusText=d.statusText;c.indexResource=d.indexResource;c.countResponse++;c.countAsyncRequest--;c.resolve=c.countResponse===e.length;b.post();if(!c.resolve){b.loadResource()}}};d.send()},getXmlHttp:function(){try{return new ActiveXObject("Msxml2.XMLHTTP")}catch(b){try{return new ActiveXObject("Microsoft.XMLHTTP")}catch(a){}}if(typeof XMLHttpRequest!==undefined){return new XMLHttpRequest()}}}};