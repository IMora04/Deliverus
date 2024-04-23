import { get } from './helpers/ApiRequestsHelper'
function getAll () {
  return get('orders')
}

function getDetail (id) {
  return get(`orders/${id}`)
}

export { getAll, getDetail }
