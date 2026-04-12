function loadData() {
    let coins = document.getElementById("coins").value;
    let days = document.getElementById("days").value;
    let currency = document.getElementById("currency").value;

    fetch(/prices?coins=${coins}&days=${days}&currency=${currency})
        .then(res => res.json())
        .then(data => {
            document.getElementById("output").textContent =
                JSON.stringify(data, null, 2);
        });
}
