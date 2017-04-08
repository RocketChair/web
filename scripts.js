const humidityData = {
    x: [],
    y: [],
    type: 'scatter',
    name: 'Humidity'
}

const temperatureData = {
    x: [],
    y: [],
    type: 'scatter',
    name: 'Temperature'
}

const lightData = {
    x: [],
    y: [],
    type: 'scatter',
    name: 'Light'
}

const pm01 = {
    x: [],
    y: [],
    type: 'scatter',
    name: 'PM 1'
}

const pm25 = {
    x: [],
    y: [],
    type: 'scatter',
    name: 'PM 2,5'
}


const pm10 = {
    x: [],
    y: [],
    type: 'scatter',
    name: 'PM 10'
}

ws = new WebSocket("wss://rocket-chair.herokuapp.com/");

ws.onopen = () => {
    console.log('ws.onopen');
}
ws.onmessage = (evt) => {
    let data = JSON.parse(evt.data);
    console.log(data);
    if (isIotData(data)) {
        let iotData = data.data;
        pushIotData(iotData);
        Plotly.newPlot('humidityAndTemperature', [humidityData, temperatureData], getLayout("Temperature and humidity"));
        Plotly.newPlot('light', [lightData], getLayout("Light"));
        Plotly.newPlot('pm', [pm01, pm25, pm10], getLayout("PM"));
    } else if (isTips(data)) {
        createPush(data.data);
    } else if (isAlert(data)){
        notify(data.message);
    }
}

isIotData = (data) => {
    return data && data.type === "data" && data.source === "iot";
}

isTips = (data) => {
    return data && data.type === "tips";
}

isAlert = (data) => {
    return data && data.type === "ALERT";
}

pushIotData = (iotData) => {
    let x = getDateFormatFromTimestamp(iotData.timestamp);
    humidityData.x.push(x);
    humidityData.y.push(iotData.humidity);
    temperatureData.x.push(x);
    temperatureData.y.push(iotData.temperature);
    lightData.x.push(x);
    lightData.y.push(iotData.light);
    pm01.x.push(x);
    pm01.y.push(iotData.PM01Value);
    pm25.x.push(x);
    pm25.y.push(iotData.PM2_5Value);
    pm10.x.push(x);
    pm10.y.push(iotData.PM10Value);
}

getDateFormatFromTimestamp = (timestamp) => {
    return new Date(timestamp);
}

getLayout = (title) => {
    return {
        title: title,
        showlegend: true
    }
}
createPush = (key) => {
    let message;
    switch (key) {
        case 'TO_DARK':
            message = 'Consider turning on light or you may come blind!'
            break;
        case 'TO_BRIGHT':
            message = 'Wear sunglasses!'
        case 'TO_HOT':
            message = 'Consider opening window or wear bikini!'
            break;
        case 'TO_COLD':
            message = 'Consider holidays on Bahama beach!'
            break;
        default:
            message = 'Sorry, there is no hope for you!'
    }
    notify(message);
}

notify = (message) => {
    Push.create(message, {
        body: 'Rocket chair rules!',
        icon: 'foguete.png',
        timeout: 4000,
        onClick: function () {
            console.log("Fired!");
            window.focus();
            this.close();
        },
        vibrate: [200, 100, 200, 100, 200, 100, 200]
    });
}
