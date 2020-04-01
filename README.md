# COVID Help API

#### Dev Base URL: https://https://covid-project-api.herokuapp.com/

## Routes

<details>
    <summary><b>POST /helper</b></summary>

    Query Params: none
    FormData:
        - group_name
        - representative
        - phone
        - password
        - locality (object of lat and lng)
        - social_service (optional)

    Registeration of social service groups/NGOs

</details>

<details>
    <summary><b>POST /login</b></summary>

    Query Params: none
    FormData:
        - phone
        - password

    Sign in of social service groups/NGOs

</details>

<details>
    <summary><b>POST /report</b></summary>

    Query Params: none
    FormData:
        - area_coordinates https://ibb.co/SsVvZYt
        - reported_by (name)
        - phone
        - helpType (description of help needed)

    Note: The `area_coordinates` property contains the lat lng of every point of the polygon. Make sure all the coordinates are of `Double` type

    Report a help

</details>

<details>
    <summary><b>Get reports in real time</b></summary>

    1. Initialize socket on the client

    ```javascript
        let socket = io("https://https://covid-project-api.herokuapp.com/")
    ```

    2. On getting the location of the device from the browser, emit an event to get new reports

    ```javascript
        socket.emit("new_report", { lat: pos.lat, lng: pos.lng });
    ```

    3. After submission of a new report, again emit an event for getting new reports

    ```javascript
        socket.emit("new_report", { lat: pos.lat, lng: pos.lng });
    ```

    4. Listen for new reports to be displayed onto the Google map

    ```javascript
        socket.on("reports", data => {
            console.log(data);
            // => Report objects are received
        })
    ```

</details>
