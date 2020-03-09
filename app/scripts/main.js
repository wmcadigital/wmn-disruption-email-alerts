const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
const myList = document.querySelector('.qwerty');


const selectElement = document.querySelector('.service');

selectElement.addEventListener('input', (event) => {
  var myObj, i, x = "";
  const result = document.querySelector('.demo');
  result.textContent = `Service # ${event.target.value}`;
  // console.log(result);

var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: JSON.stringify({SearchString: event.target.value}),
  redirect: 'follow'
};

fetch("http://journeyplanner.cenapps.org.uk/api/TimetableStopApi/Search/serviceQuery", requestOptions)
  .then(response => response.json())
  //.then(result => console.log(result))
  .then(function(text) {
    const serialized =   JSON.stringify(text); 
    // console.log(serialized);

    console.log('Request successful', text);
 
 for (let i in text) {
   x += text[i];
  }
  
  for (x in serialized) {
    document.getElementById("demo3").innerHTML += x.ServiceNumber + "<br>";
  }

 document.getElementById("demo2").innerHTML = x;

  })
  .catch(error => console.log('error', error));


  //for (let i in result) {
  //  console.log('testng 123');
  //  x += result[i];
  //  console.log(result[i]);
 // }
  //document.getElementById("demo2").innerHTML = x;

});

