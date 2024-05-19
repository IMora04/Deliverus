// eslint-disable-next-line no-unused-vars
import { Order, Product, Restaurant, User, sequelizeSession } from '../models/models.js'
import moment from 'moment'
import { Op } from 'sequelize'

const generateFilterWhereClauses = function (req) {
  const filterWhereClauses = []
  if (req.query.status) {
    switch (req.query.status) {
      case 'pending':
        filterWhereClauses.push({
          startedAt: null
        })
        break
      case 'in process':
        filterWhereClauses.push({
          [Op.and]: [
            {
              startedAt: {
                [Op.ne]: null
              }
            },
            { sentAt: null },
            { deliveredAt: null }
          ]
        })
        break
      case 'sent':
        filterWhereClauses.push({
          [Op.and]: [
            {
              sentAt: {
                [Op.ne]: null
              }
            },
            { deliveredAt: null }
          ]
        })
        break
      case 'delivered':
        filterWhereClauses.push({
          sentAt: {
            [Op.ne]: null
          }
        })
        break
    }
  }
  if (req.query.from) {
    const date = moment(req.query.from, 'YYYY-MM-DD', true)
    filterWhereClauses.push({
      createdAt: {
        [Op.gte]: date
      }
    })
  }
  if (req.query.to) {
    const date = moment(req.query.to, 'YYYY-MM-DD', true)
    filterWhereClauses.push({
      createdAt: {
        [Op.lte]: date.add(1, 'days') // FIXME: se pasa al siguiente día a las 00:00
      }
    })
  }
  return filterWhereClauses
}

// Returns :restaurantId orders
const indexRestaurant = async function (req, res) {
  const whereClauses = generateFilterWhereClauses(req)
  whereClauses.push({
    restaurantId: req.params.restaurantId
  })
  try {
    const orders = await Order.findAll({
      where: whereClauses,
      include: {
        model: Product,
        as: 'products'
      }
    })
    res.json(orders)
  } catch (err) {
    res.status(500).send(err)
  }
}

const indexCustomer = async function (req, res) {
  try {
    const orders = await Order.findAll(
      {
        where: { userId: req.user.id },
        include: [
          {
            model: Product,
            as: 'products'
          },
          {
            model: Restaurant,
            as: 'restaurant'
          }],
        order: [['createdAt', 'DESC']]
      }
    )
    res.json(orders)
  } catch (err) {
    res.status(500).send(err)
  }
}

const getShippingCosts = async (price, restaurantId) => {
  if (price >= 10) {
    return 0
  } else {
    const restaurant = await Restaurant.findByPk(restaurantId)
    return restaurant.shippingCosts
  }
}

const getPrice = async (products) => {
  let priceAcum = 0
  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    let productUnityPrice = await Product.findByPk(product.productId)
    productUnityPrice = productUnityPrice.price
    priceAcum += productUnityPrice * products[i].quantity
  }
  return priceAcum
}

const addProductsToOrderInTransaction = async (products, order, trans) => {
  for (let i = 0; i < products.length; i++) {
    const orderProductInfo = products[i]
    const productToAdd = await Product.findByPk(orderProductInfo.productId)
    await order.addProduct(productToAdd, {
      through: {
        productId: orderProductInfo.productId,
        quantity: orderProductInfo.quantity,
        unityPrice: productToAdd.price
      },
      transaction: trans
    })
  }
  order = await order.reload({
    include: {
      model: Product,
      as: 'products'
    },
    transaction: trans
  })
}

const initializeOrderInTransaction = async (req, trans) => {
  const orderPrice = await getPrice(req.body.products)
  const orderShippingCosts = await getShippingCosts(orderPrice, req.body.restaurantId)

  const newOrder = await Order.build(req.body, { transaction: trans })
  newOrder.userId = req.user.id
  newOrder.shippingCosts = orderShippingCosts
  newOrder.price = orderPrice + orderShippingCosts
  await newOrder.save({ transaction: trans })
  return newOrder
}

const updatedOrderPricesInTransaction = async (req, trans) => {
  const newOrderPrice = await getPrice(req.body.products)
  const order = await Order.findByPk(req.params.orderId)
  const newShippingCosts = await getShippingCosts(newOrderPrice, order.restaurantId)

  await order.update({
    price: newOrderPrice + newShippingCosts,
    shippingCosts: newShippingCosts
  }, { transaction: trans })
  return order
}

