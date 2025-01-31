document.addEventListener("DOMContentLoaded", async () => {
    const API_KEY = "b8bab2c7a6810e55b20a5552"; // Substitua por sua chave válida
    const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/`;

    // Taxa manual do Bitcoin (valor atualizado corretamente)
    const BTC_TO_USD_RATE = 100000.00; // Exemplo: 1 BTC = 100.000,00 USD

    const currencyFlags = {
        "BRL": "./assets/real.png",
        "USD": "./assets/dolar.png",
        "EUR": "./assets/euro.png",
        "BTC": "./assets/bitcoin.png",
        "GBP": "./assets/libra.png",
    };

    const currencySymbols = {
        "BRL": "R$",
        "USD": "$",
        "EUR": "€",
        "BTC": "₿",
        "GBP": "£",
    };

    const fromCurrencySelect = document.querySelector("label:nth-of-type(1) select");
    const toCurrencySelect = document.querySelector("label:nth-of-type(2) select");
    const inputField = document.querySelector(".input-currency");
    const fromCurrencyImage = document.querySelector(".currency-box:nth-of-type(1) img");
    const toCurrencyImage = document.querySelector(".currency-box:nth-of-type(2) img");
    const fromCurrencyLabel = document.querySelector(".currency-box:nth-of-type(1) .currency");
    const toCurrencyLabel = document.querySelector(".currency-box:nth-of-type(2) .currency");
    const fromCurrencyValue = document.querySelector(".currency-value-to-convert");
    const toCurrencyValue = document.querySelector(".currency-value");
    const convertButton = document.querySelector(".convert-button");
    const arrowImage = document.querySelector(".arrow-img");

    let exchangeRates = {};

    async function fetchExchangeRates(baseCurrency) {
        try {
            const response = await fetch(`${API_URL}${baseCurrency}`);
            const data = await response.json();

            if (data.result === "success") {
                exchangeRates = data.conversion_rates;
                return true;
            } else {
                console.error("Erro ao buscar taxas de câmbio:", data);
                return false;
            }
        } catch (error) {
            console.error("Erro de conexão com a API:", error);
            return false;
        }
    }

    async function updateCurrencyDetails(resetValues = true) {
        const fromCurrency = getCurrencyCode(fromCurrencySelect.value);
        const toCurrency = getCurrencyCode(toCurrencySelect.value);

        fromCurrencyImage.src = currencyFlags[fromCurrency];
        fromCurrencyLabel.textContent = fromCurrencySelect.value;
        inputField.placeholder = `${currencySymbols[fromCurrency]} 0,00`;

        toCurrencyImage.src = currencyFlags[toCurrency];
        toCurrencyLabel.textContent = toCurrencySelect.value;

        if (resetValues) {
            fromCurrencyValue.textContent = `${currencySymbols[fromCurrency]} 0,00`;
            toCurrencyValue.textContent = `${currencySymbols[toCurrency]} 0,00`;
            inputField.value = "";
        }

        const success = await fetchExchangeRates(fromCurrency);
        if (!success) {
            toCurrencyValue.textContent = "Erro ao carregar taxas.";
        }
    }

    function getCurrencyCode(currencyName) {
        const mapping = {
            "R$ Real Brasileiro": "BRL",
            "US$ Dólar Americano": "USD",
            "€ Euro": "EUR",
            "₿ Bitcoin": "BTC",
            "£ Libra": "GBP"
        };
        return mapping[currencyName] || "BRL";
    }

    function formatCurrency(value, currencySymbol) {
        return `${currencySymbol} ${parseFloat(value).toLocaleString("pt-BR", {
            minimumFractionDigits: currencySymbol === "₿" ? 10 : 2,
        })}`;
    }

    function updateInputValues() {
        const fromCurrency = getCurrencyCode(fromCurrencySelect.value);
        let inputValue = inputField.value;

        inputValue = inputValue.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
        const numericValue = parseFloat(inputValue);

        if (!isNaN(numericValue)) {
            fromCurrencyValue.textContent = formatCurrency(numericValue, currencySymbols[fromCurrency]);
        } else {
            fromCurrencyValue.textContent = `${currencySymbols[fromCurrency]} 0,00`;
        }
    }

    function convertValues() {
        const fromCurrency = getCurrencyCode(fromCurrencySelect.value);
        const toCurrency = getCurrencyCode(toCurrencySelect.value);
        let inputValue = inputField.value;

        inputValue = inputValue.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
        const numericValue = parseFloat(inputValue);

        if (!isNaN(numericValue)) {
            let convertedValue;

            if (toCurrency === "BTC") {
                convertedValue = (numericValue / exchangeRates["USD"]) / BTC_TO_USD_RATE;
            } else if (fromCurrency === "BTC") {
                convertedValue = numericValue * BTC_TO_USD_RATE * (exchangeRates[toCurrency] || 1);
            } else {
                convertedValue = numericValue * (exchangeRates[toCurrency] || 1);
            }

            toCurrencyValue.textContent = formatCurrency(convertedValue, currencySymbols[toCurrency]);

            arrowImage.classList.add("rotate-arrow");
            setTimeout(() => {
                arrowImage.classList.remove("rotate-arrow");
            }, 1000);
        } else {
            toCurrencyValue.textContent = "Conversão indisponível";
        }
    }

    fromCurrencySelect.addEventListener("change", () => updateCurrencyDetails(true));
    toCurrencySelect.addEventListener("change", () => updateCurrencyDetails(true));
    inputField.addEventListener("input", updateInputValues);
    convertButton.addEventListener("click", convertValues);

    await updateCurrencyDetails();
});
    