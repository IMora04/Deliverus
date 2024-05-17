import { get, post, put } from './helpers/ApiRequestsHelper'
function getAll () {
  return get('orders')
}

function getDetail (id) {
  return get(`orders/${id}`)
}

function create (data) {
  return post('orders', data)
}

function edit (id) {
  return put(`orders/${id}`)
}

export { getAll, getDetail, create, edit }