const create = async (req, res) => {
  const t = await sequelizeSession.transaction()
  try {
    const newOrder = await initializeOrderInTransaction(req, t)
    await addProductsToOrderInTransaction(req.body.products, newOrder, t)
    await t.commit()
    res.json(newOrder)
  } catch (err) {
    await t.rollback()
    res.status(500).send(err)
  }
}

const update = async function (req, res) {
  const t = await sequelizeSession.transaction()
  try {
    const order = updatedOrderPricesInTransaction(req, t)
    await order.setProducts([], { transaction: t })
    await addProductsToOrderInTransaction(req.body.products, order, t)
    await t.commit()
    res.json(order)
  } catch (err) {
    await t.rollback()
    res.status(500).send(err)
  }
}

const destroy = async function (req, res) {
  try {
    const result = await Order.destroy({ where: { id: req.params.orderId } })
    let message = ''
    if (result === 1) {
      message = 'Successfuly deleted restaurant id.' + req.params.orderId
    } else {
      message = 'Could not delete restaurant.'
    }
    res.json(message)
  } catch (err) {
    res.status(500).send(err)
  }
}

const confirm = async function (req, res) {
  try {
    const order = await Order.findByPk(req.params.orderId)
    order.startedAt = new Date()
    const updatedOrder = await order.save()
    res.json(updatedOrder)
  } catch (err) {
    res.status(500).send(err)
  }
}

const send = async function (req, res) {
  try {
    const order = await Order.findByPk(req.params.orderId)
    order.sentAt = new Date()
    const updatedOrder = await order.save()
    res.json(updatedOrder)
  } catch (err) {
    res.status(500).send(err)
  }
}

const deliver = async function (req, res) {
  try {
    const order = await Order.findByPk(req.params.orderId)
    order.deliveredAt = new Date()
    const updatedOrder = await order.save()
    const restaurant = await Restaurant.findByPk(order.restaurantId)
    const averageServiceTime = await restaurant.getAverageServiceTime()
    await Restaurant.update({ averageServiceMinutes: averageServiceTime }, { where: { id: order.restaurantId } })
    res.json(updatedOrder)
  } catch (err) {
    res.status(500).send(err)
  }
}

const show = async function (req, res) {
  try {
    const order = await Order.findByPk(req.params.orderId, {
      include: [{
        model: Restaurant,
        as: 'restaurant',
        attributes: ['name', 'description', 'address', 'postalCode', 'url', 'shippingCosts', 'averageServiceMinutes', 'email', 'phone', 'logo', 'heroImage', 'status', 'restaurantCategoryId']
      },
      {
        model: User,
        as: 'user',
        attributes: ['firstName', 'email', 'avatar', 'userType']
      },
      {
        model: Product,
        as: 'products'
      }]
    })
    res.json(order)
  } catch (err) {
    res.status(500).send(err)
  }
}

const analytics = async function (req, res) {
  const yesterdayZeroHours = moment().subtract(1, 'days').set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
  const todayZeroHours = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
  try {
    const numYesterdayOrders = await Order.count({
      where:
      {
        createdAt: {
          [Op.lt]: todayZeroHours,
          [Op.gte]: yesterdayZeroHours
        },
        restaurantId: req.params.restaurantId
      }
    })
    const numPendingOrders = await Order.count({
      where:
      {
        startedAt: null,
        restaurantId: req.params.restaurantId
      }
    })
    const numDeliveredTodayOrders = await Order.count({
      where:
      {
        deliveredAt: { [Op.gte]: todayZeroHours },
        restaurantId: req.params.restaurantId
      }
    })

    const invoicedToday = await Order.sum(
      'price',
      {
        where:
        {
          createdAt: { [Op.gte]: todayZeroHours }, // FIXME: Created or confirmed?
          restaurantId: req.params.restaurantId
        }
      })
    res.json({
      restaurantId: req.params.restaurantId,
      numYesterdayOrders,
      numPendingOrders,
      numDeliveredTodayOrders,
      invoicedToday
    })
  } catch (err) {
    res.status(500).send(err)
  }
}

const OrderController = {
  indexRestaurant,
  indexCustomer,
  create,
  update,
  destroy,
  confirm,
  send,
  deliver,
  show,
  analytics
}
export default OrderController
