import axios from "axios";
import https from "https";

export const httpsAgent = new https.Agent({
	keepAlive: true,
	family: 4
})

export const http = axios.create({
	timeout: 3000,
	httpsAgent
});