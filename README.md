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
