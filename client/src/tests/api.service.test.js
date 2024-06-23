// /src/tests/api.service.test.js
import { ApiService } from '../services/api.service';

describe('ApiService', () => {
  let apiService;
  const mockFetch = jest.fn();

  beforeEach(() => {
    global.fetch = mockFetch;
    apiService = new ApiService();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('должен получить данные с методом GET', async () => {
    const mockResponse = { data: 'тест' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const data = await apiService.get('/test');
    expect(data).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/test'), expect.any(Object));
  });

  test('должен обрабатывать ошибки в методе GET', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Не найдено',
    });

    await expect(apiService.get('/test')).rejects.toThrow('Сервер ответил с ошибкой: Не найдено');
  });

  test('должен отправлять данные с методом POST', async () => {
    const mockData = { name: 'тест' };
    const mockResponse = { id: 1, ...mockData };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const data = await apiService.post('/test', mockData);
    expect(data).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(mockData),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      })
    );
  });

  test('должен обрабатывать ошибки в методе POST', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Внутренняя ошибка сервера',
    });

    await expect(apiService.post('/test', { name: 'тест' })).rejects.toThrow('Сервер ответил с ошибкой: Внутренняя ошибка сервера');
  });

  test('должен удалять данные с методом DELETE', async () => {
    const mockResponse = { success: true };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const data = await apiService.delete('/test', { id: 1 });
    expect(data).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        method: 'DELETE',
        body: JSON.stringify({ id: 1 }),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      })
    );
  });

  test('должен обрабатывать ошибки в методе DELETE', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Неавторизован',
    });

    await expect(apiService.delete('/test', { id: 1 })).rejects.toThrow('Сервер ответил с ошибкой: Неавторизован');
  });
});
