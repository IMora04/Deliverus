import { get, post } from './helpers/ApiRequestsHelper'
function getAll () {
  return get('orders')
}

function getDetail (id) {
  return get(`orders/${id}`)
}

function create (data) {
  return post('orders', data)
}

export { getAll, getDetail, create }
