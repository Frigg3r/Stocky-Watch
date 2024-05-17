export class ApiService {
    #apiPath = 'http://localhost:3001/api';

    #makeRequest(url, options) {
        return fetch(this.#apiPath + url, {
            ...options,
            credentials: 'include',
            headers: { 'Accept': 'application/json', ...options.headers }
        }).then(response => {
            console.log('ApiService response:', response); // Debugging information
            if (!response.ok) {
                throw new Error('Server responded with an error: ' + response.statusText);
            }
            return response.json().catch(error => {
                throw new Error('Failed to parse JSON response: ' + error);
            });
        }).catch(error => {
            console.error('ApiService error:', error);
            throw error;
        });
    }

    get(url) {
        return this.#makeRequest(url, { method: 'GET' });
    }

    delete(url, data) {
        return this.#makeRequest(url, { method: 'DELETE', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
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

    postToFavorites(userId, itemId) {
        console.log('Adding to favorites:', { userId, itemId }); // Debugging information
        return this.post('/favorites', { userId, itemId });
    }

    getFavorites(userId) {
        return this.get(`/favorites/${userId}`);
    }

    removeFromFavorites(userId, itemId) {
        return this.delete('/favorites', { userId, itemId });
    }

    getCategories() {
        return this.get('/categories');
    }

    getCharacteristics() {
        return this.get('/characteristics');
    }

    getBrands() {
        return this.get('/brands');
    }

    getCountries() {
        return this.get('/countries');
    }

    postPhoto(data) {
        return this.post('/photo', data);
    }

    updatePhoto(id, data) {
        return this.put(`/photo/${id}`, data);
    }
}
