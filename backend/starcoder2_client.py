import requests
import json
from typing import List, Dict, Optional, Any, Iterator
import sseclient
import os

class ChatClient:
    def __init__(self, base_url: str = None, token: str = None):
        self.base_url = base_url or os.getenv("STARCODER2_API_BASE", "http://localhost:8000")
        self.token = token or os.getenv("STARCODER2_API_TOKEN", "changeme")
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

    def chat(self, messages: List[Dict[str, str]], stream: bool = False, **kwargs) -> Any:
        url = f"{self.base_url}/v1/chat/completions"
        payload = {
            "messages": messages,
            "stream": stream,
            **kwargs
        }

        if stream:
            response = requests.post(url, json=payload, headers=self.headers, stream=True)
            response.raise_for_status()
            client = sseclient.SSEClient(response)
            return self._process_chat_stream(client)
        
        response = requests.post(url, json=payload, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def generate(self, prompt: str, stream: bool = False, **kwargs) -> Any:
        url = f"{self.base_url}/generate"
        payload = {
            "prompt": prompt,
            "stream": stream,
            **kwargs
        }

        if stream:
            response = requests.post(url, json=payload, headers=self.headers, stream=True)
            response.raise_for_status()
            client = sseclient.SSEClient(response)
            return self._process_generate_stream(client)
        
        response = requests.post(url, json=payload, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def _process_chat_stream(self, client: sseclient.SSEClient) -> Iterator[Dict[str, Any]]:
        for event in client.events():
            if event.data == "[DONE]":
                break
            try:
                yield json.loads(event.data)
            except json.JSONDecodeError:
                continue

    def _process_generate_stream(self, client: sseclient.SSEClient) -> Iterator[Dict[str, Any]]:
        for event in client.events():
            if event.data == "[DONE]":
                break
            try:
                yield json.loads(event.data)
            except json.JSONDecodeError:
                continue

# Example usage:
if __name__ == "__main__":
    client = ChatClient()
    
    # Non-streaming chat example
    response = client.chat([
        {"role": "user", "content": "Write a Python function that adds two numbers."}
    ])
    print("Chat Response:", response["choices"][0]["message"]["content"])
    
    # Streaming chat example
    print("\nStreaming Chat Response:")
    for chunk in client.chat([
        {"role": "user", "content": "Write a Python function that adds two numbers."}
    ], stream=True):
        try:
            content = chunk["choices"][0]["delta"]["content"]
            print(content, end="", flush=True)
        except KeyError:
            continue
    print("\n")
