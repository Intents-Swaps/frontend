import axios from 'axios';

const HERMES_URL = "https://hermes.pyth.network";
const BCH_ID = "0x3dd2b63686a450ec7290df3a1e0b583c0481f651351edfa7636f39aed55cf8a3";

async function checkPrice() {
    try {
        console.log(`Fetching price for BCH (ID: ${BCH_ID})...`);
        const response = await axios.get(`${HERMES_URL}/v2/updates/price/latest`, {
            params: {
                ids: [BCH_ID],
                encoding: "hex",
                parsed: true,
            }
        });

        console.log("Response status:", response.status);

        if (response.data && response.data.parsed) {
            const feed = response.data.parsed[0];
            console.log("Feed data:", JSON.stringify(feed, null, 2));
            if (feed && feed.price) {
                const price = Number(feed.price.price) * Math.pow(10, feed.price.expo);
                console.log(`Calculated BCH Price: $${price}`);
            } else {
                console.log("Price data missing in feed.");
            }
        } else {
            console.log("No parsed data in response.");
            console.log("Raw data:", JSON.stringify(response.data, null, 2));
        }

    } catch (error) {
        console.error("Error fetching price:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
    }
}

checkPrice();
