import axios from 'axios';

const instance = axios.create ({
    baseURL: 'https://react-burger-911ad-default-rtdb.europe-west1.firebasedatabase.app/'
});

export default instance;