const eventSource = new EventSource('http://localhost:3000/stream')

eventSource.onmessage = (e) => console.info(e)
eventSource.onerror = (e) => console.error(e)
