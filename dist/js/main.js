!function(){for(var e,t=function(){},n=["assert","clear","count","debug","dir","dirxml","error","exception","group","groupCollapsed","groupEnd","info","log","markTimeline","profile","profileEnd","table","time","timeEnd","timeline","timelineEnd","timeStamp","trace","warn"],r=n.length,o=window.console=window.console||{};r--;)o[e=n[r]]||(o[e]=t)}();const myHeaders=new Headers;myHeaders.append("Content-Type","application/json");const myList=document.querySelector(".qwerty"),selectElement=document.querySelector(".service");selectElement.addEventListener("input",e=>{var t="";document.querySelector(".demo").textContent=`Service # ${e.target.value}`;var n={method:"POST",headers:myHeaders,body:JSON.stringify({SearchString:e.target.value}),redirect:"follow"};fetch("http://journeyplanner.cenapps.org.uk/api/TimetableStopApi/Search/serviceQuery",n).then(e=>e.json()).then((function(e){const n=JSON.stringify(e);console.log("Request successful",e);for(let n in e)t+=e[n];for(t in n)document.getElementById("demo3").innerHTML+=t.ServiceNumber+"<br>";document.getElementById("demo2").innerHTML=t})).catch(e=>console.log("error",e))});