console.log("Hello");
function dodaj(number1, number2) {
  console.log("kliknięty", +number1 + +number2);
}
let button = document.getElementById("przycisk");
button.addEventListener("click", function () {
    let number1=document.getElementById("liczba1").value;
    let number2=document.getElementById("liczba2").value;
    dodaj(number1, number2);
});
