console.log("was this called?");
$("#index").ready(function() {
    console.log("was I called?");
    $.ajax({
        url: "api/blog_post",
        success: function(result) {
            document.getElementById("#index").innerHTML = result;
            console.log(result);
        }
    });
});

function doSomething() {
    console.log("we did something!");
}

// $("#getJson").click(function() {
//     $.ajax({
//         url: "math_service",
//         data: {
//             op1: document.getElementById("op1").value,
//             op2: document.getElementById("op2").value,
//             operator: document.getElementById("operator").value,
//         },
//         success: function(result) {
//             document.getElementById("resultOfEquation").innerHTML = result.equation
//         }
//     });
// });