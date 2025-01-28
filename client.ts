import { TextLineStream } from '@std/streams'

const endpoint = 'ws://0.0.0.0:80'
const ws = new WebSocket(endpoint);

let username: string | null = null;

ws.onopen = async () => {
    console.clear();
    console.log('Connected to chat server.');

    username = prompt('Please enter your username:');

    if (!username) {
        console.log('Username is required');
        ws.close();
        Deno.exit(1);
    }

    ws.send(username);

    console.log("You are now connected to the chat.");
    console.log("Start typing messages...");

    const lines = Deno.stdin.readable.pipeThrough(new TextDecoderStream()).pipeThrough(new TextLineStream());

    try {
        for await (const line of lines) {
            if (line.toLowerCase() === '/quit') {
                ws.close();
                Deno.exit(0);
            }
            ws.send(line);
        }
    } catch(error) {
        console.log('Error loading input:', error);
        ws.close();
        Deno.exit(1);
    }
}

ws.onmessage = (message) => {
    try {
        const parsedMessage = JSON.parse(message.data);
        console.log(`[${parsedMessage.timestamp}] ${parsedMessage.username}: ${parsedMessage.content}`);
    } catch {
        console.log(message.data); //If not JSON just print raw message
    }
}

ws.onclose = () => {
    console.log('Disconnected from server.');
    Deno.exit(0);
}

ws.onerror = (error) => {
    console.log('WebSocket error:', error);
    ws.close();
    Deno.exit(1);
}