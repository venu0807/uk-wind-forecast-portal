import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  timeout: 30000,
})

export async function fetchActuals(date) {
  const { data } = await api.get('/actuals', { params: { date } })
  return data
}

export async function fetchForecasts(date) {
  const { data } = await api.get('/forecasts', { params: { date } })
  return data
}

export async function fetchAccuracy() {
  const { data } = await api.get('/accuracy')
  return data
}
