function loadData() {
    console.log("CLICKED");

    let coins = document.getElementById("coins").value;
    let days = document.getElementById("days").value;
    let currency = document.getElementById("currency").value;

    fetch(`/prices?coins=${coins}&days=${days}&currency=${currency}`)
        .then(res => res.json())
        .then(data => {
            let table = document.querySelector("#table tbody");
            table.innerHTML = "";

            for (let coin in data.data) {
                let prices = data.data[coin];
                let seenDates = new Set();

                for (let i = 0; i < prices.length; i++) {
                    let p = prices[i];
                    let date = new Date(p.time).toISOString().split("T")[0];

                    if (seenDates.has(date)) continue;
                    seenDates.add(date);

                    let row = "<tr>" +
                        "<td>" + coin + "</td>" +
                        "<td>" + date + "</td>" +
                        "<td>" + p.price.toFixed(2) + "</td>" +
                        "<td>" + currency.toUpperCase() + "</td>" +
                        "</tr>";

                    table.innerHTML += row;
                }
            }
        })
        .catch(err => console.log(err));
}
