import axios from "axios";

export default axios.create({
    baseURL: 'http://10.10.132.196:8000/api/'
})