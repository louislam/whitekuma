import { WhiteKumaServer } from "./whitekuma-server";
import consoleStamp from "console-stamp";

consoleStamp(console, {
    format: ":date().blue :label(7).green"
} );

const server = WhiteKumaServer.getInstance();
server.init();

