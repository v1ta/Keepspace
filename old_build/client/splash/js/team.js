Template.teamPage.onRendered(function(){
	$(".bioDiv").each(function(index, element){
		//console.log(index);
		//console.log($(this).height());
	});
});

Template.aboutPage.onRendered(function(){
// (function(){

//   var parallax = document.querySelectorAll(".parallax"),
//       speed = 0.3;

//   window.onscroll = function(){
//     [].slice.call(parallax).forEach(function(el,i){

//       var windowYOffset = window.pageYOffset,
//           elBackgrounPos = "50% " + (windowYOffset * speed) + "px";

//       el.style.backgroundPosition = elBackgrounPos;

//     });
//   };

// })();
	$('.parallax-window').parallax(
		{
			imageSrc: "images/keepspace_seamlessbg.png",
			bleed:0,
			speed:0.4,
			zIndex:0
		}
	);
});