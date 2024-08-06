var num=Math.floor(Math.random() * 4) + 1
if(document.getElementById("page-header").style.backgroundImage === ""){
	document.getElementById("page-header").style.backgroundImage = "url(/img/background/kon_0"+num+".jpg"+")"
	document.getElementById("footer").style.backgroundImage = "url(/img/background/kon_0"+num+".jpg"+")"
}
