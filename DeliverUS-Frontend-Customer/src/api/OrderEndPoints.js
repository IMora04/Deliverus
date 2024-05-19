import { get, post, put, destroy } from './helpers/ApiRequestsHelper'
function getAll () {
  return get('orders')
}

function getDetail (id) {
  return get(`orders/${id}`)
}

function create (data) {
  return post('orders', data)
}

function edit (id, data) {
  return put(`orders/${id}`, data)
}

function remove (id) {
  return destroy(`orders/${id}`)
}

export { getAll, getDetail, create, edit, remove }
