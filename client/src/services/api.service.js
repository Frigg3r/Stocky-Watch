export class ApiService {
    #apiPath = 'http://localhost:3001/api';

    #makeRequest(url, options) {
        return fetch(this.#apiPath + url, {
            ...options,
            credentials: 'include',
            headers: { 'Accept': 'application/json', ...options.headers }
        }).then(response => {
            if (!response.ok) {
                throw new Error('Server responded with an error: ' + response.statusText);
            }
            return response.json().catch(error => {
                throw new Error('Failed to parse JSON response: ' + error);
            });
        });
    }
    

    get(url) {
        return this.#makeRequest(url, { method: 'GET' });
    }

    delete(url) {
        return this.#makeRequest(url, { method: 'DELETE' });
    }

    post(url, data) {
        return this.#makeRequest(url, {
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            method: 'POST'
        });
    }

    put(url, data) {
        return this.#makeRequest(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    }
    
}


