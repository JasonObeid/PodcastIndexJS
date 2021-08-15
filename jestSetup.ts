import { Crypto } from "@peculiar/webcrypto";
import fetch from "node-fetch";
import "core-js/stable";
import "regenerator-runtime/runtime";

global.crypto = new Crypto();
global.fetch = fetch;

process.env.API_KEY = "";
process.env.API_SECRET = "";

jest.setTimeout(10000);
