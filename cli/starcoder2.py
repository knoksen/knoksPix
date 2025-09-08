import click
import requests
import os
import sys
import json
from typing import Optional

@click.group()
def cli():
    """Starcoder2 CLI - Generate code using Starcoder2 API"""
    pass

@cli.command()
@click.option('--prompt', '-p', required=True, help='The prompt for code generation')
@click.option('--max-tokens', '-m', default=256, help='Maximum number of tokens to generate')
@click.option('--temperature', '-t', default=0.7, help='Sampling temperature')
@click.option('--stream/--no-stream', default=False, help='Stream the output')
@click.option('--api-url', envvar='STARCODER2_API_URL', default='http://localhost:8000', help='API URL')
@click.option('--api-key', envvar='STARCODER2_API_TOKEN', help='API Key for authentication')
def generate(prompt: str, max_tokens: int, temperature: float, stream: bool, api_url: str, api_key: Optional[str]):
    """Generate code using Starcoder2"""
    headers = {'X-API-Key': api_key} if api_key else {}
    
    if stream:
        response = requests.post(
            f"{api_url}/v1/generate",
            json={
                "prompt": prompt,
                "max_new_tokens": max_tokens,
                "temperature": temperature,
                "stream": True
            },
            headers=headers,
            stream=True
        )
        
        for line in response.iter_lines():
            if line:
                line = line.decode('utf-8')
                if line.startswith('data: '):
                    token = line[6:]
                    if token == '[DONE]':
                        break
                    sys.stdout.write(token)
                    sys.stdout.flush()
        print()
    else:
        response = requests.post(
            f"{api_url}/v1/generate",
            json={
                "prompt": prompt,
                "max_new_tokens": max_tokens,
                "temperature": temperature,
                "stream": False
            },
            headers=headers
        )
        
        if response.status_code == 200:
            print(response.json()['generated_text'])
        else:
            print(f"Error: {response.status_code}", file=sys.stderr)
            print(response.text, file=sys.stderr)
            sys.exit(1)

if __name__ == '__main__':
    cli()
